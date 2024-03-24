import { createSlice, PayloadAction } from "@reduxjs/toolkit";


interface ILeadSlice {
    name: string,
    phone: string,
    isAgreedWithPrivacyPolicy: boolean,
}


const initialState: ILeadSlice = {
    name: '',
    phone: '',
    isAgreedWithPrivacyPolicy: true,
}


const leadSlice = createSlice({
    name: 'leads',
    initialState,
    reducers: {
        setUserData: (state, action: PayloadAction<{id: string, value: string}>) => {
            return {
                ...state,
                [action.payload.id]: action.payload.value
            }
        },
        setPrivacyPolicyAgreement: (state) => {
            return {
                ...state,
                isAgreedWithPrivacyPolicy: !state.isAgreedWithPrivacyPolicy
            }
        },
        resetLeadData: (state) => {
            return initialState;
        }
    }
})

export const { actions, reducer } = leadSlice;