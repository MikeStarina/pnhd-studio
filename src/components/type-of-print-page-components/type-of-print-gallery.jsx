import React, { useEffect } from "react";
import styles from "./type-of-print-gallery.module.css";

const TypeOfPrintGallery = (data) => {
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

export default TypeOfPrintGallery;