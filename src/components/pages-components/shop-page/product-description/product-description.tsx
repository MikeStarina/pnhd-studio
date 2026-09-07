"use client";
import React, { useEffect, useMemo } from "react";
import styles from "./product-description.module.css";
import { IProduct } from "@/app/utils/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SizeChanger from "@/components/shared-components/size-changer/size-changer";
import ActionButtons from "../product-card-action-buttons/action-buttons";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as utilActions } from "@/redux/utils-slice/utils.slice";
import { PrintAddBlock } from '../print-add-block/print-add-block';

const mergeCartSizes = (item: IProduct, cartSizes?: IProduct['sizes']) => {
    return item.sizes.map((size) => {
        const cartQty = cartSizes?.find((cartSize) => cartSize.name === size.name)?.userQty ?? 0;
        return {
            ...size,
            userQty: Math.min(size.qty, cartQty),
        };
    });
};

const ProductDescription: React.FC<{ item: IProduct }> = ({ item }) => {
    const { price, name, description } = item;
    const { sizes } = useAppSelector((store) => store.utils);
    const { order } = useAppSelector((store) => store.cart);
    const itemCartId = useSearchParams().get('itemCartId');
    const cartItem = order?.find((orderItem) => orderItem.itemCartId === itemCartId);
    const hasSelectedSizes = sizes?.some((item) => item.userQty > 0);
    const dispatch = useAppDispatch();
    const itemForEditor = useMemo(
        () => cartItem ? { ...item, sizes: mergeCartSizes(item, cartItem.item.sizes) } : item,
        [item, cartItem]
    );

    useEffect(() => {
        if (!cartItem) return;
        dispatch(utilActions.setInitialSizes(mergeCartSizes(item, cartItem.item.sizes)));
        dispatch(utilActions.restorePrints(cartItem.prints ?? {}));
    }, [cartItem?.itemCartId, dispatch, item]);

    console.log(item)
    return (
        <div className={styles.product_box}>
            <div className={styles.description}>
                <div className={styles.title_box}>
                    <h1 className={styles.title}>{name}</h1>
                    <p className={styles.price}>
                        {'—'}&nbsp;{price.toString()}&nbsp;P.
                    </p>
                </div>
                <p className={styles.text}>{description}</p>
                <div className={styles.box_link}>
                    <Link href="/size_chart" className={styles.linkButton} target="blank">
                        Гид по размерам
                    </Link>
                    {/* <Link href="/shop" className={styles.menu_link} target="blank">
                            <button type='button' className={styles.linkButton}>Гид по уходу</button>
                        </Link> */}
                </div>
                <div className={styles.row}>
                    <span>Размеры</span>
                    {hasSelectedSizes && <button onClick={() => {
                        dispatch(utilActions.setInitialSizes(item.sizes.map((item) => {
                            return {
                                name: item.name,
                                qty: item.qty,
                                userQty: 0,
                            }
                        })))
                    }}>Очистить</button>}
                </div>
                <div className={styles.size_changer_box}>
                    <SizeChanger key={itemCartId ?? item._id} item={itemForEditor} />
                </div>
                {item.isForPrinting && (
                    <div className={styles.row}>
                        <PrintAddBlock item={item} />
                    </div>
                )}
            </div>
            <ActionButtons item={item} />
        </div>
    );
};

export default ProductDescription;
