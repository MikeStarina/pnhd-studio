import React from "react";
import styles from './burger-icon.module.css';
import burger from '../images/burger.svg';


const BurgerIcon = ({ openMenu }) => {
    return (
        <div className={styles.burger}>
            <img src={burger} alt='main menu' className={styles.burger_icon} onClick={openMenu}></img>
        </div>
    );


}


export default BurgerIcon;