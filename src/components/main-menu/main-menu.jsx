import React from "react";
import styles from './main-menu.module.css';
import { Link } from "react-router-dom";
import closeIcon from '../images/closeIcon.svg';
import { useSelector } from "react-redux";




const MainMenu = ({ closeMenu }) => {

    //const { userAuth } = useSelector(store => store.userData);

    return (
        <div className={styles.menu_screen}>
            <div className={styles.menu_box} >
                <div className={styles.wrapper}>
                    <button type='button' className={styles.close_button} onClick={closeMenu}>
                        <img src={closeIcon} alt='close icon' className={styles.close_icon}></img>
                    </button>
                    <Link className={styles.menu_link} to='/'>ГЛАВНАЯ</Link>
                    <Link className={styles.menu_link} to='/shop'>КАТАЛОГ</Link>
                    <Link className={styles.menu_link} to='/oferta'>ОФЕРТА</Link>
                    <a className={styles.menu_link} href='https://pnhd.ru' target='blank'>ОПТОВЫЙ ОТДЕЛ</a>
                    <a className={styles.menu_link} href='https://instagram.com/pnhd.studio' target='blank'>ИНСТАГРАМ</a>
                    <a className={styles.menu_link} href='https://vk.com/pinheadspb' target='blank'>ВК</a>

                    
                    
                  
                </div>
                
                <div className={styles.wrapper}>
                    {/*{userAuth.isAuthenticated ? (<Link to='/profile' className={styles.menu_link}>МОЙ ПРОФИЛЬ</Link>) : (
                    <>
                        <Link to='/login' className={styles.menu_link}>ВХОД</Link>
                        <Link to='/register' className={styles.menu_link}>РЕГИСТРАЦИЯ</Link>
                    </>
                    )}*/}

                    <a href='tel:+78129046156' className={styles.menu_contacts}>+7(812)904-61-56</a>
                    <a href='https://t.me/pnhd_studio' className={styles.menu_contacts} target='blank'>Telegram</a>
                    <a href='whatsapp://send?phone=79313566552' className={styles.menu_contacts} target='blank'>Whatsapp</a>
                    <p className={styles.menu_contacts}>studio@pnhd.ru</p>
                    <p className={styles.menu_contacts}>ул. Чапыгина 1</p>
                </div>
                
            </div>
        </div>
    );
}

export default MainMenu;