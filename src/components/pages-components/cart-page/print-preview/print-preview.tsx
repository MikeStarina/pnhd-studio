'use client'
import React from "react";
import styles from './print-preview.module.css';
import { ICartOrderElement } from "@/app/utils/types";
import { BASIC_PRINT_COST, getPreviewArrFunc, ruPrintPlace } from "@/app/utils/cart-utils";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useAppDispatch } from "@/redux/redux-hooks";
import { resolveMediaUrl } from "@/app/utils/product-photos";



const PrintPreview: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {

    const dispatch = useAppDispatch();

    const previewArr = elem.prints && getPreviewArrFunc(elem.prints);
    const productQty = elem.item.sizes.reduce(
        (accumulator, currentValue) => accumulator + currentValue.userQty!,
        0
    );
    const printUnitPrice = BASIC_PRINT_COST;
    const printTotalPrice = printUnitPrice * productQty;

    return (
        <div className={styles.cart_productPrintPreviews}>
              {previewArr &&
                previewArr.map((item, index) => (
                  <div
                    key={index}
                    className={
                      index !== 4
                        ? `${styles.cart_preview} ${styles.cart_preview__border}`
                        : `${styles.cart_preview}`
                    }
                  >
                    <img
                      className={styles.cart_previewImg}
                      src={resolveMediaUrl(item.file?.url)}
                      alt={item.file?.name || "Файл принта"}
                    />
                     <div className={styles.prints_info}>
                      <p className={styles.printsInfo_size}>
                          {ruPrintPlace(item.cartParams!.place)}
                      </p>
                      {/* <p className={styles.printsInfo_size}>
                          {ruPrintPlace(item.cartParams!.place)}{' '}{item.cartParams?.size}
                      </p> */}
                      {/* <p
                        className={styles.printsInfo_format}
                      >
                        — формат
                        {' '}
                        {item.cartParams?.format}
                      </p> */}
                      <p className={styles.printsInfo_price}>
                        {printUnitPrice.toLocaleString('ru-RU')} Р. х {productQty}
                      </p>
                      <p
                        className={styles.printsInfo_totalPrice}
                      >
                        — от {printTotalPrice.toLocaleString('ru-RU')} Р.
                      </p>
                    </div>
                    <div className={styles.printsInfo_controlButtonsWrapper}>
                      <button
                        type="button"
                        className={styles.printsInfo_controlButton}
                        onClick={() => dispatch(cartActions.deletePrint({ activeView: item.cartParams!.place, itemCartId: elem.itemCartId }))}
                      >
                        Удалить
                      </button>
                      {/* <Link
                        href={{
                          pathname: `/shop/${elem.item.slug}/constructor`,
                          query: { itemCartId: elem.itemCartId},
                        }}
                        className={styles.printInfo_link}
                      >
                        <button
                          className={styles.printsInfo_controlButton}
                          type="button"
                        >
                          Изменить
                        </button>
                      </Link>  */}
                    </div>
                  </div>
                ))}
            </div>
    );
};

export default PrintPreview;