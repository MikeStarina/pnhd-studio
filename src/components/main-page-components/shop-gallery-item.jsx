import React from 'react';
import { Link } from 'react-router-dom';
import styles from './shop-gallery-item.module.css';

function ShopGalleryItem({ data }) {
  return (
    <div className={styles.card}>
      <img
        className={styles.card_img}
        src={data.img}
        alt="shop"
        loading="lazy"
        decoding="async"
      />
      <div className={styles.card_title}>
        <h5 className={styles.card_heading}>
          {data.head}
          {' '}
          <span className={styles.textStyle_italic}>{data.headItalic}</span>
        </h5>
        <Link to={data.link} className={styles.card_button}>
          СМОТРЕТЬ
        </Link>
      </div>
    </div>
  );
}

export default ShopGalleryItem;
