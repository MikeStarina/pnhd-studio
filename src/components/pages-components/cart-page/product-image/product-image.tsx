'use client'
import React from "react"
import styles from './product-image.module.css'
import Link from "next/link"
import { ICartOrderElement } from "@/app/utils/types"
import { apiBaseUrl } from "@/app/utils/constants"



const ProductImage: React.FC<{ elem: ICartOrderElement}> = ({ elem }) => {

    const url = `${apiBaseUrl}${elem.item.image_url}`;

    return (
        <div className={styles.cart_productImageWrapper}>
            <Link
            href={{
                pathname: `/shop/${elem.item.slug}`,
                query: { id: elem.item._id },
            }}
            className={styles.cart_link}
            >
            <img
                className={styles.cart_productImage}
                src={url}
                alt="Фото товара"
            />
            </Link>
      </div>
    )
}

export default ProductImage;