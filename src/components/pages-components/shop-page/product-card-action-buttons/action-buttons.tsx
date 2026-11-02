"use client";
import React, { useEffect, useState } from "react";
import styles from "./action-buttons.module.css";
import { IProduct } from "@/app/utils/types";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useRouter, useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { actions as ustilActions } from "@/redux/utils-slice/utils.slice";

const ActionButtons: React.FC<{ item: IProduct }> = ({ item }) => {
    const currItem = { ...item };
    const router = useRouter();
    const itemCartId = useSearchParams().get('itemCartId');
    const dispatch = useAppDispatch();
    const { sizes: stateSizes } = useAppSelector((store) => store.utils);
    const { order } = useAppSelector((store) => store.cart);
    const editingItem = order?.find((orderItem) => orderItem.itemCartId === itemCartId);
    const [isClient, setIsClient] = useState(false);
    useEffect(() => {
        setIsClient(true);
    }, []);
    const isEditing = isClient && Boolean(editingItem);

    const sizeChecker =
        stateSizes?.reduce((acc, item) => {
            return acc + item.userQty;
        }, 0) === 0;

    const totalSizesQty = stateSizes?.reduce((acc, item) => {
        return acc + (item.userQty || 0);
    }, 0) || 0;

    const totalPrice = totalSizesQty * currItem.price || 0;

    const addToCartClickHandler = () => {
        const newItem = { ...item, sizes: [...stateSizes!] };

        if (isEditing && editingItem) {
            dispatch(cartActions.updateCartItem({
                itemCartId: editingItem.itemCartId,
                sizes: newItem.sizes,
                prints: editingItem.prints,
                isItemWithPrint: editingItem.isItemWithPrint,
            }));
            dispatch(ustilActions.resetStateSizes());
            router.push('/cart');
            return;
        }

        dispatch(ustilActions.resetStateSizes());
        dispatch(cartActions.addToCartWithoutPrint({
            item: newItem,
            isItemWithPrint: false,
            itemCartId: uuidv4(),
        }));
        router.push('/shop');
    };


    const addPrintClickHandler = () => {
        const newItem = { ...currItem, sizes: stateSizes! };
        if (isEditing && editingItem) {
            dispatch(cartActions.updateCartItem({
                itemCartId: editingItem.itemCartId,
                sizes: newItem.sizes,
                prints: editingItem.prints,
                isItemWithPrint: true,
            }));
            router.push(`/shop/${item.slug}/constructor?itemCartId=${editingItem.itemCartId}`);
            return;
        }

        const nextItemCartId = uuidv4();
        dispatch(cartActions.addToCartWithPrint({
            item: newItem,
            isItemWithPrint: true,
            itemCartId: nextItemCartId,
        }));
        dispatch(ustilActions.resetStateSizes());
        router.push(`/shop/${item.slug}/constructor?itemCartId=${nextItemCartId}`);
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
                {isEditing ? 'Сохранить' : 'В корзину'}
            </button>
            {currItem.isForPrinting && (
                <button type="button" disabled={sizeChecker} className={styles.button} title={sizeChecker ? 'Выберите размер' : ''} onClick={addPrintClickHandler}>
                    Добавить принт
                </button>
            )}
        </div>
    );
};

export default ActionButtons;
