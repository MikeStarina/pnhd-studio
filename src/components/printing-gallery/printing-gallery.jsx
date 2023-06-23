import React from "react";
import styles from "./printing-gallery.module.css";

const PrintingGallery = (data) => {
  const {gallery} = data;
  return (
      <section className={styles.fourth_screen}>
        {gallery.map((item, index) => {
          return (
            <img
              className={styles.gallery_img}
              alt="print sample"
              src={item}
              loading="lazy"
              decoding="async"
              key={index}
            ></img>
          );
        })}        
      </section>
  );
};

export default PrintingGallery;
