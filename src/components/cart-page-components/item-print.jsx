import React from "react";
import styles from './item-print.module.css';




const ItemPrint = ({ print, title, qty, params}) => {
    //console.log(params)

    return (

        <div className={styles.textile_description}>
                                       
            <div className={styles.desc_box}>
        
                <img src={print} alt='print pic' className={styles.item_img}></img>
                    <div className={styles.text_wrapper}>
                        <h3 className={styles.title}>{title}</h3>
                        <p className={styles.description}>Размер: {params.cartParams && params.cartParams.size}</p>
                        <p className={styles.description}>Формат: {params.cartParams && params.cartParams.format}</p>
                        <p className={styles.description}>Количество: {qty}</p>
                    

                    </div>
            </div>
       
            <p className={styles.price}>= {params.cartParams && params.cartParams.price * qty} P.</p>
            
       
       
        </div> 
    );
}

export default ItemPrint;