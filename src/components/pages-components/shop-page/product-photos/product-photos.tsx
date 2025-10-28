'use client';
import React, { useState } from "react";
import styles from './product-photos.module.css';
import { IProduct } from "@/app/utils/types";
import { apiBaseUrl, CDN_URL } from "@/app/utils/constants";
import Image from "next/image";





const Photos: React.FC<{ item: IProduct, el: string, index: number }> = ({ item, el, index }) => {

  const [imageSrc, setImageSrc] = useState(`${CDN_URL}/${item.slug}_${index}.jpg`);
  // const [imageSrc, setImageSrc] = useState(`${CDN_URL}/test.jpg`);
  const [imageError, setImageError] = useState(false);

  return (
    <div className={styles.photo_wrapper}>
      {/* <img className={styles.photo} src={`${apiBaseUrl}${el}`} alt={name} /> */}
      <Image
        src={imageSrc}
        alt="card pic"
        className={styles.photo}
        width={371}
        height={556}
        loading="lazy"
        onError={(e) => {
          if (imageSrc.includes('cdn.pnhd.ru')) {
            setImageSrc(`${apiBaseUrl}${el}`);
          } else {
            setImageError(true);
          }
        }}
        style={{ display: imageError ? 'none' : 'block' }}
      />
    </div>
  )
}

export default Photos;