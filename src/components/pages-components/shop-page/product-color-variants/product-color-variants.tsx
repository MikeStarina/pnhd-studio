import React from "react";
import Link from "next/link";
import { IProduct } from "@/app/utils/types";
import { isLightHex, resolveColorHex } from "@/app/utils/product-colors";
import { productPhotoSources } from "@/app/utils/product-photos";
import styles from "./product-color-variants.module.css";

type ProductColorVariantsProps = {
  item: IProduct;
  variants: IProduct[];
};

const ProductColorVariants: React.FC<ProductColorVariantsProps> = ({
  item,
  variants,
}) => {
  const showSwatches = variants.length > 1;

  return (
    <div className={styles.block}>
      <p className={styles.current}>
        Текущий цвет: {item.color || "—"}
      </p>
      {showSwatches && (
        <>
          <p className={styles.label}>другие цвета</p>
          <ul className={styles.list}>
            {variants.map((variant) => {
              const isCurrent = variant._id === item._id;
              const hex = variant.stageColor ?? resolveColorHex(variant.color);
              const photo = productPhotoSources(variant, 0);
              const className = [
                styles.swatch,
                isCurrent ? styles.swatch_current : "",
                hex && isLightHex(hex) ? styles.swatch_light : "",
              ]
                .filter(Boolean)
                .join(" ");

              const swatchStyle = hex
                ? { backgroundColor: hex }
                : { backgroundImage: `url(${photo.cdnPhoto})` };

              const content = (
                <span
                  className={className}
                  style={swatchStyle}
                  title={variant.color}
                  aria-label={variant.color}
                  aria-current={isCurrent ? "true" : undefined}
                />
              );

              return (
                <li key={variant._id}>
                  {isCurrent ? (
                    content
                  ) : (
                    <Link href={`/shop/${variant.slug}`} aria-label={variant.color}>
                      {content}
                    </Link>
                  )}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
};

export default ProductColorVariants;
