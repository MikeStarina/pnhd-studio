import { ICdekPointsResponse, IProduct } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICartOrderElement, TParams } from "@/app/utils/types";
import { IUploadPrintResponse } from "@/app/utils/types";
import { setCoords } from "@/app/utils/constructor-utils";
import { getPrintFormatAndPriceFunc } from "@/app/utils/constructor-utils";
import { IStageParams, ICdekCitySearchResponse } from "@/app/utils/types";
import { normalizeCartOrder } from "@/app/utils/cart-normalize";

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
        deletePrint: (state, action: PayloadAction<{printId?: string, itemCartId: string}>) => {
            state.order = normalizeCartOrder(state.order ?? []);
            state.order.forEach((item) => {
                if (item.itemCartId !== action.payload.itemCartId || !action.payload.printId) return;
                item.prints = (item.prints ?? []).filter((print) => print.id !== action.payload.printId);
            });
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        setPrint: (state, action: PayloadAction<{print: IUploadPrintResponse, id?: string, itemCartId: string, itemType: string, itemColor: string }>) => {
            const { print, itemCartId, itemType, itemColor } = action.payload;
            const id = action.payload.id || `print-${Date.now()}`;
            const coordsData = {
                    name: print.data.name,
                    url: print.data.url,
                    width: print.data.width,
                    height: print.data.height
            }
            const initStageParams = setCoords(coordsData, 'front', itemType);
            initStageParams.deltaZ = 0.12;
            initStageParams.decalScale = [initStageParams.decalScale[0], initStageParams.decalScale[1], 0.12];
            const initCartParams = getPrintFormatAndPriceFunc(initStageParams, itemColor)
            const printToAdd = {
                id,
                file: {
                    name: print.data.name,
                    url: print.data.url,
                    width: print.data.width,
                    height: print.data.height
                },
                stageParams: initStageParams,
                cartParams: initCartParams,
                needsPlacement: true,
            }

            state.order = normalizeCartOrder(state.order ?? []);
            state.order.forEach((elem) => {
                if (elem.itemCartId === itemCartId) {
                    elem.prints = [...(elem.prints ?? []), printToAdd];
                    elem.isItemWithPrint = true;
                }
            })
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        updateStageParams: (state, action: PayloadAction<{newAttrs: TParams, printId: string, itemCartId: string}>) => {
            const { newAttrs, printId, itemCartId } = action.payload;
            state.order = normalizeCartOrder(state.order ?? []);
            state.order.forEach((elem) => {
                if (elem.itemCartId !== itemCartId) return;
                const print = elem.prints?.find((item) => item.id === printId);
                if (!print) return;
                print.stageParams = newAttrs;
                print.needsPlacement = false;
            })
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        updateCartParams: (state, action: PayloadAction<{newAttrs: TParams, printId: string, itemColor: string, itemCartId: string}>) => {
            const { newAttrs, printId, itemColor, itemCartId } = action.payload;
            const newCartParams = getPrintFormatAndPriceFunc(newAttrs, itemColor);
            state.order = normalizeCartOrder(state.order ?? []);
            state.order.forEach((elem) => {
                if (elem.itemCartId !== itemCartId) return;
                const print = elem.prints?.find((item) => item.id === printId);
                if (!print) return;
                print.cartParams = newCartParams;
            })
            sessionStorage.setItem('order', JSON.stringify(state.order));
        },
        setPreview: (state, action: PayloadAction<{preview: IUploadPrintResponse, activeView?: string, itemCartId: string }>) => {
            if (!action.payload.preview?.data?.url || !state.order) return;
        },
        deleteItemFromCart: (state, action: PayloadAction<{ itemCartId: string }>) => {
           let newStateOrder = state.order?.filter(item => item.itemCartId !== action.payload.itemCartId);
           sessionStorage.setItem('order', JSON.stringify(newStateOrder));
           return {
            ...state,
            order: newStateOrder
           };
        },
        updateCartItem: (state, action: PayloadAction<{
            itemCartId: string,
            sizes: IProduct['sizes'],
            prints?: ICartOrderElement['prints'],
            isItemWithPrint: boolean,
        }>) => {
            const { itemCartId, sizes, prints, isItemWithPrint } = action.payload;
            state.order?.forEach((elem) => {
                if (elem.itemCartId === itemCartId) {
                    elem.item.sizes = sizes;
                    if (prints) {
                        elem.prints = prints;
                        elem.isItemWithPrint = true;
                    } else if (!isItemWithPrint) {
                        elem.prints = undefined;
                        elem.isItemWithPrint = false;
                    } else {
                        elem.isItemWithPrint = true;
                    }
                }
            });
            sessionStorage.setItem('order', JSON.stringify(state.order));
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
            const order = normalizeCartOrder(action.payload);
            sessionStorage.setItem('order', JSON.stringify(order));
            return {
                ...state,
                order,
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