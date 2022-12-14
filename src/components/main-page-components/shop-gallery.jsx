import React from "react";
import styles from './shop-gallery.module.css';
import { Link } from "react-router-dom";
import all from '../images/all.jpg';
import man from '../images/man.jpg';
import wman from '../images/wman.jpg';
import acc from '../images/acc.jpg';




const ShopGallery = () => {
    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>А НА <span className={styles.textStyle_italic}>ЧЁМ</span> ПЕЧАТАЕТЕ?</h4>
            <p className={styles.description}>
                Текстиль, который мы сделали сами вот этими вот руками на нашей фабрике в Санкт-Петербурге, так что качество 11/10, гарантируем!
            </p>
            <div className={styles.wrapper}>



                <div className={styles.card}>

                    <img className={styles.card_img} src={all} alt='shop'></img>
                    
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>
                            ВСЕ ТОВАРЫ / <span className={styles.textStyle_italic}>ALL</span>
                        </h5>
                        <Link to='/shop' className={styles.card_button}>СМОТРЕТЬ</Link>
                    </div>
                </div>



                <div className={styles.card}>

                    <img className={styles.card_img} src={man} alt='shop'></img>
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>
                            МУЖСКОЕ / <span className={styles.textStyle_italic}>MAN</span>
                        </h5>
                        <Link to='/shop?s=man' className={styles.card_button}>СМОТРЕТЬ</Link>
                    </div>
                </div>



                <div className={styles.card}>

                    <img className={styles.card_img} src={wman} alt='shop'></img>
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>
                            ЖЕНСКОЕ / <span className={styles.textStyle_italic}>WOMAN</span>
                        </h5>
                        <Link to='/shop?s=woman' className={styles.card_button}>СМОТРЕТЬ</Link>
                    </div>
                </div>



                <div className={styles.card}>
                    <img className={styles.card_img} src={acc} alt='shop'></img>
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>
                            АКСЕССУАРЫ / <span className={styles.textStyle_italic}>??</span>
                        </h5>
                        <Link to='/shop?s=accesorize' className={styles.card_button}>СМОТРЕТЬ</Link>
                    </div>
                </div>



            </div>
        </section>
    );
};

export default ShopGallery;