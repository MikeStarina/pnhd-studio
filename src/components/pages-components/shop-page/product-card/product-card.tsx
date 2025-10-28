'use client'
import React, { useState } from "react";
import styles from './product-card.module.css';
import { CDN_URL } from "@/app/utils/constants";
import Image from "next/image";



type TCardProps = {
  title: String,
  price: Number,
  img: string,
  sizes: Array<{ qty: number, name: String }>,
  slug: string
}


const ProductCard: React.FC<TCardProps> = ({ title, price, img, sizes, slug }) => {
  const [imageSrc, setImageSrc] = useState(`${CDN_URL}/${slug}_0.jpg`);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.card}>
      {sizes.length === 0 && (
        <div className={styles.no_stock_icon}>Нет в наличии</div>
      )}
      <Image
        src={imageSrc}
        alt="card pic"
        className={styles.card_image}
        width={371}
        height={556}
        loading="lazy"
        onError={() => {
          if (imageSrc.includes('cdn.pnhd.ru')) {
            setImageSrc(img);
          } else {
            setImageError(true);
          }
        }}
        style={{ display: imageError ? 'none' : 'block' }}
      />
      <div className={styles.card_caption}>
        <p className={styles.card_title}>{title}</p>
        <p className={styles.card_price}>
          {price.toString()}
          {' '}
          Р.
        </p>
      </div>
    </div>
  )
}

export default ProductCard;