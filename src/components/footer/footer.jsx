import React from "react";
import styles from './footer.module.css';
import { Link } from "react-router-dom";



const Footer = () => {
    return (
        <footer className={styles.footer}>
            <Link className={styles.footer_link}>Опттовый отдел</Link>
            <Link className={styles.footer_link}>FAQ</Link>
            <Link className={styles.footer_link}>Каталог</Link>
            <Link className={styles.footer_link}>Конструктор</Link>
            <Link className={styles.footer_link}>Контакты</Link>
            <Link className={styles.footer_link}>Конфиденциальность</Link>
            <Link className={styles.footer_link}>Правила печати</Link>
        </footer>
    );
}

export default Footer;