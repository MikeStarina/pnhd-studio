"use client";
import React from "react";
import styles from "./order-info.module.css";
import { ICartOrderElement, IPrintFile } from "@/app/utils/types";
import { totalPrintPriceFunc } from "@/app/utils/constructor-utils";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { actions as constructorActions } from "@/redux/constructor-slice/constructor.slice";

const printLine = (print: IPrintFile, index: number, volumeSize: number) => {
  if (!print.file?.url || !print.cartParams) return `Принт ${index + 1} —`;
  const lineTotal = print.cartParams.price * volumeSize;
  return `Принт ${index + 1} — ${print.cartParams.format}, ${print.cartParams.size}, ${print.cartParams.price.toLocaleString("ru-RU")} Р. × ${volumeSize} шт. — ${lineTotal.toLocaleString("ru-RU")} Р.`;
};

const OrderInfo: React.FC<{ orderElement: ICartOrderElement; dock?: boolean }> = ({
  orderElement,
  dock = false,
}) => {
  const dispatch = useAppDispatch();
  const { selectedPrintId } = useAppSelector((store) => store.printConstructor);
  const { prints, item } = orderElement;
  const list = prints ?? [];
  const volumeSize = item.sizes?.reduce((acc, size) => acc + size.userQty!, 0);

  const totalPrintPrice = totalPrintPriceFunc(list);
  const total = (item.price + totalPrintPrice) * volumeSize;

  const selectPrint = (printId?: string) => {
    if (!printId) return;
    dispatch(constructorActions.setSelectedPrintId(printId));
  };

  const deletePrint = (event: React.MouseEvent, printId?: string) => {
    event.stopPropagation();
    if (!printId) return;
    dispatch(cartActions.deletePrint({ printId, itemCartId: orderElement.itemCartId }));
    if (selectedPrintId === printId) dispatch(constructorActions.setSelectedPrintId(null));
  };

  const rows = list.length
    ? list.map((print, index) => {
        const selected = Boolean(print.id && print.id === selectedPrintId);
        return (
          <button
            key={print.id || index}
            type="button"
            data-print-row=""
            className={selected ? `${styles.print_row} ${styles.print_row_selected}` : styles.print_row}
            onClick={() => selectPrint(print.id)}
          >
            <span>{printLine(print, index, volumeSize)}</span>
            <span
              className={styles.print_delete}
              onClick={(event) => deletePrint(event, print.id)}
            >
              Удалить
            </span>
          </button>
        );
      })
    : <p className={styles.print_empty}>Принты —</p>;

  if (dock) {
    return (
      <div className={styles.orderInfoDock}>
        <p className={styles.dock_name}>{item.name}</p>
        <p className={styles.dock_line}>
          {item.price.toLocaleString("ru-RU")} Р. × {volumeSize} шт. — {(item.price * volumeSize).toLocaleString("ru-RU")} Р.
        </p>
        {rows}
        <p className={styles.dock_total}>Итого: {total.toLocaleString("ru-RU")} Р.</p>
      </div>
    );
  }

  return (
    <div className={styles.orderInfo}>
      <p className={styles.order_info_title}>{item.name}</p>
      <p className={styles.order_info_subtitle}>
        <span className={styles.order_info_line_span}>
          {`${item.price} Р. X ${volumeSize} шт.`}
          <span className={styles.order_info_line_span_end}>
            {` - ${item.price * volumeSize} Р.`}
          </span>
        </span>
      </p>
      {rows}
      <p className={styles.order_info_title}>
        Итого: {total.toLocaleString("ru-RU")} Р.
      </p>
    </div>
  );
};

export default OrderInfo;
