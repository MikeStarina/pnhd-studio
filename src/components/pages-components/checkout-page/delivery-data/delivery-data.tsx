"use client";
import React, { ChangeEvent, SyntheticEvent, useEffect } from "react";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import { useGetCdekCitiesDataQuery } from "@/api/api";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import useDebouncedFunction from "@/app/utils/hooks";
import { ICdekCitySearchResponse } from "@/app/utils/types";
import ShippingPoints from "../shipping-points/shipping-points";

const textFieldSx = {
    "& .MuiInputLabel-root": { fontFamily: "Neue_machina" },
    "& .MuiInputLabel-root.Mui-focused": { color: "rgb(57,57,57)" },
    "& .MuiOutlinedInput-root.Mui-focused": {
        "& > fieldset": { borderColor: "rgb(57,57,57)" },
    },
};



const DeliveryData: React.FC = () => {
    const dispatch = useAppDispatch();
    const { deliveryParams } = useAppSelector(store => store.cart);
    const { data: cdekCitiesSearchData } = useGetCdekCitiesDataQuery('');

    const changeHandler = (e: any) => {
        const validCityTo = cdekCitiesSearchData?.find(item => item.city === e.target.textContent);
        const validCityFrom = cdekCitiesSearchData?.find(item => item.city === 'Санкт-Петербург');
        validCityTo && validCityFrom && dispatch(cartActions.setValidCity({validCityTo, validCityFrom}))
        validCityFrom && dispatch(cartActions.setCdekCitySearchUserQuery(validCityFrom.city))
    }

    const inputChangeHandler = (e: any) => {
        dispatch(cartActions.resetValidCity());
        dispatch(cartActions.resetValidDeliveryPoint());
        dispatch(cartActions.setCdekCitySearchUserQuery(e.target.value))
    }
    return (
        <>
            {cdekCitiesSearchData && <Autocomplete
                freeSolo
                disableClearable
                options={cdekCitiesSearchData.map((option: ICdekCitySearchResponse) => option.city)}
                fullWidth
                size="small"
                autoComplete={false}
                onChange={changeHandler}
                onInputChange={inputChangeHandler}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        sx={textFieldSx}
                        label="Введите город"
                        InputProps={{
                            ...params.InputProps,
                            type: "search",
                        }}
                        //value={deliveryParams.userCitySearchQuery}
                        //onChange={(e: ChangeEvent<HTMLInputElement>) => { debouncedDispatch(e.target.value) }}
                    />
                )}
            />}
            {deliveryParams.validCityTo &&
                <ShippingPoints />
            }
        </>
    );
};

export default DeliveryData;
