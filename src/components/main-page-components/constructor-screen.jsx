import React from "react";
import styles from './constructor-screen.module.css';
import { Link } from "react-router-dom";



const ConstructorScreen = () => {
    return (
        <section className={styles.screen}>
           

           
            <h5 className={styles.heading}>А КАК <span className={styles.textStyle_italic}>ПЕЧАТАЕТЕ?</span></h5>
        </section>
    );
}

export default ConstructorScreen;