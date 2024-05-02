"use client";
import React from "react";
import styles from "./action-buttons.module.css";
import { IProduct } from "@/app/utils/types";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useRouter } from "next/navigation";
import { v4 as uuidv4 } from 'uuid';
import { actions as ustilActions } from "@/redux/utils-slice/utils.slice";
import { useSearchParams } from "next/navigation";

const ActionButtons: React.FC<{ item: IProduct }> = ({ item }) => {
    const params = useSearchParams().toString();
    const currItem = {...item};
    const router = useRouter();
    const dispatch = useAppDispatch();
    const { sizes: stateSizes } = useAppSelector((store) => store.utils);
    const cart = useAppSelector((store) => store.cart);
    
    const sizeChecker =
        stateSizes?.reduce((acc, item) => {
            return acc + item.userQty;
        }, 0) === 0;

    const addToCartClickHandler = () => {

        const newItem = item;
        newItem.sizes = [...stateSizes!]; 


        const orderItem = {
            item: {...newItem},
            isItemWithPrint: false,
            itemCartId: uuidv4(),
        };

        const urlString = params ? `?${params}` : '';

        dispatch(ustilActions.resetStateSizes());
        dispatch(cartActions.addToCartWithoutPrint(orderItem));
        router.push(`/shop${urlString}`);
    };


    const addPrintClickHandler = () => {
        const newItem = {...currItem};
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
        const urlString = params ? `&${params}` : '';
        router.push(`/shop/${item.slug}/constructor?itemCartId=${itemCartId}${urlString}`)
    }

    return (
        <div className={styles.buttons_wrapper}>
                <button type="button" disabled={sizeChecker} className={styles.button} onClick={addPrintClickHandler}>
                    добавить принт
                </button>
            <button type="button" disabled={sizeChecker} className={styles.button} onClick={addToCartClickHandler}>
                добавить в корзину
            </button>
            
        </div>
    );
};

export default ActionButtons;
