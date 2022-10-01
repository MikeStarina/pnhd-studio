import React from "react";
import styles from './footer.module.css';
import { Link } from "react-router-dom";



const Footer = () => {
    return (
        <footer className={styles.footer}>
            <Link className={styles.footer_link} to='/'>Опттовый отдел</Link>
            <Link className={styles.footer_link} to='/'>FAQ</Link>
            <Link className={styles.footer_link} to='/'>Каталог</Link>
            <Link className={styles.footer_link} to='/'>Конструктор</Link>
            <Link className={styles.footer_link} to='/'>Контакты</Link>
            <Link className={styles.footer_link} to='/'>Конфиденциальность</Link>
            <Link className={styles.footer_link} to='/'>Правила печати</Link>
        </footer>
    );
}

export default Footer;