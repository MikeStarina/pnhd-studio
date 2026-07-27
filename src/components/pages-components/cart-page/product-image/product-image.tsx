'use client'
import React, { useMemo } from "react"
import styles from './product-image.module.css'
import Link from "next/link"
import { ICartOrderElement } from "@/app/utils/types"
import { productPhotoSources } from "@/app/utils/product-photos"
import { ImageComponent } from "@/components/pages-components/shop-page/product-photos/imageComponent"



const ProductImage: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {
    const photo = useMemo(() => productPhotoSources(elem.item, 0), [elem.item]);

    return (
        <div className={styles.cart_productImageWrapper}>
            <Link
                href={{
                    pathname: `/shop/${elem.item.slug}`,
                    query: { id: elem.item._id },
                }}
                className={styles.cart_link}
            >
                <ImageComponent
                    src={photo}
                    className={styles.cart_productImage}
                    width={371}
                    height={556}
                />
            </Link>
        </div>
    )
}

export default ProductImage;
