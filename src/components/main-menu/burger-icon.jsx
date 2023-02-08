import React from "react";
import styles from './burger-icon.module.css';
import burger from '../images/burger.svg';


const BurgerIcon = ({ openMenu, openPopup }) => {

    

    return (
        <div className={styles.burger}>
            <a href='tel:+78129046156' className={styles.link}>/ 8 (812) 904-61-56</a>
            <a href='https://t.me/pnhd_studio' className={styles.link} target='blank'>/ TG</a>
            <a href='whatsapp://send?phone=79313566552' className={styles.link} target='blank'>/ WA</a>
            <button className={styles.button} onClick={openPopup}>ПЕРЕЗВОНИТЬ?</button>
            <img src={burger} alt='main menu' className={styles.burger_icon} onClick={openMenu}></img>
        </div>
    );


}


export default BurgerIcon;