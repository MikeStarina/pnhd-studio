import React from "react";
import styles from './item-print.module.css';




const ItemPrint = ({ print, title, qty}) => {


    return (

        <div className={styles.textile_description}>
                                       
            <div className={styles.desc_box}>
        
                <img src={print.file.url} alt='print pic' className={styles.item_img}></img>
                    <div className={styles.text_wrapper}>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.description}>Размер: {print.cartParams.size}</p>
                        <p className={styles.description}>Формат: {print.cartParams.format}</p>
                        <p className={styles.description}>Количество: {qty}</p>
                    

                    </div>
            </div>
       
            <p className={styles.price}>= {print.cartParams.price * qty} P.</p>
            
       
       
        </div> 
    );
}

export default ItemPrint;