'use client'
import React from "react";
import styles from './product-card.module.css';
import { TPhotoSource } from "@/app/utils/product-photos";
import { ImageComponent } from "@/components/pages-components/shop-page/product-photos/imageComponent";



type TCardProps = {
  title: String,
  price: Number,
  photo: TPhotoSource,
  sizes: Array<{ qty: number, name: String }>,
}


const ProductCard: React.FC<TCardProps> = ({ title, price, photo, sizes }) => {
  return (
    <div className={styles.card}>
      {sizes.length === 0 && (
        <div className={styles.no_stock_icon}>Нет в наличии</div>
      )}
      <ImageComponent
        src={photo}
        className={styles.card_image}
        width={371}
        height={556}
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
