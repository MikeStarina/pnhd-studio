"use client";
import React from "react";
import styles from "./print-stats.module.css";
import { IPrintFile } from "@/app/utils/types";

type TPrintStatProps = {
    printType: string,
    printTypeName: string,
    print?: IPrintFile,
    volumeSize: number,
}

const PrintStats: React.FC<TPrintStatProps> = ({ printTypeName, print, volumeSize }) => {
  return (
    <p className={styles.order_info_line}>
      <span className={styles.order_info_line_span_title}>
        {printTypeName}
        {print && print.cartParams ? " " : " -"}
      </span>
      <span
        className={
          print &&
          print.cartParams &&
          `${styles.order_info_line_span}`
        }
      >
        {print &&
          print.cartParams &&
          `${print.cartParams.format}, ${print.cartParams.size}, ${print.cartParams.price} Р. X ${volumeSize} шт.`}
        <span className={styles.order_info_line_span_end}>
          {print && print.file &&
            print.cartParams &&
            ` - ${print.cartParams.price * volumeSize} Р.`}
        </span>
      </span>
    </p>
  );
};

export default PrintStats;
