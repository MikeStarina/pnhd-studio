import React from "react";
import styles from './main-menu.module.css';
import { Link } from "react-router-dom";
import closeIcon from '../images/closeIcon.svg';




const MainMenu = ({ closeMenu }) => {
    return (
        <div className={styles.menu_screen}>
            <div className={styles.menu_box}>
                <button type='button' className={styles.close_button} onClick={closeMenu}>
                    <img src={closeIcon} alt='close icon' className={styles.close_icon}></img>
                </button>
                <Link className={styles.menu_link}>КАТАЛОГ</Link>
                <Link className={styles.menu_link}>FAQ</Link>
                <Link className={styles.menu_link}>ЦЕНЫ</Link>
                <Link className={styles.menu_link}>КОНСТРУКТОР</Link>
                <Link className={styles.menu_link}>КОНТАКТЫ</Link>
            </div>
        </div>
    );
}

export default MainMenu;