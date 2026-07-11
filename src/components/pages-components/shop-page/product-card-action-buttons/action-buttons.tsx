"use client";
import React, { useMemo } from "react";
import styles from "./action-buttons.module.css";
import { IProduct } from "@/app/utils/types";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { actions as ustilActions } from "@/redux/utils-slice/utils.slice";

const BASIC_PRINT_COST = 400;

const ActionButtons: React.FC<{ item: IProduct }> = ({ item }) => {
    const currItem = { ...item };
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { sizes: stateSizes, prints: statePrints } = useAppSelector((store) => store.utils);
    const { prints } = useAppSelector((store) => store.utils);
    const totalPrintAmount = useMemo(() => {
        if (!prints) return 0;
        return Object.values(prints).reduce((acc, value) => {
            return acc + (value ? 1 : 0);
        }, 0);
    }, [prints]);

    const sizeChecker =
        stateSizes?.reduce((acc, item) => {
            return acc + item.userQty;
        }, 0) === 0;

    const totalSizesQty = stateSizes?.reduce((acc, item) => {
        return acc + (item.userQty || 0);
    }, 0) || 0;

    const totalPrice = totalSizesQty * currItem.price || 0;
    const totalPrintsAmount = totalSizesQty * totalPrintAmount;
    const totalPrintCost = totalPrintsAmount * BASIC_PRINT_COST;
    const basicPrintCost = totalSizesQty * totalPrintAmount * BASIC_PRINT_COST;
    const totalCost = totalPrice + basicPrintCost;

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
                'front': statePrints?.front,
                'back': statePrints?.back,
                'lsleeve': statePrints?.lsleeve,
                'rsleeve': statePrints?.rsleeve,
            }
        };

        dispatch(cartActions.addToCartWithPrint(orderItem));
        dispatch(ustilActions.resetPrints());
        router.push(`/shop/${item.slug}/constructor?itemCartId=${itemCartId}`)
    }

    return (
        <div className={styles.buttons_wrapper}>
            {totalPrintAmount === 0 ? (
                <div className={styles.calculations}>
                    <span className={styles.calculations_text}>Итого</span>
                    <div className={styles.totalBlock}>
                        <span className={styles.total}>{totalSizesQty}&nbsp;шт.</span>
                        <span className={styles.totalBlock_text}>{totalPrice.toLocaleString('ru-RU')}&nbsp;Р.</span>
                    </div>
                </div>
            ) : (
                <>
                    <div className={styles.calculations}>
                        <span className={styles.calculations_text}>Текстиль</span>
                        <div className={styles.totalBlock}>
                            <span className={styles.total}>{totalSizesQty}&nbsp;шт.</span>
                            <span className={styles.totalBlock_text}>{totalPrice.toLocaleString('ru-RU')}&nbsp;Р.</span>
                        </div>
                    </div>
                    <div className={styles.calculations}>
                        <span className={styles.calculations_text}>Печать</span>
                        <div className={styles.totalBlock}>
                            <span className={styles.total}>{totalPrintsAmount}&nbsp;шт.</span>
                            <span className={styles.totalBlock_text}>от {totalPrintCost.toLocaleString('ru-RU')}&nbsp;Р.</span>
                        </div>
                    </div>
                    <div className={styles.calculations}>
                        <span className={styles.calculations_text}>Итого</span>
                        <div className={styles.totalBlock}>
                            <span className={styles.total}>{totalSizesQty}&nbsp;шт.</span>
                            <span className={styles.totalBlock_text}>от {totalCost.toLocaleString('ru-RU')}&nbsp;Р.</span>
                        </div>
                    </div>
                </>
            )}
            <button type="button" disabled={sizeChecker} className={styles.mainButton} title={sizeChecker ? 'Выберите размер' : ''} onClick={addToCartClickHandler}>
                В корзину
            </button>
            {/* <button type="button" disabled={sizeChecker || !currItem.isForPrinting} className={styles.button} onClick={addPrintClickHandler}>
                Добавить принт
            </button> */}
        </div>
    );
};

export default ActionButtons;
