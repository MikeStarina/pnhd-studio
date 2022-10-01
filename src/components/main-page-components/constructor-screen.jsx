import React from "react";
import styles from './constructor-screen.module.css';
import { Link } from "react-router-dom";



const ConstructorScreen = () => {
    return (
        <section className={styles.screen}>
            <div className={styles.wrapper}>
                <p className={styles.description}>
                    У нас есть конструктор, в котором можно посмотреть как будет выглядеть именно твой принт! &rarr;
                </p>
                <Link  to='/'>
                    <button className={styles.button} type='button'>КОНСТРУКТОР</button>
                </Link>

            </div>
            <h5 className={styles.heading}>А КАК <span className={styles.textStyle_italic}>ПЕЧАТАЕТЕ?</span></h5>
        </section>
    );
}

export default ConstructorScreen;