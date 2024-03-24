import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface IInitialState {
    isSelected: boolean,
    isImageLoading: boolean,
    activeView: string,
}


const initialState: IInitialState = {
    isSelected: false,
    isImageLoading: false,
    activeView: 'front',
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
        }
    }
})


export const { actions, reducer } = constructorSlice;