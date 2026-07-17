'use client'
import React from "react";
import styles from './print-preview.module.css';
import { ICartOrderElement } from "@/app/utils/types";
import { getPreviewArrFunc } from "@/app/utils/cart-utils";
import { ruPrintPlace } from "@/app/utils/cart-utils";
import Link from "next/link";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useAppDispatch } from "@/redux/redux-hooks";
import { apiBaseUrl } from "@/app/utils/constants";



const PrintPreview: React.FC<{ elem: ICartOrderElement }> = ({ elem }) => {

    const dispatch = useAppDispatch();

    const previewArr = elem.prints && getPreviewArrFunc(elem.prints);
    const productQty = elem.item.sizes.reduce(
        (accumulator, currentValue) => accumulator + currentValue.userQty!,
        0
    );
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
                      src={`${apiBaseUrl}${item.file?.url}`}
                      alt={item.file?.name || "Файл принта"}
                    />
                     <div className={styles.prints_info}>
                      <p className={styles.printsInfo_size}>
                          {ruPrintPlace(item.cartParams!.place)}{' '}{item.cartParams?.size}
                      </p>
                      <p
                        className={styles.printsInfo_format}
                      >
                        — формат
                        {' '}
                        {item.cartParams?.format}
                      </p>
                      <p className={styles.printsInfo_price}>
                        {item.cartParams?.price}
                        {' '}
                        Р. х
                        {productQty}
                        {' '}
                        шт
                      </p>
                      <p
                        className={styles.printsInfo_totalPrice}
                      >
                        —
                        {' '}
                        {item.cartParams?.price! * productQty}
                        {' '}
                        Р.
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