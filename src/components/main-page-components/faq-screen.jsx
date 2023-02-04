import React from "react";
import styles from './faq-screen.module.css';
import circle50px from '../images/circle50px.png';
import { Link } from "react-router-dom";



const FaqScreen = () => {
    return (
        <section className={styles.screen}>




                <h4 className={styles.heading}>A <span className={styles.textStyle_italic}>КАК</span> ЭТО РАБОТАЕТ?</h4>
                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle} alt='circle'></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ТЕКСТИЛЬ / <span className={styles.textStyle_italic}>GARMENT</span></h5>
                        <p className={styles.screen_description}>
                            Выбери нужный текстиль в нашем каталоге, размер и нажми "добавить принт"! Если просто нужна бланковая футболка или худи, то есть опция
                            добавить в корзину без принта. Ну а чтобы напечатать на своей футболке просто принеси ее в студию :)
                        </p>
                    </div>    
                </div>





                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle} alt='circle'></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ДИЗАЙН / <span className={styles.textStyle_italic}>DESIGN</span></h5>
                        <p className={styles.screen_description}>
                            Выбери место для принта и загрузи изображение для печати - конструктор сразу посчитает стоимость!<br></br>
                            П.С. если чувствуешь, что функционала конструктора не хватает под твои задачи, то лучше связаться с нашими дизайнерами - они
                            отредактируют принты и сформируют задание на печать. Это бесплатно.
                        </p>
                    </div>    
                </div>




                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle} alt='circle'></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ПЕЧАТЬ / <span className={styles.textStyle_italic}>SOME MAGIC</span></h5>
                        <p className={styles.screen_description}>
                            Введи свои контактные данные в корзине и нажми "оформить заказ". Через пару часов после оплаты мы позвоним и расскажем как
                            можно получить готовый заказ!
                        </p>
                    </div>    
                </div>


                {/*
                <Link  to='/faq'>
                    <button type='button' className={styles.faq_button}>FAQ</button>
                </Link> */}

            </section>
    );
};

export default FaqScreen;