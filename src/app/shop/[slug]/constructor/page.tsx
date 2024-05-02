"use client";
import React, { useEffect } from "react";
import styles from "./page.module.css";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppSelector } from "@/redux/redux-hooks";
import Controls from "@/components/pages-components/constructor-page/constructor-controls/constructor-controls";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";
import { splitString } from "@/app/utils/constants";

import dynamic from "next/dynamic";
const DynamicStage = dynamic(
    () => import("../../../../konva-stage/stage-component"),
    { ssr: false }
);

const Constructor: React.FC = () => {
    const router = useRouter();
    const itemCartId = useSearchParams().get("itemCartId");
    const params = splitString(useSearchParams().toString());
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];



    useEffect(() => {
        if (!orderElement) router.replace("/shop"); //переписать чтоб возвращало на кароточку товара
    }, [orderElement, router]);

    return (
        <>
        <Header searchParams={params}/>
        <section className={styles.screen}>
            <div className={styles.mockup_container}>
                <div className={styles.stage_container}>
                    {orderElement?.item && <DynamicStage orderElement={orderElement} />}
                </div>
            </div>
            {orderElement && <Controls orderElement={orderElement} />}
        </section>
        <Footer searchParams={params}/>
        </>
    );
};

export default Constructor;
