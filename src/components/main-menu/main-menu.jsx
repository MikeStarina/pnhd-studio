import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { HashLink } from 'react-router-hash-link';
import styles from './main-menu.module.css';
import closeIcon from '../images/closeIcon.svg';
import { contactPhone } from '../../utils/constants';
import Button from '../../ui/Button/Button';

function MainMenu({ closeMenu, openPopup }) {
  const clickOnEmptyHandler = (e) => {
    if (e.target.id === 'background') {
      closeMenu();
    }
  };

  return (
    <div
      className={styles.menu_screen}
      onClick={clickOnEmptyHandler}
      id="background"
    >
      <div className={styles.menu_box}>
        <div className={styles.wrapper}>
          <button
            type="button"
            className={styles.close_button}
            onClick={closeMenu}
          >
            <img
              src={closeIcon}
              srcSet={closeIcon}
              alt="close icon"
              className={styles.close_icon}
            />
          </button>
          <Link
            className={styles.menu_link}
            to="/"
            onClick={closeMenu}
          >
            ГЛАВНАЯ
          </Link>
          <Link
            className={styles.menu_link}
            to="/shop"
            onClick={closeMenu}
          >
            КАТАЛОГ
          </Link>
          <a
            className={styles.menu_link}
            href="https://pnhd.ru"
            target="blank"
          >
            ОПТОВЫЙ ОТДЕЛ
          </a>
          <a
            className={styles.menu_link}
            href="https://instagram.com/pnhd.studio"
            target="blank"
          >
            ИНСТАГРАМ
          </a>
          <a
            className={styles.menu_link}
            href="https://vk.com/pinheadspb"
            target="blank"
          >
            ВК
          </a>
          <a
            className={styles.menu_link}
            href="https://t.me/pnhd_studio_bot"
            target="blank"
          >
            ТЕЛЕГРАМ
          </a>
        </div>

        <div className={styles.wrapper}>
          <HashLink
            to="/#contacts"
            className={styles.menu_link}
            onClick={closeMenu}
          >
            КОНТАКТЫ
          </HashLink>
        </div>
        <Button onClickTo={openPopup} type="callback" className={styles.button_call}>
          ПЕРЕЗВОНИТЬ?
        </Button>
      </div>
      <script src="//cdn.callibri.ru/callibri.js" async id="calltr" />
    </div>
  );
}

export default MainMenu;
