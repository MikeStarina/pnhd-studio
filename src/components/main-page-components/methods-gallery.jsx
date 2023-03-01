import React from "react";
import styles from './methods-gallery.module.css';
import methods01 from '../images/methods01.jpg';
import methods02 from '../images/methods02.jpg';
import methods03 from '../images/methods03.jpg';
import methods04 from '../images/methods04.jpg';
import methods05 from '../images/methods05.jpg';


const MethodsGallery = () => {
    return (
        <section className={styles.screen}>
            <div className={styles.gallery_card}>
                <img src={methods01} alt="tee" className={styles.card_img} loading='lazy' decoding='async'/>
                
                <div className={styles.card_title}>
                    <h5 className={styles.card_heading}>ФЛЕКС</h5>
                    <p className={styles.card_description}>
                        Надписи и однотонные лого.
                    </p>
                </div>
            </div>
            <div className={styles.gallery_card}>
                <img src={methods05} alt="tee" className={styles.card_img} loading='lazy' decoding='async'/>
                <div className={styles.card_title}>
                    <h5 className={styles.card_heading}>DTG</h5>
                    <p className={styles.card_description}>
                        Если нужно напечатать фотку или картинку.
                    </p>
                </div>
                
            </div>
            <div className={styles.gallery_card}>
                <img src={methods04} alt="tee" className={styles.card_img} loading='lazy' decoding='async'/>
                <div className={styles.card_title}>
                    <h5 className={styles.card_heading}>ВЫШИВКА</h5>
                    <p className={styles.card_description}>
                        Для логотипов и шевронов.
                    </p>
                </div>
            </div>
            <div className={styles.gallery_card}>
                <img src={methods02} alt="tee" className={styles.card_img} loading='lazy' decoding='async'/>
                <div className={styles.card_title}>
                    <h5 className={styles.card_heading}>DTF</h5>
                    <p className={styles.card_description}>
                        Если нужно от 10 штук.
                    </p>
                </div>
            </div>
            <div className={styles.gallery_card}>
                <img src={methods03} alt="tee" className={styles.card_img} loading='lazy' decoding='async'/>
                <div className={styles.card_title}>
                    <h5 className={styles.card_heading}>ШЕЛКОГРАФИЯ</h5>
                    <p className={styles.card_description}>
                        Для эффектов и оооочень больших тиражей.
                    </p>
                </div>
            </div>
        

        </section>
    );
}

export default MethodsGallery;