import React from 'react';
import styles from './card-item.module.css';
// import man from '../images/man.jpg';

function CardItem({
  title, price, img, sizes,
}) {
  return (
    <div className={styles.card}>
      {sizes.length === 0 && (
        <div className={styles.no_stock_icon}>Нет в наличии</div>
      )}
      <img src={img} alt="card pic" className={styles.card_image} />
      <div className={styles.card_caption}>
        <p className={styles.card_title}>{title}</p>
        <p className={styles.card_price}>
          {price}
          {' '}
          Р.
        </p>
      </div>
    </div>
  );
}

export default CardItem;
