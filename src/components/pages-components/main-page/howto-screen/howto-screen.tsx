import React from "react";
import styles from "./howto-screen.module.css";

import Image from "next/image";
import card_image1 from "../../../../../public/howto_image1.png";
import card_image2 from "../../../../../public/howto_image2.png";
import card_image3 from "../../../../../public/howto_image3.png";

const HowToScreen: React.FC = () => {
    return (
        <section className={styles.screen}>
            <h2 className={styles.screen_title}>
                всё&nbsp;просто:&nbsp;купи, дождись, забери
            </h2>
            <div className={styles.screen_cardsWrapper}>
                <div className={styles.screen_card}>
                    <div className={styles.card_mainWrapper}>
                        <div className={styles.card_imageWrapper}>
                            <Image
                                src={card_image1}
                                alt="футболка с принтом"
                                className={styles.card_image}
                            />
                        </div>
                        <h4 className={styles.card_title}>1</h4>
                    </div>
                    <p className={styles.card_text}>
                        Оплачивай заказ картой любого банка по счёту компании
                    </p>
                </div>
                <div className={styles.screen_card}>
                    <div className={styles.card_mainWrapper}>
                        <div className={styles.card_imageWrapper}>
                            <Image
                                src={card_image2}
                                alt="футболка с принтом"
                                className={styles.card_image}
                            />
                        </div>
                        <h4 className={styles.card_title}>2</h4>
                    </div>
                    <p className={styles.card_text}>
                        Забирай одежду в пункте выдачи «СДЭК» в своём городе
                    </p>
                </div>
                <div className={styles.screen_card}>
                    <div className={styles.card_mainWrapper}>
                        <div className={styles.card_imageWrapper}>
                            <Image
                                src={card_image3}
                                alt="футболка с принтом"
                                className={styles.card_image}
                            />
                        </div>
                        <h4 className={styles.card_title}>3</h4>
                    </div>
                    <p className={styles.card_text}>
                        Проверь мерч. Мы заменим его, если что-то будет не так
                    </p>
                </div>
            </div>
        </section>
    );
};

export default HowToScreen;
