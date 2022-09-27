import React from "react";
import styles from './shop-gallery.module.css';



const ShopGallery = () => {
    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>А НА <span className={styles.textStyle_italic}>ЧЁМ</span> ПЕЧАТАЕТЕ?</h4>
            <p className={styles.description}>
                Текстиль, который мы сделали сами вот этими вот руками на нашей фабрике в Санкт-Петербурге, так что качество 11/10, гарантируем!
            </p>
            <div className={styles.wrapper}>



                <div className={styles.card}>

                    <h5 className={styles.card_heading}>
                        ВСЕ ТОВАРЫ / <span className={styles.textStyle_italic}>ALL</span>
                    </h5>
                    <button type='button' className={styles.card_button}>СМОТРЕТЬ</button>
                </div>



                <div className={styles.card}>
                    
                    <h5 className={styles.card_heading}>
                        МУЖСКОЕ / <span className={styles.textStyle_italic}>MAN</span>
                    </h5>
                    <button type='button' className={styles.card_button}>СМОТРЕТЬ</button>
                </div>



                <div className={styles.card}>

                    <h5 className={styles.card_heading}>
                        ЖЕНСКОЕ / <span className={styles.textStyle_italic}>WOMAN</span>
                    </h5>
                    <button type='button' className={styles.card_button}>СМОТРЕТЬ</button>
                </div>



                <div className={styles.card}>

                    <h5 className={styles.card_heading}>
                        АКСЕССУАРЫ / <span className={styles.textStyle_italic}>??</span>
                    </h5>
                    <button type='button' className={styles.card_button}>СМОТРЕТЬ</button>
                </div>



            </div>
        </section>
    );
};

export default ShopGallery;