import React from "react";
import styles from './shop-lead-screen.module.css';

import Link from "next/link";

import Image from "next/image";
import shop_screen_left_shape from '../../../../../public/shop_lead_left_shape.svg'
import shop_screen_right_shape from '../../../../../public/shop_lead_right_shape.svg'
import shop_lead_main_photo from '../../../../../public/shop_lead_main_photo.png'
import Tee from "@/components/shared-components/3d-tee/3d-tee";




const ShopLeadScreen: React.FC = () => {

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
                <Link href='/shop' className={styles.box_link}>
                    <button className={styles.box_linkButton}>перейти в конструктор</button>
                </Link>
                <div className={styles.box_shapeWrapper}>
                    <Image src={shop_screen_right_shape} alt='графическая форма' className={styles.box_shape} />
                </div>
                <div className={styles.box_imageWrapper}>
                    <Tee backdropStatus={false} fov={15} />
                    {/* <Image src={shop_lead_main_photo} alt='футболка с принтом' className={styles.box_image} /> */}
                </div>
            </div>
        </section>
    )
}

export default ShopLeadScreen;