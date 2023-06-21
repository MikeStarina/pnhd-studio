import React from "react";
import styles from "./printing-faq.module.css";
import circle50px from "../images/circle50px.png";

const PrintingFaq = (data) => {
  const info = data.faq;

  return (
    <section className={styles.screen}>
      {info.variants.map((item, index) => {
        return (
          <div className={styles.block_wrapper} key={index}>
            <img
              src={circle50px}
              className={styles.screen_circle}
              alt="circle"
            ></img>
            <div className={styles.text_wrapper}>
              <h5 className={styles.screen_heading}>{item.screen_heading}</h5>
              <p className={styles.screen_description}>
                {item.screen_description}
              </p>
            </div>
          </div>
        );
      })}

      {info.description.length > 3 && (
        <div className={styles.block_wrapper}>
          <p className={styles.bottom_description}>
            Если вы ищете надежную и профессиональную студию для заказа
            термотрансферной печати на футболках в Санкт-Петербурге, обратитесь
            к нам в Studio Pinhead. Мы гарантируем высокое качество,
            индивидуальный подход и оперативное выполнение заказа. Создайте
            яркий и оригинальный стиль вместе с нами!
          </p>
        </div>
      )}
    </section>
  );
};

export default PrintingFaq;
