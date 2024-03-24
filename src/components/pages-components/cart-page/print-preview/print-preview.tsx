'use client'
import React from "react";
import styles from './print-preview.module.css';
import { ICartOrderElement } from "@/app/utils/types";
import { getPreviewArrFunc } from "@/app/utils/cart-utils";
import { ruPrintPlace } from "@/app/utils/cart-utils";
import Link from "next/link";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useAppDispatch } from "@/redux/redux-hooks";



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
                      src={item.preview}
                      alt="Превью принта"
                      onClick={() => {
                        //setPrewievImg(elem.preview);
                        //setModalActive(true);
                      }}
                      onKeyDown={() => {
                        //setPrewievImg(elem.preview);
                        //setModalActive(true);
                      }}
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
                      <Link
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
                      </Link> 
                    </div>
                  </div>
                ))}
              {/* {arr.length < 4 && (
                <div
                  className={
                    arr.length === 0
                      ? `${styles.addPrintButton_wrap} ${styles.addPrintButton_wrapBottom}`
                      : `${styles.addPrintButton_wrap}`
                  }
                >
                  {item.attributes.isForPrinting && (
                    <Link
                      to={{
                        pathname: `/shop/${item.attributes.slug}/constructor`,
                        state: { state: item.cart_item_id, from: 'cart' },
                      }}
                      className={`${styles.link} ${styles.link__name}`}
                      key={item.cart_item_id}
                    >
                      <button
                        className={styles.addPrintButton_wrap_text}
                        disabled={!item.attributes.isForPrinting}
                        type="button"
                      >
                        Добавить принт &gt;
                      </button>
                    </Link>
                  )}
                </div>
              )} */}
            </div>
    );
};

export default PrintPreview;