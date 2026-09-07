"use client";
import React, { useEffect, useMemo, useState } from "react";
import styles from "./product-description.module.css";
import { IProduct } from "@/app/utils/types";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import SizeChanger from "@/components/shared-components/size-changer/size-changer";
import ActionButtons from "../product-card-action-buttons/action-buttons";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as utilActions } from "@/redux/utils-slice/utils.slice";
import { PrintAddBlock } from '../print-add-block/print-add-block';
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
    const [printMode, setPrintMode] = useState<'print' | 'noPrint'>('noPrint');
    const itemForEditor = useMemo(
        () => cartItem ? { ...item, sizes: mergeCartSizes(item, cartItem.item.sizes) } : item,
        [item, cartItem]
    );

    useEffect(() => {
        if (!cartItem) return;
        dispatch(utilActions.setInitialSizes(mergeCartSizes(item, cartItem.item.sizes)));
        dispatch(utilActions.restorePrints(cartItem.prints ?? {}));
        setPrintMode(cartItem.isItemWithPrint ? 'print' : 'noPrint');
    }, [cartItem?.itemCartId, dispatch, item]);

    const setNoPrint = () => {
        setPrintMode('noPrint');
        dispatch(utilActions.resetPrints());
    };

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
                {item.isForPrinting && (
                    <div className={styles.print_block}>
                        <div className={styles.print_toggle}>
                            <button
                                type="button"
                                className={`${styles.print_button} ${printMode === 'print' ? styles.print_button_active : ''}`}
                                onClick={() => setPrintMode('print')}
                            >
                                добавить принт
                            </button>
                            <button
                                type="button"
                                className={`${styles.print_button} ${printMode === 'noPrint' ? styles.print_button_active : ''}`}
                                onClick={setNoPrint}
                            >
                                без принта
                            </button>
                        </div>
                        {printMode === 'print' && <PrintAddBlock item={item} />}
                    </div>
                )}
            </div>
            <ActionButtons item={item} />
        </div>
    );
};

export default ProductDescription;
