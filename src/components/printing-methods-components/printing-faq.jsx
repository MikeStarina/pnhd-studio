import React from "react";
import styles from "./printing-faq.module.css";
import circle50px from "../images/circle50px.png";

const PrintingFaq = () => {
  return (
    <section className={styles.screen}>
      <div className={styles.block_wrapper}>
        <img
          src={circle50px}
          className={styles.screen_circle}
          alt="circle"
        ></img>
        <div className={styles.text_wrapper}>
          <h5 className={styles.screen_heading}>Качество и долговечность</h5>
          <p className={styles.screen_description}>
            Термотрансферная печать обеспечивает высокое качество изображения с
            четкими деталями и яркими цветами. Печать прочно закрепляется на
            ткани, что делает ее стойкой к истиранию.
          </p>
        </div>
      </div>

      <div className={styles.block_wrapper}>
        <img
          src={circle50px}
          className={styles.screen_circle}
          alt="circle"
        ></img>
        <div className={styles.text_wrapper}>
          <h5 className={styles.screen_heading}>Разнообразие дизайнов</h5>
          <p className={styles.screen_description}>
            С помощью термотрансферной печати вы можете создавать разнообразные
            дизайны, включая сложные графические элементы и, логотипы с одним
            или двумя цветами.
          </p>
        </div>
      </div>

      <div className={styles.block_wrapper}>
        <img
          src={circle50px}
          className={styles.screen_circle}
          alt="circle"
        ></img>
        <div className={styles.text_wrapper}>
          <h5 className={styles.screen_heading}>Оперативность</h5>
          <p className={styles.screen_description}>
            Термотрансферная печать идеально подходит для срочного нанесения
            плашечных одноцветных логотипов и изображений в небольших тиражах.
          </p>
        </div>
      </div>

      <div className={styles.block_wrapper}>
        <img
          src={circle50px}
          className={styles.screen_circle}
          alt="circle"
        ></img>
        <div className={styles.text_wrapper}>
          <h5 className={styles.screen_heading}>
            Разнообразие цветов и эффектов
          </h5>
          <p className={styles.screen_description}>
            Доступна широкая гамма цветов и различных эффектов, таких как
            металлизированные оттенки или блестки, которые позволяют сделать
            дизайн футболки еще более привлекательным.
          </p>
        </div>
      </div>
      <div className={styles.block_wrapper}>
        <p className={styles.bottom_description}>
          Если вы ищете надежную и профессиональную студию для заказа
          термотрансферной печати на футболках в Санкт-Петербурге, обратитесь к
          нам в Studio Pinhead. Мы гарантируем высокое качество, индивидуальный
          подход и оперативное выполнение заказа. Создайте яркий и оригинальный
          стиль вместе с нами!
        </p>
      </div>
    </section>
  );
};

export default PrintingFaq;
