import React from 'react';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';
import { contactPhone } from '../../utils/constants';
import styles from './fullscreen-menu.module.css';

const fullscreenMenu = () => (
  <header className={styles.menu_container}>
    <ul className={styles.main_menu}>
      <li className={styles.menu_elem}>
        <Link to="/" className={styles.menu_link}>
          {'Главная >'}
        </Link>
      </li>
      <li className={styles.menu_elem}>
        <Link to="/shop" className={styles.menu_link}>
          {'Каталог >'}
        </Link>
      </li>
      <li className={styles.menu_elem}>
        <HashLink to="/#contacts" className={styles.menu_link}>
          {'Контакты >'}
        </HashLink>
      </li>
      <li className={styles.menu_elem}>
        <a href="https://pnhd.ru" target="blank" className={styles.menu_link}>
          {'Оптовый отдел >'}
        </a>
      </li>
    </ul>

    <div className={styles.socials}>
      <a
        href="tel:+78129046156"
        className={styles.social_link}
        id="calltracking"
      >
        {contactPhone}
      </a>
      {/*
      <a href={telegram} className={styles.social_link} target="blank">
        / TG
      </a>
      <a href={vkontakte} className={styles.social_link} target="blank">
        / VK
      </a>
      <a
        href="https://instagram.com/pnhd.studio"
        className={styles.social_link}
        target="blank"
      >
        / INST
      </a>
      */}
    </div>
  </header>
);

export default fullscreenMenu;
