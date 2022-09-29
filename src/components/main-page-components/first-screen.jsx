import React from "react";
import styles from './first-screen.module.css';
import { Link } from "react-router-dom";
import bgvideo from '../../bgvideo.mp4';





const FirstScreen = () => {
    return (
        <section className={styles.main_screen}>
            <video autoplay='autoplay' muted='muted' loop='loop' class={styles.background_video}>
                <source src={bgvideo} type="video/mp4"></source>
            </video>
            <div className={styles.video_overlay}></div>
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
        <Link className={styles.link}>
            <button type='button' className={styles.button}>КОНСТРУКТОР</button>
        </Link>
    </section>
    );
}

export default FirstScreen;