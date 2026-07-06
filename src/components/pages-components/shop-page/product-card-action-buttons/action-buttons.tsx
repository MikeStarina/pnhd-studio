"use client";
import React from "react";
import styles from "./action-buttons.module.css";
import { IProduct } from "@/app/utils/types";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { actions as ustilActions } from "@/redux/utils-slice/utils.slice";

const ActionButtons: React.FC<{ item: IProduct }> = ({ item }) => {
    const currItem = { ...item };
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { sizes: stateSizes } = useAppSelector((store) => store.utils);
    const cart = useAppSelector((store) => store.cart);

    const sizeChecker =
        stateSizes?.reduce((acc, item) => {
            return acc + item.userQty;
        }, 0) === 0;

    const totalSizesQty = stateSizes?.reduce((acc, item) => {
        return acc + (item.userQty || 0);
    }, 0) || 0;

    const totalPrice = totalSizesQty * currItem.price || 0;

    const addToCartClickHandler = () => {

        const newItem = item;
        newItem.sizes = [...stateSizes!];


        const orderItem = {
            item: { ...newItem },
            isItemWithPrint: false,
            itemCartId: uuidv4(),
        };

        dispatch(ustilActions.resetStateSizes());
        dispatch(cartActions.addToCartWithoutPrint(orderItem));
        router.push('/shop');
    };


    const addPrintClickHandler = () => {
        const newItem = { ...currItem };
        newItem.sizes = stateSizes!;
        const itemCartId = uuidv4();

        const orderItem = {
            item: newItem,
            isItemWithPrint: true,
            itemCartId,
            prints: {
                'front': undefined,
                'back': undefined,
                'lsleeve': undefined,
                'rsleeve': undefined
            }
        };

        dispatch(cartActions.addToCartWithPrint(orderItem));
        router.push(`/shop/${item.slug}/constructor?itemCartId=${itemCartId}`)
    }

    return (
        <div className={styles.buttons_wrapper}>
            <div className={styles.calculations}>
                <span className={styles.calculations_text}>Итого</span>
                <div className={styles.totalBlock}>
                    <span className={styles.total}>{totalSizesQty}&nbsp;шт.</span>
                    <span className={styles.totalBlock_text}>{totalPrice.toLocaleString('ru-RU')}&nbsp;Р.</span>
                </div>
            </div>
            <button type="button" disabled={sizeChecker} className={styles.mainButton} title={sizeChecker ? 'Выберите размер' : ''} onClick={addToCartClickHandler}>
                В корзину
            </button>
            <button type="button" disabled={sizeChecker || !currItem.isForPrinting} className={styles.button} onClick={addPrintClickHandler}>
                Добавить принт
            </button>
        </div>
    );
};

export default ActionButtons;
