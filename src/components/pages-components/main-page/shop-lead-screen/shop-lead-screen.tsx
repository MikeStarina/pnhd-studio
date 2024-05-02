import React from "react";
import styles from './shop-lead-screen.module.css';

import Link from "next/link";

import Image from "next/image";
import shop_screen_left_shape from '../../../../../public/shop_lead_left_shape.svg'
import shop_screen_right_shape from '../../../../../public/shop_lead_right_shape.svg'
import shop_lead_main_photo from '../../../../../public/shop_lead_main_photo.png'





const ShopLeadScreen: React.FC<{ searchParams: {[n:string]: string }}> = ({ searchParams }) => {

    return (
        <section className={styles.screen}>
            <div className={styles.screen_titleWrapper}>
                <h2 className={styles.screen_title}>
                    перейди в конструктор и создай одежду с уникальными
                </h2>
                <p className={styles.screen_subtitle}>
                    принтами
                </p>
            </div>
           
            <div className={styles.screen_box}>
                <div className={styles.box_shapeWrapper}>
                    <Image src={shop_screen_left_shape} alt='графическая форма' className={styles.box_shape} />
                </div>
                <Link href={{pathname:'/shop', query:(() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}} className={styles.box_link}>
                    <button className={styles.box_linkButton}>перейти в конструктор</button>
                </Link>
                <div className={styles.box_shapeWrapper}>
                    <Image src={shop_screen_right_shape} alt='графическая форма' className={styles.box_shape} />
                </div>
                <div className={styles.box_imageWrapper}>
                    <Image src={shop_lead_main_photo} alt='футболка с принтом' className={styles.box_image} />
                </div>
            </div>
        </section>
    )
}

export default ShopLeadScreen;