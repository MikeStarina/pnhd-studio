import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { apiBaseUrl } from "@/app/utils/constants";
import {
  IUploadPrintResponse,
  ICdekCitySearchResponse,
  ICdekPointsResponse,
  ICdekPriceResponse,
  IOrderBody,
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
  tagTypes: ["Auth"],
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
    verifyOtp: builder.mutation<IUserResponse, { email: string; code: string }>({
      query: (data) => ({
        url: "/api/auth/verify-otp",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Auth"],
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
      invalidatesTags: ["Auth"],
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
      IUserResponse,
      { email: string; code: string; newPassword: string }
    >({
      query: (data) => ({
        url: "/api/auth/reset-password",
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      }),
      invalidatesTags: ["Auth"],
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
} = api;
