import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface IInitialState {
    isSelected: boolean,
    isImageLoading: boolean,
    activeView: string,
    previewMode: boolean,
    selectedPrintId: string | null,
}


const initialState: IInitialState = {
    isSelected: false,
    isImageLoading: false,
    activeView: 'front',
    previewMode: false,
    selectedPrintId: null,
};

const constructorSlice = createSlice({
    name: 'constructor',
    initialState,
    reducers: {
        imageSelectToggler: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                isSelected: action.payload,
            }
        },
        imageLoaderToggler: (state) => {
            return {
                ...state,
                isImageLoading: !state.isImageLoading,
            }
        },
        setActiveView: (state, action: PayloadAction<string>) => {
            return {
                ...state,
                activeView: action.payload,
            }
        },
        setPreviewMode: (state, action: PayloadAction<boolean>) => {
            return {
                ...state,
                previewMode: action.payload
            }
        },
        setSelectedPrintId: (state, action: PayloadAction<string | null>) => {
            state.selectedPrintId = action.payload;
        },
    }
})


export const { actions, reducer } = constructorSlice;