import React from "react";
import styles from './main-menu.module.css';



const MainMenu = () => {
    return (
        <div className={styles.burger}>
            <div className={styles.burger_stripe}></div>
            <div className={styles.burger_stripe}></div>
            <div className={styles.burger_stripe}></div>
        </div>
    );


}


export default MainMenu;