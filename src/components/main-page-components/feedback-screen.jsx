import React from "react";
import styles from './feedback-screen.module.css';
import circle50px from '../images/circle50px.png';



const FeedbackScreen = () => {
    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>
                ОТЗЫВЫ / <span className={styles.textStyle_italic}>FEEDBACK</span>
            </h4>
            <div className={styles.wrapper}>
                <div className={styles.feedback_card}>
                    <img src={circle50px} alt='logo' className={styles.card_image}></img>
                    <div className={styles.text_wrapper}>
                        <p className={styles.feedback}>
                                
                            Ребята, спасибо! Очень выручили когда нужно было срочно напечатать! Качество отличное!
                        </p>  
                        <p className={styles.feedback_sign}>Саша М.</p>          
                    </div>
                </div>
                <div className={styles.feedback_card}>
                    <img src={circle50px} alt='logo' className={styles.card_image}></img>
                    <div className={styles.text_wrapper}>
                        <p className={styles.feedback}>
                                
                            Ребята, спасибо! Очень выручили когда нужно было срочно напечатать! Качество отличное!
                        </p>  
                        <p className={styles.feedback_sign}>Саша М.</p>          
                    </div>
                </div>
            </div>
            <div className={styles.wrapper}>
                <div className={styles.feedback_card}>
                    <img src={circle50px} alt='logo' className={styles.card_image}></img>
                    <div className={styles.text_wrapper}>
                        <p className={styles.feedback}>
                                
                            Ребята, спасибо! Очень выручили когда нужно было срочно напечатать! Качество отличное!
                        </p>  
                        <p className={styles.feedback_sign}>Саша М.</p>          
                    </div>
                </div>
                <div className={styles.feedback_card}>
                    <img src={circle50px} alt='logo' className={styles.card_image}></img>
                    <div className={styles.text_wrapper}>
                        <p className={styles.feedback}>
                                
                            Ребята, спасибо! Очень выручили когда нужно было срочно напечатать! Качество отличное!
                        </p>  
                        <p className={styles.feedback_sign}>Саша М.</p>          
                    </div>
                </div>
            </div>

            <div className={styles.button_wrapper}>
                <button type='button' className={styles.link_button}>ОТЗЫВЫ YANDEX</button>
                <button type='button' className={styles.link_button}>ОТЗЫВЫ GOOGLE</button>
            </div>
        </section>
    );
}

export default FeedbackScreen;