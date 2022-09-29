import React from "react";
import styles from './methods-gallery.module.css';
import methods01 from '../images/methods01.jpg';
import methods02 from '../images/methods02.jpg';
import methods03 from '../images/methods03.jpg';


const MethodsGallery = () => {
    return (
        <section className={styles.screen}>
            <div className={styles.gallery_card}>
                <img src={methods01} alt="tee" className={styles.card_img} />
                <div className={styles.card_title}>
                    <h5 className={styles.card_header}>ШЕЛКОГРАФИЯ</h5>
                </div>
            </div>
            <div className={styles.gallery_card}>
                <img src={methods02} alt="tee" className={styles.card_img} />
                <div className={styles.card_title}>
                    <h5 className={styles.card_header}>ШЕЛКОГРАФИЯ</h5>
                </div>
            </div>
            <div className={styles.gallery_card}>
                <img src={methods03} alt="tee" className={styles.card_img} />
                <div className={styles.card_title}>
                    <h5 className={styles.card_header}>ШЕЛКОГРАФИЯ</h5>
                </div>
            </div>
            <div className={styles.gallery_card}>
                <img src={methods02} alt="tee" className={styles.card_img} />
                <div className={styles.card_title}>
                    <h5 className={styles.card_header}>ШЕЛКОГРАФИЯ</h5>
                </div>
            </div>
            <div className={styles.gallery_card}>
                <img src={methods03} alt="tee" className={styles.card_img} />
                <div className={styles.card_title}>
                    <h5 className={styles.card_header}>ШЕЛКОГРАФИЯ</h5>
                </div>
            </div>
        

        </section>
    );
}

export default MethodsGallery;