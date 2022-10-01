import React from "react";
import styles from './price-screen.module.css';
import { Link } from "react-router-dom";


const PriceScreen = () => {
    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>А СКОЛЬКО <span className={styles.textStyle_italic}>СТОИТ</span> ПЕЧАТЬ?</h4>
            <p className={styles.description}>
                Приведена стоимость для тиражей до 10 штук. Скидки для больших тиражей можно посмотреть в полной версии тут.
            </p>

            <div className={styles.button_wrapper}>
                <button type='button' className={styles.button}>DTG</button>
                <button type='button' className={styles.button}>DTF</button>
                <button type='button' className={styles.button}>ТЕРМОПЕРЕНОС</button>
                <button type='button' className={styles.button}>ВЫШИВКА</button>
            </div>

            <div className={styles.price_table}>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А6</p>
                    <p className={styles.row_heading}>300 Р.</p>
                    
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А5</p>
                    <p className={styles.row_heading}>400 Р.</p>
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А4</p>
                    <p className={styles.row_heading}>500 Р.</p>
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А3</p>
                    <p className={styles.row_heading}>600 Р.</p>
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А3+</p>
                    <p className={styles.row_heading}>700 Р.</p>
                </div>
            </div>



            <Link  to='/'>
                <button type='button' className={styles.action_button}>ЗАКАЗАТЬ</button>
            </Link>
            
        </section>
    );
}

export default PriceScreen;