"use client";
import React, { useEffect, useState } from "react";
import styles from "./page.module.css";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import Controls from "@/components/pages-components/constructor-page/constructor-controls/constructor-controls";
import Stage from "@/components/pages-components/constructor-page/3dmockup/3dmokup";
import DecalComp from "@/components/pages-components/constructor-page/3dmockup/decal";
import Preview from "@/components/pages-components/constructor-page/3dmockup/preview";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { ICartOrderElement } from "@/app/utils/types";

const Constructor = () => {
    const router = useRouter();
    const slugParam = useParams().slug;
    const slug = Array.isArray(slugParam) ? slugParam[0] : slugParam;
    const itemCartId = useSearchParams().get("itemCartId");
    const dispatch = useAppDispatch();
    const { order } = useAppSelector((store) => store.cart);
    const { previewMode } = useAppSelector((store) => store.printConstructor);
    const [cartReady, setCartReady] = useState(false);
    const orderElement = order?.find((item) => item.itemCartId === itemCartId);

    useEffect(() => {
        let nextOrder: ICartOrderElement[] = order ?? [];
        const restoredOrder = sessionStorage.getItem("order");
        if (restoredOrder) {
            try {
                const parsedOrder = JSON.parse(restoredOrder) as ICartOrderElement[];
                if (Array.isArray(parsedOrder)) {
                    nextOrder = parsedOrder;
                    if (parsedOrder.length) dispatch(cartActions.restoreCart(parsedOrder));
                }
            } catch {
                sessionStorage.removeItem("order");
            }
        }
        setCartReady(true);
        const hasItem = Boolean(itemCartId && nextOrder.some((item) => item.itemCartId === itemCartId));
        if (!hasItem && slug) router.replace(`/shop/${slug}`);
        // Корзина на первом рендере пустая: решение о редиректе принимаем по sessionStorage, а не по Redux.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dispatch, itemCartId, router, slug]);

    if (!cartReady || !orderElement?.item) {
        return <section className={styles.screen} />;
    }

    return (
        <section className={styles.screen}>
            <div className={styles.stage}>
                {!previewMode && (
                    <Stage>
                        <DecalComp />
                    </Stage>
                )}
                {previewMode && <Preview />}
            </div>
            {itemCartId && <Controls itemCartId={itemCartId} />}
        </section>
    );
};

export default Constructor;
