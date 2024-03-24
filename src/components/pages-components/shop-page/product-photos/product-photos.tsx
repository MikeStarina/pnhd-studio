'use client';
import React from "react";
import styles from './product-photos.module.css';
import { IProduct } from "@/app/utils/types";
import { apiBaseUrl } from "@/app/utils/constants";






const Photos: React.FC<{ item: IProduct }> = ({ item }) => {

    const { galleryPhotos, name } = item;

    return (
         <div className={styles.photo_box}>
            {galleryPhotos && galleryPhotos.map((el, index) => (
              <div className={styles.photo_wrapper} key={index}>
                  <img className={styles.photo} src={`${apiBaseUrl}${el}`} alt={name} />
              </div>
          
      ))}
    </div>
    )
}

export default Photos;