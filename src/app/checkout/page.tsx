"use client";
import React, { ChangeEvent, FormEvent, useEffect } from "react";
import styles from "./page.module.css";
import FormGroup from "@mui/material/FormGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import MainUserData from "@/components/pages-components/checkout-page/main-user-data/main-user-data";
import DeliveryData from "@/components/pages-components/checkout-page/delivery-data/delivery-data";
import { cartSummaryFunc } from "../utils/cart-utils";
import { checkoutOrderObjectCreateFunc } from "../utils/cart-utils";
import { useCreateOrderMutation } from "@/api/api";
import { useRouter } from "next/navigation";


const switchSx = {
    '& .MuiSwitch-switchBase.Mui-checked': {
        color: 'rgb(153,255,0)',
        '&:hover': {
            backgroundColor: 'rgba(153,255,0,.1)',
        },
    },
    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
        backgroundColor: 'rgba(153,255,0,.9)',
    },
};
const switchLabelSx = {
    "& .MuiTypography-root": { fontFamily: "Neue_machina" },
};


const CheckoutPage: React.FC = () => {

    const dispatch = useAppDispatch();
    const router = useRouter();
    const { isDelivery, order, deliveryParams, paymentUrl } = useAppSelector(store => store.cart);
    const cart = useAppSelector(store => store.cart);
    const totalOrderPrice = cartSummaryFunc(order!);
    const [ createOrder ] = useCreateOrderMutation();

    useEffect(() => {

        return () => {
            dispatch(cartActions.setDelivery(false));
            dispatch(cartActions.resetValidCity());
            dispatch(cartActions.resetValidDeliveryPoint());
            dispatch(cartActions.setCdekCitySearchUserQuery(''));
        }
    }, [])

    useEffect(() => {
        !order || order.length === 0 && router.replace('/shop');
    }, [order])

    useEffect(() => {
        paymentUrl && router.push(paymentUrl);
    }, [paymentUrl])

    const formSubmitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const order = checkoutOrderObjectCreateFunc(cart);
        const response = await createOrder(order);
        //@ts-ignore
        dispatch(cartActions.setPaymentURL(response.data.paymentUrl))
        dispatch(cartActions.resetCart());
        sessionStorage.setItem('cart', '');
    }

    const switchHandler = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch(cartActions.setDelivery(e.target.checked))
        if (!e.target.checked) {
            dispatch(cartActions.resetValidCity())
            dispatch(cartActions.resetValidDeliveryPoint())
            dispatch(cartActions.setCdekCitySearchUserQuery(''));
        }
    }

    return (
        <section className={styles.checkout}>
            <form className={styles.checkout_form} id='checkout' onSubmit={formSubmitHandler}>               
                <MainUserData />
                <FormGroup>
                    <FormControlLabel
                        sx={switchLabelSx}
                        control={
                            <Switch
                                sx={switchSx}
                                id='delivery'
                                checked={isDelivery}
                                onChange={switchHandler}
                            />
                        }
                        label="Доставка"
                    />
                </FormGroup>
                {isDelivery && <DeliveryData />}
            </form>
            <div className={styles.checkout_priceWrapper}>
                <p className={styles.checkout_priceText}>Итого по заказу: {totalOrderPrice} Р.</p>    
                <p className={styles.checkout_priceText}>Доставка: {deliveryParams.deliveryPrice} Р.</p>
                {deliveryParams.validCityTo && deliveryParams.validCityTo.city && <p className={styles.checkout_priceText}>Доставка в: {deliveryParams.validCityTo.city}</p>}
                {deliveryParams.validDeliveryPoint && deliveryParams.validDeliveryPoint.name && <p className={styles.checkout_priceText}>Пункт выдачи: {deliveryParams.validDeliveryPoint.name}</p>}
                <p className={styles.checkout_finalPriceText}>= {totalOrderPrice + deliveryParams.deliveryPrice} Р.</p>
                <button type='submit' form='checkout' className={styles.form_submitButton}>Оплатить</button>
            </div>
        </section>
    );
};

export default CheckoutPage;
