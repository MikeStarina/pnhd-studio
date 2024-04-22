import React from "react";
import styles from './product-card.module.css';



type TCardProps = {
    title: String,
    price: Number,
    img: string,
    sizes: Array<{qty: number, name: String}>
}


const ProductCard: React.FC<TCardProps> = ({ title, price, img, sizes }) => {
    
    return (
        <div className={styles.card}>
        {sizes.length === 0 && (
          <div className={styles.no_stock_icon}>Нет в наличии</div>
        )}
        <img src={img} alt="card pic" className={styles.card_image} width='371px' height='556px' loading="lazy" />
        <div className={styles.card_caption}>
          <p className={styles.card_title}>{title}</p>
          <p className={styles.card_price}>
            {price.toString()}
            {' '}
            Р.
          </p>
        </div>
      </div>
    )
}

export default ProductCard;