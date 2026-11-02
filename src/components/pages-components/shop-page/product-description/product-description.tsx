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
import ProductColorVariants from "../product-color-variants/product-color-variants";

const mergeCartSizes = (item: IProduct, cartSizes?: IProduct['sizes']) => {
    return item.sizes.map((size) => {
        const cartQty = cartSizes?.find((cartSize) => cartSize.name === size.name)?.userQty ?? 0;
        return {
            ...size,
            userQty: Math.min(size.qty, cartQty),
        };
    });
};

const ProductDescription: React.FC<{ item: IProduct; variants?: IProduct[] }> = ({
    item,
    variants = [],
}) => {
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
    }, [cartItem?.itemCartId, dispatch, item]);

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
                <ProductColorVariants item={item} variants={variants} />
                <div className={styles.row}>
                    <span>размер</span>
                    <div className={styles.row_actions}>
                        {hasSelectedSizes && <button onClick={() => {
                            dispatch(utilActions.setInitialSizes(item.sizes.map((item) => {
                                return {
                                    name: item.name,
                                    qty: item.qty,
                                    userQty: 0,
                                }
                            })))
                        }}>Очистить</button>}
                        <Link href="/size_chart" className={styles.guideLink} target="blank">
                            гайд по размерам
                        </Link>
                    </div>
                </div>
                <div className={styles.size_changer_box}>
                    <SizeChanger key={itemCartId ?? item._id} item={itemForEditor} />
                </div>
            </div>
            <ActionButtons item={item} />
        </div>
    );
};

export default ProductDescription;
