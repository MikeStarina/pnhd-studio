'use client'
import React, { useState, useEffect } from "react"
import styles from './product-image.module.css'
import Link from "next/link"
import { ICartOrderElement } from "@/app/utils/types"
import { apiBaseUrl, CDN_URL } from "@/app/utils/constants"
import Image from "next/image"



const ProductImage: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {
    const [imageSrc, setImageSrc] = useState(`${CDN_URL}/${elem.item.slug}_0.jpg`);
    // const [imageSrc, setImageSrc] = useState(`${CDN_URL}/test.jpg`);
    const [imageError, setImageError] = useState(false);
    const url = elem?.item?.image_url ? `${apiBaseUrl}${elem.item.image_url}` : '';

    useEffect(() => {
        if (imageError) {
            setImageSrc(`${CDN_URL}/no-photo.png`);
        }
    }, [imageError]);

    return (
        <div className={styles.cart_productImageWrapper}>
            <Link
                href={{
                    pathname: `/shop/${elem.item.slug}`,
                    query: { id: elem.item._id },
                }}
                className={styles.cart_link}
            >
                <Image
                    src={imageSrc}
                    alt="card pic"
                    className={styles.cart_productImage}
                    width={371}
                    height={556}
                    loading="lazy"
                    onError={() => {
                        if (imageSrc.includes('cdn.pnhd.ru') && !imageError) {
                            setImageSrc(url);
                        } else if (!imageSrc.includes('cdn.pnhd.ru') && !imageError) {
                            setImageError(true);
                        }
                    }}
                    //style={{ display: imageError ? 'none' : 'block' }}
                />
            </Link>
        </div>
    )
}

export default ProductImage;