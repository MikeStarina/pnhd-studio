import React from "react";
import Link from "next/link";
import { IProduct } from "@/app/utils/types";
import { isLightHex, resolveColorHex } from "@/app/utils/product-colors";
import { productPhotoSources } from "@/app/utils/product-photos";
import styles from "./product-color-variants.module.css";

type ProductColorVariantsProps = {
  item: IProduct;
  variants: IProduct[];
  hasCurrentColorText?: boolean;
  hasOtherColorsText?: boolean;
  hasCurrentByDefault?: boolean;
  showSwatchesType?: 'auto' | 'always';
};

const ProductColorVariants: React.FC<ProductColorVariantsProps> = ({
  item,
  variants,
  hasCurrentColorText = true,
  hasOtherColorsText = true,
  hasCurrentByDefault = false,
  showSwatchesType = 'auto',
}) => {
  const showSwatches = showSwatchesType === 'auto' ? variants.length > 1 : true;
  const currentHex = item.stageColor ?? resolveColorHex(item.color);
  const currSwatchStyle = currentHex
    ? { backgroundColor: currentHex }
    : { backgroundImage: `url(${productPhotoSources(item, 0).cdnPhoto})` };
  const currContent = (
    <span
      className={isLightHex(currentHex) ? `${styles.swatch} ${styles.swatch_current} ${styles.swatch_light}` : `${styles.swatch} ${styles.swatch_current}`}
      style={{...currSwatchStyle}}
      title={item.color}
      aria-label={item.color}
      aria-current={"true"}
    />
  );


  return (
    <div className={styles.block}>
      {hasCurrentColorText && <p className={styles.current}>
        Текущий цвет: {item.color || "—"}
      </p>}
      {showSwatches && (
        <>
          {hasOtherColorsText && <p className={styles.label}>другие цвета</p>}
          <ul className={styles.list}>
            {hasCurrentByDefault &&
              <li>
                <Link href={`/shop/${item.slug}`} aria-label={item.color}>{currContent}</Link>
              </li>
            }
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
                    !hasCurrentByDefault ? content : <></>
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
