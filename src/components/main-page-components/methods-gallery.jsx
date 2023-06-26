import React from 'react';
import { Link } from 'react-router-dom';
import styles from './methods-gallery.module.css';
import methods01 from '../images/methods01.webp';
import methods02 from '../images/methods02.webp';
import methods03 from '../images/methods03.webp';
import methods04 from '../images/methods04.webp';
import methods05 from '../images/methods05.webp';

const MethodsGallery = () => {
    return (
        <section className={styles.screen}>
            <div className={styles.gallery_card}>
                <Link to="/termotransfernaya-pechat">
                    <img
                        src={methods01}
                        alt="tee"
                        className={styles.card_img}
                        loading="lazy"
                        decoding="async"
                    />

                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>ФЛЕКС</h5>
                        <p className={styles.card_description}>
                            Надписи и однотонные лого.
                        </p>
                    </div>
                </Link>
            </div>
            <div className={styles.gallery_card}>
                <Link to="/pryamaya-dtg-pechat">
                    <img
                        src={methods05}
                        alt="tee"
                        className={styles.card_img}
                        loading="lazy"
                        decoding="async"
                    />
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>DTG</h5>
                        <p className={styles.card_description}>
                            Если нужно напечатать фотку или картинку.
                        </p>
                    </div>
                </Link>
            </div>
            <div className={styles.gallery_card}>
                <Link to="/vishivka">
                    <img
                        src={methods04}
                        alt="tee"
                        className={styles.card_img}
                        loading="lazy"
                        decoding="async"
                    />
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>ВЫШИВКА</h5>
                        <p className={styles.card_description}>
                            Для логотипов и шевронов.
                        </p>
                    </div>
                </Link>
            </div>
            <div className={styles.gallery_card}>
                <Link to="/dtf-pechat">
                    <img
                        src={methods02}
                        alt="tee"
                        className={styles.card_img}
                        loading="lazy"
                        decoding="async"
                    />
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>DTF</h5>
                        <p className={styles.card_description}>
                            Если нужно от 10 штук.
                        </p>
                    </div>
                </Link>
            </div>
            <div className={styles.gallery_card}>
                <Link to="/shelkografiya">
                    <img
                        src={methods03}
                        alt="tee"
                        className={styles.card_img}
                        loading="lazy"
                        decoding="async"
                    />
                    <div className={styles.card_title}>
                        <h5 className={styles.card_heading}>ШЕЛКОГРАФИЯ</h5>
                        <p className={styles.card_description}>
                            Для эффектов и оооочень больших тиражей.
                        </p>
                    </div>
                </Link>
            </div>
        </section>
    );
};

export default MethodsGallery;
