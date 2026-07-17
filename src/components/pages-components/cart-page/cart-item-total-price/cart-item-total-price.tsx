'use client';
import React from "react";
import styles from './cart-item-total-price.module.css';
import { ICartOrderElement } from "@/app/utils/types";
import { getPreviewArrFunc } from "@/app/utils/cart-utils";
import { useAppDispatch } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";

const BASIC_PRINT_COST = 400;

const CartItemTotalPrice: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {
    const dispatch = useAppDispatch();
    const productQty = elem.item.sizes.reduce(
        (accumulator, currentValue) => accumulator + currentValue.userQty!,
        0
    );

    const textileTotalPrice = elem.item.price * productQty;
    const printsToArr = elem.prints && getPreviewArrFunc(elem.prints);
    const totalPrintAmount = printsToArr ? printsToArr.length : 0;
    const totalPrintsAmount = productQty * totalPrintAmount;
    const printsTotalPrice = totalPrintsAmount * BASIC_PRINT_COST;
    const itemTotalPrice = textileTotalPrice + printsTotalPrice;

    // Старый расчёт по cartParams.price из конструктора
    // const printsToArr = elem.prints && getPreviewArrFunc(elem.prints);
    // const printsTotalPrice = printsToArr && printsToArr.reduce((acc, curr) => {
    //     if (!curr?.cartParams?.price) {
    //         return acc;
    //     }
    //     return acc + curr?.cartParams?.price
    // }, 0) * productQty;
    // const itemTotalPrice = printsTotalPrice ? textileTotalPrice + printsTotalPrice : textileTotalPrice;

    const deleteItemButtonClickHandler = () => {
        dispatch(cartActions.deleteItemFromCart({ itemCartId: elem.itemCartId }));
    }

    return (
        <div className={styles.itemTotalPrice}>
            <button type='button' className={styles.itemTotalPrice_deleteItemButton} onClick={deleteItemButtonClickHandler}>Удалить</button>
            <p className={styles.itemTotalPrice_text}>Итого текстиль: {textileTotalPrice.toLocaleString('ru-RU')}&nbsp;Р.</p>
            {printsTotalPrice > 0 ? (
                <p className={styles.itemTotalPrice_text}>Итого печать: от {printsTotalPrice.toLocaleString('ru-RU')}&nbsp;Р.</p>
            ) : ''}
            <p className={styles.itemTotalPrice_text}>
                Итого: {printsTotalPrice > 0 ? 'от ' : ''}{itemTotalPrice.toLocaleString('ru-RU')}&nbsp;Р.
            </p>
            {/* <p className={styles.itemTotalPrice_text}>Итого текстиль: {textileTotalPrice}&nbsp;Р.</p>
            {printsTotalPrice && printsTotalPrice > 0 ? (<p className={styles.itemTotalPrice_text}>Итого печать: {printsTotalPrice}&nbsp;Р.</p>):''}
            <p className={styles.itemTotalPrice_text}>Итого: {itemTotalPrice}&nbsp;Р.</p> */}
        </div>
    )
}

export default CartItemTotalPrice;
