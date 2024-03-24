"use client";
import React from "react";
import styles from "./order-info.module.css";
import { ICartOrderElement, IPrintFile } from "@/app/utils/types";
import PrintStats from "./print-stats";
import { totalPrintPriceFunc } from "@/app/utils/constructor-utils";

const OrderInfo: React.FC<{ orderElement: ICartOrderElement }> = ({
  orderElement,
}) => {
  const { prints, item } = orderElement;
  const volumeSize = item.sizes?.reduce((acc, item) => {
    return acc + item.userQty!;
  }, 0);

  const totalPrintPrice = totalPrintPriceFunc(prints?.front, prints?.back, prints?.lsleeve, prints?.rsleeve);

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
      <PrintStats
        printType="front"
        printTypeName="Печать на груди"
        print={prints?.front}
        volumeSize={volumeSize}
      />
      <PrintStats
        printType="back"
        printTypeName="Печать на спине"
        print={prints?.back}
        volumeSize={volumeSize}
      />
      <PrintStats
        printType="lsleeve"
        printTypeName="Печать на левом рукаве"
        print={prints?.lsleeve}
        volumeSize={volumeSize}
      />
      <PrintStats
        printType="rsleeve"
        printTypeName="Печать на правом рукаве"
        print={prints?.rsleeve}
        volumeSize={volumeSize}
      />

      <p className={styles.order_info_title}>
        Итого: {(item.price + totalPrintPrice) * volumeSize} Р.
      </p>
    </div>
  );
};

export default OrderInfo;
