import React from "react";
import styles from "./type-of-print-faq.module.css";
import circle50px from "../images/circle50px.png";

const TypeOfPrintFaq = (data) => {
    const { title, description, variants } = data;

    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>{title}</h4>
            {variants.map((item, index) => {
                return (
                    <div className={styles.block_wrapper} key={index}>
                        <img
                            src={circle50px}
                            className={styles.screen_circle}
                            alt="circle"
                        ></img>
                        <div className={styles.text_wrapper}>
                            <h5 className={styles.screen_heading}>{item.screen_heading}</h5>
                            {Array.isArray(item.screen_description) ? (
                                item.screen_description.map((item, index) => {
                                    return (
                                        <p
                                            className={`${styles.screen_description} ${styles.screen_description_bottom}`}
                                            key={index}
                                        >
                                            {item}
                                        </p>
                                    );
                                })
                            ) : (
                                <p className={styles.screen_description}>
                                    {item.screen_description}
                                </p>
                            )}
                        </div>
                    </div>
                );
            })}
            {Array.isArray(description) && (
                <>
                    {description.map((item, index) => {
                        return (
                            <div className={styles.block_wrapper} key={index}>
                                <p className={styles.bottom_description}>{item}</p>
                            </div>
                        );
                    })}
                </>
            )}
            {(!Array.isArray(description) && description.length) > 3 && (
                <div className={styles.block_wrapper}>
                    <p className={styles.bottom_description}>{description}</p>
                </div>
            )}
        </section>
    );
};

export default TypeOfPrintFaq;