import React from "react";
import styles from './card-item.module.css';
import man from '../images/man.jpg';




const CardItem = () => {

   
   
    return (
        <div className={styles.card}>
            <img src={man} alt="card pic" className={styles.card_image} />
            <div className={styles.card_caption}>
                <p className={styles.card_title}>Футболка оверсайз</p>
                <p className={styles.card_price}>2000 Р.</p>
            </div>
        </div>
    );

}

export default CardItem;