'use client'
import React from "react";
import styles from './cart-summary.module.css';
import { useAppSelector } from "@/redux/redux-hooks";
import { cartSummaryFunc, orderHasPrints } from "@/app/utils/cart-utils";




const CartSummary: React.FC = () => {
    const { order } = useAppSelector(store => store.cart);
    const totalCartPrice = cartSummaryFunc(order!);
    const hasPrints = orderHasPrints(order);
    return (
        <div className={styles.cartSummary}>
            <p className={styles.cartSummary_text}>
                Итого на сумму: {hasPrints ? 'от ' : ''}{totalCartPrice.toLocaleString('ru-RU')} Р.
            </p>
        </div>
    )
}

export default CartSummary;