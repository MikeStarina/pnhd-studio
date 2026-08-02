'use client'
import React from "react";
import styles from './product-card.module.css';
import { TPhotoSource } from "@/app/utils/product-photos";
import { ImageComponent } from "@/components/pages-components/shop-page/product-photos/imageComponent";
import ProductTagBadges from "@/components/pages-components/shop-page/product-tag-badges/product-tag-badges";



type TCardProps = {
  title: String,
  price: Number,
  photo: TPhotoSource,
  sizes: Array<{ qty: number, name: String }>,
  tags?: string[],
}


const ProductCard: React.FC<TCardProps> = ({ title, price, photo, sizes, tags = [] }) => {
  const outOfStock = sizes.length === 0;
  const hasTags = tags.length > 0;

  return (
    <div className={styles.card}>
      {(outOfStock || hasTags) && (
        <div className={styles.top_left_stack}>
          {outOfStock && (
            <div className={styles.no_stock_icon}>Нет в наличии</div>
          )}
          <ProductTagBadges tagIds={tags} />
        </div>
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
