import React from 'react';
import { Link } from 'react-router-dom';
import styles from './shop-gallery.module.css';
import ShopGalleryItem from './shop-gallery-item';

function ShopGallery({ printingProduct, data }) {
  return (
    <section className={styles.screen}>
      {printingProduct != 'true' ? (
        <>
          <h4 className={styles.heading}>
            А НА
            <span className={styles.textStyle_italic}>ЧЁМ</span>
            {' '}
            ПЕЧАТАЕТЕ?
          </h4>
          <p className={styles.description}>
            Текстиль, который мы сделали сами вот этими вот руками на нашей
            фабрике в Санкт-Петербурге, так что качество 11/10, гарантируем!
          </p>
        </>
      ) : ''}
      <div className={styles.wrapper}>
        {data.map((item) => (<ShopGalleryItem data={item} key={item.id} />))}
      </div>
    </section>
  );
}

export default ShopGallery;
