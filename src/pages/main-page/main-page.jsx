import React from "react";
import styles from './main-page.module.css';

import { Link } from "react-router-dom";
import circle50px from '../../components/images/circle50px.png';





const MainPage = () => {



    return (
        <main className={styles.main_page}>
            <section className={styles.main_screen}>
                <h1 className={styles.main_heading}>НАПЕЧАТАЕМ!</h1>
                <span className={styles.textStyle_italic}>
                    <h2 className={styles.main_heading}>НАПЕЧАТАЕМ!</h2>
                </span>
                <h3 className={styles.main_heading}>НАПЕЧАТАЕМ!</h3>

                <p className={styles.main_description}>
                        На наших или твоих  
                    <span className={styles.textStyle_italic}>
                        &nbsp;/трендовых/&nbsp;
                    </span>
                         футболках и худи за 15 минут! Клик, чтобы перейти в конструктор!</p>
                <Link>
                    <button type='button' className={styles.button}>КОНСТРУКТОР</button>
                </Link>
            </section>
            <section className={styles.screen}>




                <h4 className={styles.heading}>A <span className={styles.textStyle_italic}>КАК</span> ЭТО РАБОТАЕТ?</h4>
                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle}></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ДИЗАЙН / <span className={styles.textStyle_italic}>DESIGN</span></h5>
                        <p className={styles.screen_description}>
                            Отправь нам дизайн или приходи в студию. Наши дизайнеры помогут, если что-то пойдет не так ^_^
                        </p>
                    </div>    
                </div>





                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle}></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ТЕКСТИЛЬ / <span className={styles.textStyle_italic}>GARMENT</span></h5>
                        <p className={styles.screen_description}>
                            Мы следим за трендами. Текстиль актуального кроя и цветов всегда в наличии. Просто выбери то, что подойдет именно тебе $$$
                        </p>
                    </div>    
                </div>




                <div className={styles.block_wrapper}>
                    <img src={circle50px} className={styles.screen_circle}></img>
                    <div className={styles.text_wrapper}>
                        <h5 className={styles.screen_heading}>ПЕЧАТЬ / <span className={styles.textStyle_italic}>SOME MAGIC</span></h5>
                        <p className={styles.screen_description}>
                            Куча методов нанесений, а все для того чтобы именно твой принт выглядел идеально! О_о
                        </p>
                    </div>    
                </div>



                <Link>
                    <button type='button' className={styles.faq_button}>FAQ</button>
                </Link>

            </section>



            <section className={styles.screen}>

                <h5 className={styles.main_heading}>А КАК БУДЕТ ВЫГЛЯДЕТЬ?</h5>
            </section>

        </main>
    );
}


export default MainPage;