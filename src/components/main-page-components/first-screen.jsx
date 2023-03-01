import React from "react";
import styles from './first-screen.module.css';
import { Link } from "react-router-dom";
import bgvideo from '../../bgvideo.webm';
import videoposter from '../../videoposter.jpg';
import { HashLink } from "react-router-hash-link";





const FirstScreen = () => {
    return (
        <section className={styles.main_screen}>
            <div className={styles.video_container}>
                <video autoPlay='autoPlay' muted='muted' loop='loop' poster={videoposter} className={styles.background_video} buffered>
                    <source src={bgvideo} type="video/webm" className={styles.video}></source>
                </video>
            </div>
            
            <div className={styles.video_overlay}></div>
        <h1 className={styles.main_heading}>НАПЕЧАТАЕМ!</h1>
        <span className={styles.textStyle_italic}>
            <h2 className={styles.main_heading}>НАПЕЧАТАЕМ!</h2>
        </span>
        <h3 className={styles.main_heading}>НАПЕЧАТАЕМ!</h3>

        <p className={styles.main_description}>На наших или твоих  
            <span className={styles.textStyle_italic}>
                &nbsp;/трендовых/&nbsp;
            </span>
                 футболках и худи за 15 минут! Клик, чтобы начать!</p>
        <HashLink className={styles.link}  to='/#pricelist'>
            <button type='button' className={styles.button}>ЦЕНЫ</button>
        </HashLink>
    </section>
    );
}

export default FirstScreen;