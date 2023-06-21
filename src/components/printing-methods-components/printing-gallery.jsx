import React, { useEffect } from "react";
import styles from './printing-gallery.module.css';
import IMG_0404 from '../images/IMG_0404.webp';
import sample1 from '../images/sample1.webp';
import sample2 from '../images/sample2.webp';
import sample3 from '../images/sample3.webp';
import sample4 from '../images/sample4.webp';
import sample5 from '../images/sample5.webp';

const PrintingGallery = () => {
  return (
    <>
  <section className={styles.fourth_screen}>
    <img
      className={styles.gallery_img}
      alt="print sample"
      src={IMG_0404}
      loading="lazy"
      decoding="async"
    ></img>
    <img
      className={styles.gallery_img}
      alt="print sample"
      src={sample1}
      loading="lazy"
      decoding="async"
    ></img>
    <img
      className={styles.gallery_img}
      alt="print sample"
      src={sample2}
      loading="lazy"
      decoding="async"
    ></img>
    <img
      className={styles.gallery_img}
      alt="print sample"
      src={sample3}
      loading="lazy"
      decoding="async"
    ></img>
    <img
      className={styles.gallery_img}
      alt="print sample"
      src={sample4}
      loading="lazy"
      decoding="async"
    ></img>
    <img
      className={styles.gallery_img}
      alt="print sample"
      src={sample5}
      loading="lazy"
      decoding="async"
    ></img>
  </section>
  </>
  )
};

export default PrintingGallery;
