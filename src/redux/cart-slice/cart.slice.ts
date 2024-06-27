import { ICdekPointsResponse, IProduct } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICartOrderElement, TParams } from "@/app/utils/types";
import { IUploadPrintResponse } from "@/app/utils/types";
import { setCoords } from "@/app/utils/constructor-utils";
import { getPrintFormatAndPriceFunc } from "@/app/utils/constructor-utils";
import { IStageParams, ICdekCitySearchResponse } from "@/app/utils/types";
import { apiBaseUrl } from "@/app/utils/constants";

interface IInitialState {
    order?: Array<ICartOrderElement>,
    userData: {
        name: string,
        surname: string,
        phone: string,
        email: string,
    },
    paymentUrl: string,
    user_promocode: string,
    isPromocodeLoading?: boolean,
    promocodeFail?: boolean,
    isDelivery: boolean,
    deliveryParams: {
        userCitySearchQuery: string,
        validCityFrom?: ICdekCitySearchResponse,
        validCityTo?: ICdekCitySearchResponse,
        validDeliveryPoint?: ICdekPointsResponse,
        deliveryPrice: number,
    },
    validPromoCode: {
      discount_ratio: number,
      discounted_item: string,
      mechanic: string,
      message: string,
      name: string,
      qty?: number,
      discount: string,
      _id: string,
    },
    orderPrice?: {},
}

export type TCartState = IInitialState;


const initialState: IInitialState = {
    order: [],
    userData: {
        name: '',
        surname: '',
        phone: '',
        email: '',
    },
    user_promocode: '',
    paymentUrl: '',
    orderPrice: {},
    isDelivery: false,
    deliveryParams: {
        userCitySearchQuery: '',
        deliveryPrice: 0,
    },
    validPromoCode: {
        discount_ratio: 1,
        discounted_item: 'all',
        mechanic: 'discount',
        message: '',
        name: '',
        qty: 0,
        discount: '',
        _id: '',
    }
}

const cartSlice = createSlice({
    name: 'cart',
    initialState,
    reducers: {
        addToCartWithoutPrint: (state, action: PayloadAction<{ itemCartId: string, item: IProduct, isItemWithPrint: boolean}>) => {
            state.order?.push(action.payload)
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        addToCartWithPrint: (state, action: PayloadAction<{ itemCartId: string, item: IProduct, isItemWithPrint: boolean}>) => {
            state.order?.push(action.payload)
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        deletePrint: (state, action: PayloadAction<{activeView: string, itemCartId: string}>) => {

            state.order?.forEach((item) => {
                if (item.itemCartId === action.payload.itemCartId) {
                    //@ts-ignore
                    item.prints![action.payload.activeView] = undefined;
                }
            })
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        setPrint: (state, action: PayloadAction<{print: IUploadPrintResponse, activeView: string, itemCartId: string, itemType: string, itemColor: string }>) => {
            const { print, activeView, itemCartId, itemType, itemColor } = action.payload;
            const coordsData = {
                    name: print.data.name,
                    url: print.data.url,
                    width: print.data.width,
                    height: print.data.height
            }
            const initStageParams = setCoords(coordsData, activeView, itemType);
            const initCartParams = getPrintFormatAndPriceFunc(initStageParams, activeView, itemColor)
            const printToAdd = 
            {
                file: {
                    name: print.data.name,
                    url: print.data.url,
                    width: print.data.width,
                    height: print.data.height
                },
                stageParams: initStageParams,
                cartParams: initCartParams,
            }

            state.order?.forEach((elem) => {
                if (elem.itemCartId === itemCartId) {
                    // @ts-ignore
                    elem.prints![activeView] = printToAdd;
                }
            })
        },
        updateStageParams: (state, action: PayloadAction<{newAttrs: TParams, activeView: string, itemCartId: string}>) => {
            const { newAttrs, activeView, itemCartId } = action.payload;
            state.order?.forEach((elem) => {
                if (elem.itemCartId === itemCartId) {
                    // @ts-ignore
                    elem.prints[activeView].stageParams = newAttrs;
                }
            })
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        updateCartParams: (state, action: PayloadAction<{newAttrs: TParams, activeView: string, itemColor: string, itemCartId: string}>) => {
            const { newAttrs, activeView, itemColor, itemCartId } = action.payload;
            const newCartParams = getPrintFormatAndPriceFunc(newAttrs, activeView, itemColor);
            state.order?.forEach((elem) => {
                if (elem.itemCartId === itemCartId) {
                    // @ts-ignore
                    elem.prints[activeView].cartParams = newCartParams;
                }
            })
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        setPreview: (state, action: PayloadAction<{preview: IUploadPrintResponse, activeView: string, itemCartId: string }>) => {
            const { preview, activeView, itemCartId} = action.payload;
            //console.log(`${apiBaseUrl}${preview.data.url}`);
            state.order?.forEach((elem) => {
                if (elem.itemCartId === itemCartId) {
                    // @ts-ignore
                    elem.prints![activeView].preview = `${apiBaseUrl}${preview.data.url}`;
                }
            })
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        deleteItemFromCart: (state, action: PayloadAction<{ itemCartId: string }>) => {
           let newStateOrder = state.order?.filter(item => item.itemCartId !== action.payload.itemCartId);
           sessionStorage.setItem('order', JSON.stringify(newStateOrder));
           return {
            ...state,
            order: newStateOrder
           };
        },
        setDelivery: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                isDelivery: action.payload,
            }
        },
        setCdekCitySearchUserQuery: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                deliveryParams: {
                    ...state.deliveryParams,
                    userCitySearchQuery: action.payload,
                }
            }
        },
        setValidCity: (state, action: PayloadAction<{validCityFrom: ICdekCitySearchResponse, validCityTo: ICdekCitySearchResponse}>) => {
            state.deliveryParams.validCityFrom = action.payload.validCityFrom;
            state.deliveryParams.validCityTo = action.payload.validCityTo;
        },
        resetValidCity: (state) => {
            state.deliveryParams.validCityTo = undefined;
        },
        setValidDeliveryPoint: (state, action: PayloadAction<ICdekPointsResponse>) => {
            state.deliveryParams.validDeliveryPoint = action.payload;
        },
        resetValidDeliveryPoint: (state) => {
            state.deliveryParams.validDeliveryPoint = undefined;
        },
        setUserData: (state, action: PayloadAction<{ id: string, value: string}>) => {
            const { id, value} = action.payload;
            //@ts-ignore
            state.userData[id] = value;
        },
        setDeliveryPrice: (state, action: PayloadAction<number>) => {
            state.deliveryParams.deliveryPrice = action.payload;
        },
        setPaymentURL: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                paymentUrl: action.payload
            }
        },
        resetCart: () => {
            return {...initialState};
        },
        restoreCart: (state, action: PayloadAction<Array<ICartOrderElement>>) => {
            return {
                ...state,
                order: action.payload
            }
        },
        setUserPromocode: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                user_promocode: action.payload
            }
        },
        setValidPromocode: (state, action: PayloadAction<typeof initialState.validPromoCode>) => {
            return {
                ...state,
                validPromoCode: action.payload
            }
        },
        resetValidPromocode: (state) => {
            return {
                ...state,
                validPromoCode: initialState.validPromoCode
            }
        } 
    }
})


export const { actions, reducer } = cartSlice;