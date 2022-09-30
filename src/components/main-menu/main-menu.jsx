import React from "react";
import styles from './main-menu.module.css';
import burger from '../images/burger.svg';


const MainMenu = () => {
    return (
        <div className={styles.burger}>
            <img src={burger} alt='main menu' className={styles.burger_icon}></img>
        </div>
    );


}


export default MainMenu;