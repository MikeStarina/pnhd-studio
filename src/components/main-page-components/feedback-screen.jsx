import React from 'react';
import styles from './feedback-screen.module.css';
import circle50px from '../images/circle50px.png';

function FeedbackScreen() {
  return (
    <section className={styles.screen}>
      <h4 className={styles.heading}>
        ОТЗЫВЫ /
        {' '}
        <span className={styles.textStyle_italic}>FEEDBACK</span>
      </h4>
      <div className={styles.wrapper}>
        <div className={styles.feedback_card}>
          <img
            src={circle50px}
            alt="logo"
            className={styles.card_image}
          />
          <div className={styles.text_wrapper}>
            <p className={styles.feedback}>
              Ребята, спасибо! Очень выручили когда нужно было
              срочно напечатать! Качество отличное!
            </p>
            <p className={styles.feedback_sign}>Саша М.</p>
          </div>
        </div>
        <div className={styles.feedback_card}>
          <img
            src={circle50px}
            alt="logo"
            className={styles.card_image}
          />
          <div className={styles.text_wrapper}>
            <p className={styles.feedback}>
              Отличные футболки, особенно порадовал оверсайз
              /обычно его никто не делает/ ну и качество печати!
            </p>
            <p className={styles.feedback_sign}>Дарья Т.</p>
          </div>
        </div>
      </div>
      <div className={styles.wrapper}>
        <div className={styles.feedback_card}>
          <img
            src={circle50px}
            alt="logo"
            className={styles.card_image}
          />
          <div className={styles.text_wrapper}>
            <p className={styles.feedback}>
              Делала худи подарок. Качество огонь, клиент доволен
              :)
            </p>
            <p className={styles.feedback_sign}>Наташа П.</p>
          </div>
        </div>
        <div className={styles.feedback_card}>
          <img
            src={circle50px}
            alt="logo"
            className={styles.card_image}
          />
          <div className={styles.text_wrapper}>
            <p className={styles.feedback}>
              Стирала толстовку уже раз 10. Печать как новая!
            </p>
            <p className={styles.feedback_sign}>Ира М.</p>
          </div>
        </div>
      </div>

      <div className={styles.button_wrapper}>
        <a href="https://yandex.ru/maps/-/CCUZ5Wd1KB" target="blank">
          <button type="button" className={styles.link_button}>
            ОТЗЫВЫ YANDEX
          </button>
        </a>
        <a href="https://goo.gl/maps/RePRmuUpzPVjYc7r7" target="blank">
          <button type="button" className={styles.link_button}>
            ОТЗЫВЫ GOOGLE
          </button>
        </a>
      </div>
    </section>
  );
}

export default FeedbackScreen;
