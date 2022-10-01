import React from "react";
import styles from './main-menu.module.css';
import { Link } from "react-router-dom";
import closeIcon from '../images/closeIcon.svg';




const MainMenu = ({ closeMenu }) => {
    return (
        <div className={styles.menu_screen}>
            <div className={styles.menu_box} >
                <button type='button' className={styles.close_button} onClick={closeMenu}>
                    <img src={closeIcon} alt='close icon' className={styles.close_icon}></img>
                </button>
                <Link className={styles.menu_link} to='/'>КАТАЛОГ</Link>
                <Link className={styles.menu_link} to='/'>FAQ</Link>
                <Link className={styles.menu_link} to='/'>ЦЕНЫ</Link>
                <Link className={styles.menu_link} to='/contacts'>КОНТАКТЫ</Link>
            </div>
        </div>
    );
}

export default MainMenu;