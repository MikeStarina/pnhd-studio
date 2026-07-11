import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IPrintFile, IUploadPrintResponse } from "@/app/utils/types";
import { setCoords, getPrintFormatAndPriceFunc } from "@/app/utils/constructor-utils";

interface IInitialState {
    isMobileMenuActive: boolean,
    sizes?: Array<{name: string, qty: number, userQty: number}>,
    isCartVisible: boolean,
    isPopupVisible: boolean,
    popupType: 'lead' | 'auth' | '',
    popupTitle: string,
    prints?: { front?: IPrintFile, back?: IPrintFile, lsleeve?: IPrintFile, rsleeve?: IPrintFile },
    isPrintImageLoading: boolean,
}

const initialState: IInitialState = {
    isMobileMenuActive: false,
    isCartVisible: false,
    isPopupVisible: false,
    popupType: '',
    popupTitle: '',
    prints: {},
    isPrintImageLoading: false,
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
        setPopupType: (state, action: PayloadAction<'lead' | 'auth' | ''>) => {
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
        },
        setPrint: (state, action: PayloadAction<{ print: IUploadPrintResponse, tab: string, itemType: string, itemColor: string }>) => {
            const { print, tab, itemType, itemColor } = action.payload;
            const coordsData = {
                name: print.data.name,
                url: print.data.url,
                width: print.data.width,
                height: print.data.height,
            };
            const initStageParams = setCoords(coordsData, tab, itemType);
            const initCartParams = getPrintFormatAndPriceFunc(initStageParams, tab, itemColor);
            const printToAdd = {
                file: {
                    name: print.data.name,
                    url: print.data.url,
                    width: print.data.width,
                    height: print.data.height,
                },
                stageParams: initStageParams,
                cartParams: initCartParams,
            };
            if (!state.prints) {
                state.prints = {};
            }
            // @ts-ignore
            state.prints[tab] = printToAdd;
        },
        deletePrintTab: (state, action: PayloadAction<{ tab: string }>) => {
            const { tab } = action.payload;
            if (state.prints) {
                // @ts-ignore
                state.prints[tab] = undefined;
            }
        },
        resetPrints: (state) => {
            state.prints = {};
        },
        printImageLoaderToggler: (state) => {
            state.isPrintImageLoading = !state.isPrintImageLoading;
        }
    }
})

export const { actions, reducer } = utilsSlice;