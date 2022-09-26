import React from "react";
import styles from './case-gallery.module.css';
import IMG_0404 from '../images/IMG_0404.jpg';




const CaseGallery = () => {
    return (
        <section className={styles.fourth_screen}>
            <img className={styles.gallery_img} alt='print sample' src={IMG_0404}></img>
            <img className={styles.gallery_img} alt='print sample' src={IMG_0404}></img>
            <img className={styles.gallery_img} alt='print sample' src={IMG_0404}></img>
            <img className={styles.gallery_img} alt='print sample' src={IMG_0404}></img>
            <img className={styles.gallery_img} alt='print sample' src={IMG_0404}></img>
            <img className={styles.gallery_img} alt='print sample' src={IMG_0404}></img>
        </section>
    );
};

export default CaseGallery;