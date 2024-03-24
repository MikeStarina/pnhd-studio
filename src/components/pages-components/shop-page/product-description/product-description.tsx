import React from "react";
import styles from "./product-description.module.css";
import { IProduct } from "@/app/utils/types";
import Link from "next/link";
import SizeChanger from "@/components/shared-components/size-changer/size-changer";
import ActionButtons from "../product-card-action-buttons/action-buttons";

const ProductDescription: React.FC<{ item: IProduct }> = ({ item }) => {
    const { price, name, description } = item;
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
                    
                        <Link href="/size_chart" className={styles.menu_link} target="blank">
                            <button type='button' className={styles.linkButton}>Гид по размерам</button>
                        </Link>
                   
                    
                        {/* <Link href="/shop" className={styles.menu_link} target="blank">
                            <button type='button' className={styles.linkButton}>Гид по уходу</button>
                        </Link> */}
                   
                </div>
                <SizeChanger item={item} />
                <ActionButtons item={item} />
            </div>
        </div>
    );
};

export default ProductDescription;
