import React from 'react';
import styles from './printing-gallery.module.css';

function PrintingGallery(data) {
  const { gallery } = data;
  return (
    <section className={styles.fourth_screen}>
      {gallery.map((item) => (
        <img
            className={styles.gallery_img}
            alt="print sample"
            src={item}
            loading="lazy"
            decoding="async"
            key={item}
        />
      ))}
    </section>
  );
}

export default PrintingGallery;
