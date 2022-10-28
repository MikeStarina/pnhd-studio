import React from "react";
import styles from './main-menu.module.css';
import { Link } from "react-router-dom";
import closeIcon from '../images/closeIcon.svg';
import { useSelector } from "react-redux";




const MainMenu = ({ closeMenu }) => {

    const { userAuth } = useSelector(store => store.userData);

    return (
        <div className={styles.menu_screen}>
            <div className={styles.menu_box} >
                <div className={styles.wrapper}>
                    <button type='button' className={styles.close_button} onClick={closeMenu}>
                        <img src={closeIcon} alt='close icon' className={styles.close_icon}></img>
                    </button>
                    <Link className={styles.menu_link} to='/'>ГЛАВНАЯ</Link>
                    <Link className={styles.menu_link} to='/shop'>КАТАЛОГ</Link>
                    <Link className={styles.menu_link} to='/faq'>FAQ</Link>
                    <Link className={styles.menu_link} to='/prices'>ЦЕНЫ</Link>
                    <Link className={styles.menu_link} to='/contacts'>КОНТАКТЫ</Link>
                </div>
                <div className={styles.wrapper}>
                    {userAuth.isAuthenticated ? (<Link to='/profile' className={styles.menu_link}>МОЙ ПРОФИЛЬ</Link>) : (
                    <>
                        <Link to='/login' className={styles.menu_link}>ВХОД</Link>
                        <Link to='/register' className={styles.menu_link}>РЕГИСТРАЦИЯ</Link>
                    </>
                    )}

                   
                </div>
            </div>
        </div>
    );
}

export default MainMenu;