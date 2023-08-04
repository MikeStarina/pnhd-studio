import React from 'react';
import styles from './case-gallery.module.css';
import IMG_0404 from '../images/IMG_0404.webp';
import sample1 from '../images/sample1.webp';
import sample2 from '../images/sample2.webp';
import sample3 from '../images/sample3.webp';
import sample4 from '../images/sample4.webp';
import sample5 from '../images/sample5.webp';

function CaseGallery() {
  return (
    <>
      <section className={styles.fourth_screen}>
        <img
          className={styles.gallery_img}
          alt="print sample"
          src={IMG_0404}
          loading="lazy"
          decoding="async"
        />
        <img
          className={styles.gallery_img}
          alt="print sample"
          src={sample1}
          loading="lazy"
          decoding="async"
        />
        <img
          className={styles.gallery_img}
          alt="print sample"
          src={sample2}
          loading="lazy"
          decoding="async"
        />
        <img
          className={styles.gallery_img}
          alt="print sample"
          src={sample3}
          loading="lazy"
          decoding="async"
        />
        <img
          className={styles.gallery_img}
          alt="print sample"
          src={sample4}
          loading="lazy"
          decoding="async"
        />
        <img
          className={styles.gallery_img}
          alt="print sample"
          src={sample5}
          loading="lazy"
          decoding="async"
        />
      </section>
      <div className={styles.button_wrapper}>
        <a href="https://www.instagram.com/pnhd.studio/" target="blank">
          <button type="button" className={styles.link_button}>
            INSTAGRAM
          </button>
        </a>
        <a href="https://vk.com/pinheadspb" target="blank">
          <button type="button" className={styles.link_button}>
            VK
          </button>
        </a>
        <a href="https://t.me/pnhd_studio" target="blank">
          <button type="button" className={styles.link_button}>
            TELEGRAM
          </button>
        </a>
        <a href="whatsapp://send?phone=79313566552" target="blank">
          <button type="button" className={styles.link_button}>
            WHATSAPP
          </button>
        </a>
      </div>
    </>
  );
}

export default CaseGallery;
