import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { IAuthUser } from "@/api/api";

export type TAuthStep = "login" | "register" | "otp" | "forgot" | "reset";

interface IInitialState {
  user: IAuthUser | null;
  authStep: TAuthStep;
  pendingEmail: string;
}

const initialState: IInitialState = {
  user: null,
  authStep: "login",
  pendingEmail: "",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action: PayloadAction<IAuthUser | null>) => {
      state.user = action.payload;
    },
    setAuthStep: (state, action: PayloadAction<TAuthStep>) => {
      state.authStep = action.payload;
    },
    setPendingEmail: (state, action: PayloadAction<string>) => {
      state.pendingEmail = action.payload;
    },
    resetAuthFlow: (state) => {
      state.authStep = "login";
      state.pendingEmail = "";
    },
  },
});

export const { actions, reducer } = authSlice;
