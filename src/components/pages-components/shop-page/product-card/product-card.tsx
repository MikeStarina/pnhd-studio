'use client'
import React from "react";
import styles from './product-card.module.css';
import ProductTagBadges from "@/components/pages-components/shop-page/product-tag-badges/product-tag-badges";
import ProductColorVariants from "../product-color-variants/product-color-variants";
import { IProduct } from "@/app/utils/types";
import ProductGallery from "../product-gallery/product-gallery";



type TCardProps = {
  title: String,
  price: Number,
  sizes: Array<{ qty: number, name: String }>,
  tags?: string[],
  item: IProduct,
  shopData: IProduct[],
}


const ProductCard: React.FC<TCardProps> = ({ title, price, sizes, tags = [], item, shopData }) => {
  const outOfStock = sizes.length === 0;
  const hasTags = tags.length > 0;

  const variants = shopData.filter((i) => i.internal_id &&i.internal_id === item.internal_id);

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
      <ProductGallery
        item={item}
        variant="carousel"
        showBadges={false}
        className={styles.card_gallery}
        hasAutoScroll={false}
      />
      <div className={styles.card_caption}>
        <div className={styles.card_captionContent}>
          <p className={styles.card_title}>{title}</p>
          <p className={styles.card_price}>
            {price.toString()}
            {' '}
            Р.
          </p>
        </div>
        <ProductColorVariants
          item={item}
          variants={variants}
          hasCurrentColorText={false}
          hasOtherColorsText={false}
          hasCurrentByDefault
          showSwatchesType='always'
        />
      </div>
    </div>
  )
}

export default ProductCard;
