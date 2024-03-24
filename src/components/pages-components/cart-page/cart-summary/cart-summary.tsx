'use client'
import React from "react";
import styles from './cart-summary.module.css';
import { useAppSelector } from "@/redux/redux-hooks";
import { cartSummaryFunc } from "@/app/utils/cart-utils";




const CartSummary: React.FC = () => {
    const { order } = useAppSelector(store => store.cart);
    const totalCartPrice = cartSummaryFunc(order!);
    return (
        <div className={styles.cartSummary}>
            <p className={styles.cartSummary_text}>Итого на сумму: {totalCartPrice} Р.</p>
        </div>
    )
}

export default CartSummary;