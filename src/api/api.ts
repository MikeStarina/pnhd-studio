import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiBaseUrl } from "@/app/utils/constants";
import {
  IUploadPrintResponse,
  ICdekCitySearchResponse,
  ICdekPointsResponse,
  ICdekPriceResponse,
  IOrderBody,
  IProduct,
  TProductInput,
  IBanner,
  TBannerInput,
  IBlogPost,
  TBlogPostInput,
} from "@/app/utils/types";

export interface IAuthUser {
  _id: string;
  email: string;
  name: string;
  phone: string;
  role: "admin" | "user";
  isVerified: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface IUserResponse {
  user: IAuthUser;
}

export type TOtpPurpose = "register" | "reset" | "change";

export const api = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({ baseUrl: apiBaseUrl, credentials: "include" }),
  tagTypes: ["Auth", "Products", "Banners", "Blog"],
  endpoints: (builder) => ({
    register: builder.mutation<
      { message: string; email: string },
      { email: string; name: string; phone: string; password: string }
    >({
      query: (data) => ({
        url: "/api/auth/register",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    }),
    verifyOtp: builder.mutation<
      { message: string },
      { email: string; code: string }
    >({
      query: (data) => ({
        url: "/api/auth/verify-otp",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    }),
    resendOtp: builder.mutation<
      { message: string },
      { email: string; purpose: TOtpPurpose }
    >({
      query: (data) => ({
        url: "/api/auth/resend-otp",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    }),
    login: builder.mutation<
      IUserResponse,
      { email: string; password: string }
    >({
      query: (data) => ({
        url: "/api/auth/login",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
      // Seed getMe cache from login — do not invalidate/refetch /me immediately
      // (cookie may not be readable yet / cross-site 401 would wipe the session).
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          dispatch(api.util.upsertQueryData("getMe", undefined, data));
        } catch {
          /* login failure — leave cache alone */
        }
      },
    }),
    logout: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/api/auth/logout",
        method: "POST",
      }),
      invalidatesTags: ["Auth"],
    }),
    getMe: builder.query<IUserResponse, void>({
      query: () => ({
        url: "/api/auth/me",
        method: "GET",
      }),
      providesTags: ["Auth"],
    }),
    forgotPassword: builder.mutation<{ message: string }, { email: string }>({
      query: (data) => ({
        url: "/api/auth/forgot-password",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    }),
    resetPassword: builder.mutation<
      { message: string },
      { email: string; code: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    }),
    requestChangePassword: builder.mutation<{ message: string }, void>({
      query: () => ({
        url: "/api/auth/change-password/request",
        method: "POST",
      }),
    }),
    changePassword: builder.mutation<
      { message: string },
      { code: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/api/auth/change-password",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
    }),
    uploadPrintImage: builder.mutation<IUploadPrintResponse, FormData>({
      query: (data) => ({
        url: "/api/uploads/",
        method: "POST",
        body: data,
      }),
    }),
    getCdekCitiesData: builder.query<Array<ICdekCitySearchResponse>, string>({
      query: (data) => ({
        url: `/api/shipping/cities?city=${data}`,
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }),
      transformResponse: (
        response: Array<ICdekCitySearchResponse>
      ): Array<ICdekCitySearchResponse> => {
        const russiaCitiesArr = response.filter(
          (item) => item.country === "Россия"
        );
        return russiaCitiesArr;
      },
    }),
    getCdekPoints: builder.query<Array<ICdekPointsResponse>, number>({
      query: (data) => ({
          url: `/api/shipping/points?city_code=${data}`,
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
    }),
    getCdekDeliveryPrice: builder.query<ICdekPriceResponse, {orderWeightArr: Array<{weight: number}>, cityTo: ICdekCitySearchResponse, totalPrice: number}>({
      query: (priceData) => {

        const data = {
            tariff_code: '138',
            from_location: {
              code: '137',
            },
            to_location: {
              code: priceData.cityTo.code.toString(),
            },
            services: [
              {
                code: 'INSURANCE',
                parameter: priceData.totalPrice.toString(),
              },
            ],
            packages: [...priceData.orderWeightArr],
        }


        return {
            url: "/api/shipping/calculate/",
            method: "POST",
            body: JSON.stringify(data),
            headers: {
            "Content-Type": "application/json",
            },
      }},
    }),
    createOrder: builder.mutation<{id: string, paymentUrl: string}, IOrderBody>({
      query: (data) => ({
        url: '/api/orders',
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Content-length': '',
        },
      }),
    }),
    createLead: builder.mutation<
      { message: string },
      {
        name: string;
        phone: string;
        roistat: string;
        email?: string;
        comment?: string;
        reference_url?: string;
      }
    >({
      query: (data) => ({
        url: '/api/leads/',
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Content-length': '',
        },
      })
    }),
    getGalleryImages: builder.query<Array<{id: string, src: string, alt: string}>, void>({
      query: () => ({
        url: '/api/gallery/',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }),
    }),
    promocodeValidation: builder.mutation<unknown, {user_promocode: string}>({
      query: (data) => ({
        url: '/api/promocodes/',
        method: 'POST',
        body: JSON.stringify(data),
        headers: {
          'Content-Type': 'application/json',
          'Content-length': '',
        },
      })
    }),
    getProducts: builder.query<{ data: IProduct[] }, void>({
      query: () => ({
        url: "/api/products",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Products" as const,
                id: _id,
              })),
              { type: "Products", id: "LIST" },
            ]
          : [{ type: "Products", id: "LIST" }],
    }),
    getProductById: builder.query<{ data: IProduct }, string>({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Products", id }],
    }),
    createProduct: builder.mutation<{ data: IProduct }, TProductInput>({
      query: (body) => ({
        url: "/api/products",
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    updateProduct: builder.mutation<
      { data: IProduct },
      { id: string; body: Partial<TProductInput> }
    >({
      query: ({ id, body }) => ({
        url: `/api/products/${id}`,
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Products", id },
        { type: "Products", id: "LIST" },
      ],
    }),
    deleteProduct: builder.mutation<
      { message: string; data: IProduct },
      string
    >({
      query: (id) => ({
        url: `/api/products/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Products", id: "LIST" }],
    }),
    getBanners: builder.query<{ data: IBanner[] }, void>({
      query: () => ({
        url: "/api/banners",
        method: "GET",
      }),
      providesTags: [{ type: "Banners", id: "PUBLIC" }],
    }),
    getAdminBanners: builder.query<{ data: IBanner[] }, void>({
      query: () => ({
        url: "/api/banners/admin",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Banners" as const,
                id: _id,
              })),
              { type: "Banners", id: "LIST" },
            ]
          : [{ type: "Banners", id: "LIST" }],
    }),
    getBannerById: builder.query<{ data: IBanner }, string>({
      query: (id) => ({
        url: `/api/banners/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Banners", id }],
    }),
    createBanner: builder.mutation<{ data: IBanner }, TBannerInput>({
      query: (body) => ({
        url: "/api/banners",
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: [
        { type: "Banners", id: "LIST" },
        { type: "Banners", id: "PUBLIC" },
      ],
    }),
    updateBanner: builder.mutation<
      { data: IBanner },
      { id: string; body: Partial<TBannerInput> }
    >({
      query: ({ id, body }) => ({
        url: `/api/banners/${id}`,
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Banners", id },
        { type: "Banners", id: "LIST" },
        { type: "Banners", id: "PUBLIC" },
      ],
    }),
    deleteBanner: builder.mutation<
      { message: string; data: IBanner },
      string
    >({
      query: (id) => ({
        url: `/api/banners/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [
        { type: "Banners", id: "LIST" },
        { type: "Banners", id: "PUBLIC" },
      ],
    }),
    uploadBannerImage: builder.mutation<{ data: { url: string } }, FormData>({
      query: (data) => ({
        url: "/api/banners/upload",
        method: "POST",
        body: data,
      }),
    }),
    getAdminBlogs: builder.query<{ data: IBlogPost[] }, void>({
      query: () => ({
        url: "/api/blog/admin",
        method: "GET",
      }),
      providesTags: (result) =>
        result
          ? [
              ...result.data.map(({ _id }) => ({
                type: "Blog" as const,
                id: _id,
              })),
              { type: "Blog", id: "LIST" },
            ]
          : [{ type: "Blog", id: "LIST" }],
    }),
    getBlogById: builder.query<{ data: IBlogPost }, string>({
      query: (id) => ({
        url: `/api/blog/${id}`,
        method: "GET",
      }),
      providesTags: (_result, _error, id) => [{ type: "Blog", id }],
    }),
    createBlog: builder.mutation<{ data: IBlogPost }, TBlogPostInput>({
      query: (body) => ({
        url: "/api/blog",
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: [{ type: "Blog", id: "LIST" }],
    }),
    updateBlog: builder.mutation<
      { data: IBlogPost },
      { id: string; body: Partial<TBlogPostInput> }
    >({
      query: ({ id, body }) => ({
        url: `/api/blog/${id}`,
        method: "PATCH",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: "Blog", id },
        { type: "Blog", id: "LIST" },
      ],
    }),
    deleteBlog: builder.mutation<
      { message: string; data: IBlogPost },
      string
    >({
      query: (id) => ({
        url: `/api/blog/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: [{ type: "Blog", id: "LIST" }],
    }),
    uploadBlogCover: builder.mutation<{ data: { url: string } }, FormData>({
      query: (data) => ({
        url: "/api/blog/upload-cover",
        method: "POST",
        body: data,
      }),
    }),
  }),
});

export const {
  useUploadPrintImageMutation,
  useGetCdekCitiesDataQuery,
  useGetCdekPointsQuery,
  useGetCdekDeliveryPriceQuery,
  useGetGalleryImagesQuery,
  useCreateOrderMutation,
  useCreateLeadMutation,
  usePromocodeValidationMutation,
  useRegisterMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useLoginMutation,
  useLogoutMutation,
  useGetMeQuery,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestChangePasswordMutation,
  useChangePasswordMutation,
  useGetProductsQuery,
  useGetProductByIdQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useDeleteProductMutation,
  useGetBannersQuery,
  useGetAdminBannersQuery,
  useGetBannerByIdQuery,
  useCreateBannerMutation,
  useUpdateBannerMutation,
  useDeleteBannerMutation,
  useUploadBannerImageMutation,
  useGetAdminBlogsQuery,
  useGetBlogByIdQuery,
  useCreateBlogMutation,
  useUpdateBlogMutation,
  useDeleteBlogMutation,
  useUploadBlogCoverMutation,
} = api;
