import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IInitialState {
    isMobileMenuActive: boolean,
    sizes?: Array<{name: string, qty: number, userQty: number}>,
    isCartVisible: boolean,
    isPopupVisible: boolean,
    popupType: 'lead' | '',
    popupTitle: string,
}

const initialState: IInitialState = {
    isMobileMenuActive: false,
    isCartVisible: false,
    isPopupVisible: false,
    popupType: '',
    popupTitle: '',
}




const utilsSlice = createSlice({
    name: 'utils',
    initialState,
    reducers: {
        setMobileMenuActive: (state, action: PayloadAction<boolean>) => {
            
            return {
                ...state,
                isMobileMenuActive: action.payload,
            }
        },
        setInitialSizes: (state, action: PayloadAction<Array<{name: string, qty: number, userQty: number}>>) => {
            return {
                ...state,
                sizes: action.payload
            }
        },
        resetStateSizes: (state) => {
            state.sizes = [];
        },
        updateSizes: (state, action: PayloadAction<{ id: string, name: string }>) => {

            state.sizes?.forEach((item) => {
                if (item.name === action.payload.name) {
                    if (action.payload.id === 'increase' && item.userQty < item.qty) item.userQty += 1;
                    if (action.payload.id === 'decrease' && item.userQty > 0) item.userQty -= 1;
                }
            })
        },
        setCartVisibility: (state, action: PayloadAction<boolean>) => {
            
        },
        setPopupVisibility: (state) => {
            return {
                ...state,
                isPopupVisible: !state.isPopupVisible
            }
        },
        setPopupType: (state, action: PayloadAction<'lead' | ''>) => {
            return {
                ...state,
                popupType: action.payload
            }
        },
        setPopupTitle: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                popupTitle: action.payload
            }
        }
    }
})

export const { actions, reducer } = utilsSlice;