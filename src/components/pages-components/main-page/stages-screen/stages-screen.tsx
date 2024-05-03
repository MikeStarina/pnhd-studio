import React from "react";
import styles from "./stages-screen.module.css";
import UtmLink from "@/components/shared-components/utm-link/utm-link";
import Link from "next/link";
import Image from "next/image";
import button_arrow_right from "../../../../../public/button_arrow_right.svg";
import stages_photo_one from "../../../../../public/stages_photo_one.png";
import stage_photo_two from "../../../../../public/stage_photo_two.png";
import stage_photo_three from "../../../../../public/stage_photo_three.png";
import stage_photo_four from "../../../../../public/stage_photo_four.png";

const StagesScreen: React.FC = () => {
    return (
        <section className={styles.screen} id="stages">
            <h2 className={styles.screen_title}>
                почувствуй себя дизайнером и собери мерч в онлайн-конструкторе
            </h2>
            <UtmLink pathname="/shop">
                <button type="button" className={styles.screen_button}>
                    <Image src={button_arrow_right} alt="стрелка вправо" />
                </button>
            </UtmLink>
            <div className={styles.screen_cards}>
                <div className={styles.cards_blockWrapper}>
                    <div className={styles.cards_textCard}>
                        <h4 className={styles.textCard_title}>Выбери одежду из каталога</h4>
                        <p className={styles.textCard_paragraph}>
                            Добавь в конструктор текстиль нужного фасона и размера
                        </p>
                    </div>

                    <div className={styles.cards_photoCard}>
                        <div className={styles.photoCard_wrapper}>
                            <Image
                                src={stages_photo_one}
                                alt="Фото модели"
                                style={{ objectFit: "cover", height: "100%" }}
                            />
                        </div>
                    </div>
                </div>
                <div className={styles.cards_blockWrapper}>
                    <div className={styles.cards_textCard}>
                        <h4 className={styles.textCard_title}>
                            Расположи принт на вещи и узнай стоимость
                        </h4>
                        <p className={styles.textCard_paragraph}>
                            Загрузи изображение и расположи его на одежде
                        </p>
                    </div>

                    <div className={styles.cards_photoCard}>
                        <div className={styles.photoCard_wrapper}>
                            <Image
                                src={stage_photo_two}
                                alt="Фото модели"
                                style={{ objectFit: "cover", height: "100%" }}
                            />
                        </div>
                    </div>
                </div>

                <div className={styles.cards_blockWrapper}>
                    <div className={styles.cards_photoCard}>
                        <div className={styles.photoCard_wrapper}>
                            <Image
                                src={stage_photo_three}
                                alt="Фото модели"
                                style={{ objectFit: "cover", height: "100%" }}
                            />
                        </div>
                    </div>

                    <div className={styles.cards_textCard}>
                        <h4 className={styles.textCard_title}>Оформи заказ</h4>
                        <p className={styles.textCard_paragraph}>
                            Отправь контактные данные, мы позвоним и расскажем, как забрать
                            мерч
                        </p>
                    </div>
                </div>

                <div className={styles.cards_blockWrapper}>
                    <div className={styles.cards_photoCard}>
                        <div className={styles.photoCard_wrapper}>
                            <Image
                                src={stage_photo_four}
                                alt="Фото модели"
                                style={{ objectFit: "cover", height: "100%" }}
                            />
                        </div>
                    </div>

                    <div className={styles.cards_textCard}>
                        <h4 className={styles.textCard_title}>
                            Дождись, когда сработает магия, и забери мерч
                        </h4>
                        <p className={styles.textCard_paragraph}>
                            Приди в пункт выдачи после прибытия посылки и порази всех новой
                            вещью
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default StagesScreen;
