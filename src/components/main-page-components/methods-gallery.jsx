import React from "react";
import styles from './methods-gallery.module.css';
//import { Link } from "react-router-dom";


const MethodsGallery = () => {
    return (
        <section className={styles.screen}>
            <div className={styles.gallery_card}></div>
            <div className={styles.gallery_card}></div>
            <div className={styles.gallery_card}></div>
            <div className={styles.gallery_card}></div>
            <div className={styles.gallery_card}></div>
            <div className={styles.gallery_card}></div>

        </section>
    );
}

export default MethodsGallery;