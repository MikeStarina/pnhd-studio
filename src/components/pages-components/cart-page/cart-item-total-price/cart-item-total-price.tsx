'use client';
import React from "react";
import styles from './cart-item-total-price.module.css';
import { ICartOrderElement } from "@/app/utils/types";
import { itemPrintUnitPrice } from "@/app/utils/cart-utils";
import { useAppDispatch } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";

const CartItemTotalPrice: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {
    const dispatch = useAppDispatch();
    const productQty = elem.item.sizes.reduce(
        (accumulator, currentValue) => accumulator + currentValue.userQty!,
        0
    );

    const textileTotalPrice = elem.item.price * productQty;
    const printsTotalPrice = itemPrintUnitPrice(elem) * productQty;
    const itemTotalPrice = textileTotalPrice + printsTotalPrice;

    const deleteItemButtonClickHandler = () => {
        dispatch(cartActions.deleteItemFromCart({ itemCartId: elem.itemCartId }));
    }

    return (
        <div className={styles.itemTotalPrice}>
            <button type='button' className={styles.itemTotalPrice_deleteItemButton} onClick={deleteItemButtonClickHandler}>Удалить</button>
            <p className={styles.itemTotalPrice_text}>Итого текстиль: {textileTotalPrice.toLocaleString('ru-RU')}&nbsp;Р.</p>
            {printsTotalPrice > 0 ? (
                <p className={styles.itemTotalPrice_text}>Итого печать: {printsTotalPrice.toLocaleString('ru-RU')}&nbsp;Р.</p>
            ) : ''}
            <p className={styles.itemTotalPrice_text}>
                Итого: {itemTotalPrice.toLocaleString('ru-RU')}&nbsp;Р.
            </p>
        </div>
    )
}

export default CartItemTotalPrice;
