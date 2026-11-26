import { ICdekPointsResponse, IProduct } from "@/app/utils/types";
import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ICartOrderElement } from "@/app/utils/types";
import { ICdekCitySearchResponse } from "@/app/utils/types";
import { normalizeCartOrder } from "@/app/utils/cart-normalize";

interface IInitialState {
    order?: Array<ICartOrderElement>,
    /** Корзина уже прочитана из хранилища браузера (см. cart-persist): до этого пустой order ещё ничего не значит */
    hydrated: boolean,
    userData: {
        name: string,
        surname: string,
        phone: string,
        email: string,
        telegram: string,
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
    hydrated: false,
    userData: {
        name: '',
        surname: '',
        phone: '',
        email: '',
        telegram: '',
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
        },
        deleteItemFromCart: (state, action: PayloadAction<{ itemCartId: string }>) => {
           let newStateOrder = state.order?.filter(item => item.itemCartId !== action.payload.itemCartId);
           return {
            ...state,
            order: newStateOrder
           };
        },
        /** Плюс или минус одна штука размера прямо в корзине: не больше остатка и не меньше одной штуки на позицию */
        changeSizeQty: (state, action: PayloadAction<{ itemCartId: string, name: string, delta: 1 | -1 }>) => {
            const { itemCartId, name, delta } = action.payload;
            const elem = state.order?.find((entry) => entry.itemCartId === itemCartId);
            const size = elem?.item.sizes.find((entry) => entry.name === name);
            if (!elem || !size) return;
            const total = elem.item.sizes.reduce((sum, entry) => sum + (entry.userQty ?? 0), 0);
            const next = (size.userQty ?? 0) + delta;
            if (next < 0 || next > size.qty || (delta < 0 && total <= 1)) return;
            size.userQty = next;
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
            return {...initialState, hydrated: true};
        },
        restoreCart: (state, action: PayloadAction<Array<ICartOrderElement>>) => {
            return {
                ...state,
                order: normalizeCartOrder(action.payload),
                hydrated: true,
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