'use client'
import React from "react";
import styles from './print-preview.module.css';
import Link from "next/link";
import { ICartOrderElement } from "@/app/utils/types";
import CartPrintModel from "./cart-print-model";

const PrintPreview: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {
    const prints = (elem.prints ?? []).filter((print) => print.file?.url);
    const productQty = elem.item.sizes.reduce(
        (accumulator, currentValue) => accumulator + currentValue.userQty!,
        0
    );
    if (!prints.length) return null;

    return (
        <div className={styles.cart_productPrintPreviews}>
            <CartPrintModel elem={elem} />
            {prints.map((print, index) => {
                const printUnitPrice = print.cartParams?.price ?? 0;
                const printTotalPrice = printUnitPrice * productQty;
                return (
                    <p key={print.id || index} className={styles.printsInfo_size}>
                        Принт {index + 1}
                        {print.cartParams?.format ? `, ${print.cartParams.format}` : ""}
                        {print.cartParams?.size ? `, ${print.cartParams.size}` : ""}
                        {` — ${printUnitPrice.toLocaleString('ru-RU')} Р. × ${productQty} — ${printTotalPrice.toLocaleString('ru-RU')} Р.`}
                    </p>
                );
            })}
            <Link
                href={`/shop/${elem.item.slug}/constructor?itemCartId=${elem.itemCartId}`}
                className={styles.printInfo_link}
            >
                <button className={styles.printsInfo_controlButton} type="button">
                    Изменить
                </button>
            </Link>
        </div>
    );
};

export default PrintPreview;
