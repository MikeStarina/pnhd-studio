import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import styles from './footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer} id="footer">
      <Link
        className={styles.footer_link}
        to="https://pnhd.ru"
        target="blank"
      >
        Оптовый отдел
      </Link>
      <Link className={styles.footer_link} to="/shop">
        Каталог
      </Link>
      <HashLink className={styles.footer_link} to="/#contacts">
        Контакты
      </HashLink>
      <Link className={styles.footer_link} to="/oferta">
        Оферта
      </Link>
      <ul className={styles.list}>
        <li>
          <Link
            className={styles.item}
            to="/termotransfernaya-pechat"
          >
            Флекс
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/vishivka">
            Вышивка
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/shelkografiya">
            Шелкография
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/pryamaya-dtg-pechat">
            DTG
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/dtf-pechat">
            DTF
          </Link>
        </li>
      </ul>
      <ul className={styles.list}>
        <li>
          <Link className={styles.item} to="/pechat-printov">
            Печать изображений
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/pechat-photo">
            Печать фото
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/pechat-nadpisej">
            Печать надписей
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/pechat-familii">
            Печать имени и номера
          </Link>
        </li>
        <li>
          <Link className={styles.item} to="/pechat-logotipa">
            Печать логотипов
          </Link>
        </li>
      </ul>
    </footer>
  );
}

export default Footer;
