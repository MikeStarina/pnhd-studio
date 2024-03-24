"use client";
import React, { ChangeEvent } from "react";
import TextField from "@mui/material/TextField";
import { MuiTelInput } from "mui-tel-input";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { MuiTelInputInfo } from "mui-tel-input";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";

const textFieldSx = {
    "& .MuiInputLabel-root": { fontFamily: "Neue_machina" },
    "& .MuiInputLabel-root.Mui-focused": { color: "rgb(57,57,57)" },
    "& .MuiOutlinedInput-root.Mui-focused": {
        "& > fieldset": { borderColor: "rgb(57,57,57)" },
    },
};


const MainUserData: React.FC = () => {
    const dispatch = useAppDispatch();
    const { name, surname, phone, email } = useAppSelector(store => store.cart.userData);


    const textInputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        dispatch(cartActions.setUserData({id, value}));
    }
    const phoneInputChangeHandler = (newValue: string, info: MuiTelInputInfo) => {
        const phoneWOspaces = newValue.replaceAll(' ', '');
        dispatch(cartActions.setUserData({id: 'phone', value: phoneWOspaces}));
      }
    return (
        <>
            <TextField
                id="name"
                label="Твоё имя"
                required
                fullWidth
                autoComplete="off"
                sx={textFieldSx}
                size="small"
                value={name}
                onChange={textInputChangeHandler}
            />

            <TextField
                id="surname"
                label="Твоя фамилия"
                required
                fullWidth
                autoComplete="off"
                sx={textFieldSx}
                size="small"
                value={surname}
                onChange={textInputChangeHandler}
            />

            <MuiTelInput
                id="phone"
                label="Твой телефон"
                required
                fullWidth
                autoComplete="off"
                sx={textFieldSx}
                size="small"
                defaultCountry="RU"
                onChange={phoneInputChangeHandler}
                value={phone}
            />

            <TextField
                id="email"
                label="Твоя почта"
                required
                fullWidth
                autoComplete="off"
                sx={textFieldSx}
                size="small"
                value={email}
                onChange={textInputChangeHandler}
            />
        </>
    );
};

export default MainUserData;
