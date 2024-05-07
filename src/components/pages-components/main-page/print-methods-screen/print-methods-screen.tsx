import React from "react";
import styles from "./print-methods-screen.module.css";

import Image from "next/image";
import card_image_one from "../../../../../public/card_image_one.png";
import card_image_two from "../../../../../public/card_image_two.png";
import card_image_three from "../../../../../public/card_image_three.png";
import card_image_four from "../../../../../public/card_image_four.png";
import card_image_five from "../../../../../public/card_image_five.png";
import button_arrow_right from "../../../../../public/button_arrow_right.svg";
import UtmLink from "@/components/shared-components/utm-link/utm-link";
import Link from "next/link";

const PrintMethodsScreen: React.FC = () => {
    return (
        <section className={styles.screen} id='methods'>
            <div className={styles.screen_firstRow}>
                <div className={styles.firstRow_card}>
                    <div className={styles.card_textWrapper}>
                        <h4 className={styles.card_title}>{"> "}шелкография</h4>
                        <p className={styles.card_text}>
                            Обеспечивает высокую детализацию принтов разных цветов и оттенков,
                            устойчивость к стирке и износу
                        </p>
                        <Link href="/methods/shelkografiya">
                            <button type="button" className={styles.card_button}>
                                <Image src={button_arrow_right} alt="стрелка вправо" />
                            </button>
                        </Link>
                    </div>

                    <div className={styles.card_imageWrapper}>
                        <Image
                            src={card_image_one}
                            alt="фото мерча"
                            className={styles.card_image}
                        />
                    </div>
                </div>

                <div className={styles.screen_titleWrapper}>
                    <h2 className={styles.screen_title}>воплощай смелые идеи</h2>
                    <p className={styles.screen_subtitle}>с любым методом нанесения</p>
                </div>
            </div>
            <div className={styles.screen_secondRow}>
                <div className={styles.secondRow_vertCard}>
                    <div className={styles.vertCard_imageWrapper}>
                        <Image
                            src={card_image_two}
                            alt="стрелка вправо"
                            style={{ objectFit: "cover", width: "100%" }}
                        />
                    </div>
                    <div className={styles.card_textWrapper}>
                    <h4 className={styles.card_title}>{"> "}флекс</h4>
                    <p className={styles.card_text}>
                        Подходит для принтов с кислотными, золотыми, медными цветами и
                        светоотражателей
                    </p>
                    <Link href="/methods/termotransfernaya-pechat">
                        <button type="button" className={styles.card_button}>
                            <Image src={button_arrow_right} alt="стрелка вправо" />
                        </button>
                    </Link>
                    </div>
                </div>

                <div className={styles.secondRow_horizCardWrapper}>
                    <div className={styles.firstRow_card}>
                        <div className={styles.card_textWrapper}>
                            <h4 className={styles.card_title}>{"> "}dtf</h4>
                            <p className={styles.card_text}>
                                Помогает нанести рисунок с яркими насыщенными цветами, которые
                                не выцветают со временем
                            </p>
                            <Link href="/methods/dtf-pechat">
                                <button type="button" className={styles.card_button}>
                                    <Image src={button_arrow_right} alt="стрелка вправо" />
                                </button>
                            </Link>
                        </div>

                        <div className={styles.card_imageWrapper}>
                            <Image
                                src={card_image_four}
                                alt="фото мерча"
                                className={styles.card_image}
                            />
                        </div>
                    </div>
                    <div className={styles.firstRow_card}>
                        <div className={styles.card_textWrapper}>
                            <h4 className={styles.card_title}>{"> "}dtg</h4>
                            <p className={styles.card_text}>
                                Наносится на белые вещи за 5–15 минут, а рисунок сохраняется
                                столько же, сколько на обычных вещах из магазинов
                            </p>
                            <Link href="/methods/pryamaya-dtg-pechat">
                                <button type="button" className={styles.card_button}>
                                    <Image src={button_arrow_right} alt="стрелка вправо" />
                                </button>
                            </Link>
                        </div>

                        <div className={styles.card_imageWrapper}>
                            <Image
                                src={card_image_five}
                                alt="фото мерча"
                                className={styles.card_image}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.secondRow_vertCard}>
                    <div className={styles.vertCard_imageWrapper}>
                        <Image
                            src={card_image_three}
                            alt="стрелка вправо"
                            style={{ objectFit: "cover", width: "100%" }}
                        />
                    </div>
                    <div className={styles.card_textWrapper}>
                    <h4 className={styles.card_title}>{"> "}вышивка</h4>
                    <p className={styles.card_text}>
                        Используется для лого и фраз, которые выделяются на одежде и
                        добавляют индивидуальностим
                    </p>
                    <Link href="/methods/vishivka">
                        <button type="button" className={styles.card_button}>
                            <Image src={button_arrow_right} alt="стрелка вправо" />
                        </button>
                    </Link>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PrintMethodsScreen;
