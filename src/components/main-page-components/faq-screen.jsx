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
                        <h5 className={styles.screen_heading}>ДИЗАЙН / <span className={styles.textStyle_italic}>DESIGN</span></h5>
                        <p className={styles.screen_description}>
                            Отправь нам дизайн или приходи в студию. Наши дизайнеры помогут, если что-то пойдет не так!
                        </p>
                    </div>    
                </div>





                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle} alt='circle'></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ТЕКСТИЛЬ / <span className={styles.textStyle_italic}>GARMENT</span></h5>
                        <p className={styles.screen_description}>
                            Мы следим за трендами. Текстиль актуального кроя и цветов всегда в наличии. Просто выбери то, что подойдет именно тебе!
                        </p>
                    </div>    
                </div>




                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle} alt='circle'></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ПЕЧАТЬ / <span className={styles.textStyle_italic}>SOME MAGIC</span></h5>
                        <p className={styles.screen_description}>
                            Куча методов нанесений, а все для того чтобы именно твой принт выглядел идеально!
                        </p>
                    </div>    
                </div>



                <Link  to='/'>
                    <button type='button' className={styles.faq_button}>FAQ</button>
                </Link>

            </section>
    );
};

export default FaqScreen;