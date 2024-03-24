"use client";
import React from "react";
import styles from "./product-description.module.css";
import Link from "next/link";
import { ICartOrderElement } from "@/app/utils/types";


const ProductDescription: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {

    const productQty = elem.item.sizes.reduce(
        (accumulator, currentValue) => accumulator + currentValue.userQty!,
        0
    );

    return (
        <div className={styles.cart_productInfoWrapper}>
            <Link
                href={{
                    pathname: `/shop/${elem.item.slug}`,
                    query: { id: elem.item._id },
                }}
                className={`${styles.cart_link} ${styles.cart_link__name}`}
            >
                <h2 className={styles.cart_productName}>{elem.item.name}</h2>
            </Link>
            <p className={styles.cart_productPrice}>
                {elem.item.price} Р. Х{productQty} шт. — {elem.item.price * productQty} Р.
            </p>
            {/* <p className={styles.cart_productSum}>
                — {elem.item.price * productPrice} Р.
            </p> */}
            <button
                type="button"
                className={styles.cart_editSizeButton}
                onClick={(e) => {
                    //setModalSizeActive(true);
                    //setModalSizeId(e.target.id);
                }}
                id={elem.itemCartId}
            >
                Изменить&nbsp;размер
            </button>
            <p className={styles.cart_productDescription}>{elem.item.description}</p>
            {elem.item.sizes.map((item, index) => {
                return item.userQty! > 0 && <p className={styles.cart_productDescription} key={index}>{`${item.name}: ${item.userQty} шт.`}</p>
              })}
        </div>
    );
};

export default ProductDescription;
