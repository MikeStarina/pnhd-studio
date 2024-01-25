import React from 'react';
import styles from './faq-screen.module.css';
import circle50px from '../images/circle50px.png';

function FaqScreen() {
  return (
    <section className={styles.screen}>
      <h4 className={styles.heading}>
        A
        <span className={styles.textStyle_italic}>КАК</span>
        ЭТО РАБОТАЕТ?
      </h4>
      <div className={styles.block_wrapper}>
        <img src={circle50px} className={styles.screen_circle} alt="circle" />
        <div className={styles.text_wrapper}>
          <h5 className={styles.screen_heading}>
            ТЕКСТИЛЬ /
            <span className={styles.textStyle_italic}>GARMENT</span>
          </h5>
          <p className={styles.screen_description}>
            Выбери нужный текстиль в&nbsp;нашем каталоге, размер и&nbsp;нажми
            &laquo;добавить принт&raquo;! Если просто нужна бланковая футболка
            или худи, то&nbsp;есть опция добавить в&nbsp;корзину без принта.
            Ну&nbsp;а&nbsp;чтобы напечатать на&nbsp;своей одежде просто принеси
            ее&nbsp;в&nbsp;студию :)
          </p>
        </div>
      </div>

      <div className={styles.block_wrapper}>
        <img src={circle50px} className={styles.screen_circle} alt="circle" />
        <div className={styles.text_wrapper}>
          <h5 className={styles.screen_heading}>
            ДИЗАЙН /
            <span className={styles.textStyle_italic}>DESIGN</span>
          </h5>
          <p className={styles.screen_description}>
            Выбери место для принта и&nbsp;загрузи изображение&nbsp;&mdash;
            онлайн конструктор сразу посчитает стоимость печати на&nbsp;одежде!
            <br />
            П.С. если чувствуешь, что функционала конструктора не хватает под
            твои задачи, то лучше связаться с нашими дизайнерами - они
            отредактируют принты и сформируют задание на печать. Это бесплатно.
          </p>
        </div>
      </div>

      <div className={styles.block_wrapper}>
        <img src={circle50px} className={styles.screen_circle} alt="circle" />
        <div className={styles.text_wrapper}>
          <h5 className={styles.screen_heading}>
            ПЕЧАТЬ /
            <span className={styles.textStyle_italic}>SOME MAGIC</span>
          </h5>
          <p className={styles.screen_description}>
            Введи свои контактные данные в&nbsp;корзине и&nbsp;нажми
            &laquo;оформить заказ&raquo;. Через пару часов после оплаты
            мы&nbsp;позвоним и&nbsp;расскажем как можно получить готовый заказ!
          </p>
        </div>
      </div>

      {/*
                <Link  to='/faq'>
                    <button type='button' className={styles.faq_button}>FAQ</button>
                </Link> */}
    </section>
  );
}

export default FaqScreen;
