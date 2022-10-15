import React from "react";
import styles from './card-item.module.css';
//import man from '../images/man.jpg';




const CardItem = ({title, price, img}) => {

   
   
    return (
        <div className={styles.card}>
            <img src={img} alt="card pic" className={styles.card_image} />
            <div className={styles.card_caption}>
                <p className={styles.card_title}>{title}</p>
                <p className={styles.card_price}>{price} Р.</p>
            </div>
        </div>
    );

}

export default CardItem;