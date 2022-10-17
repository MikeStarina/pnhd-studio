import React from "react";
import styles from './footer.module.css';
import { Link } from "react-router-dom";



const Footer = () => {
    return (
        <footer className={styles.footer}>
            <a className={styles.footer_link} href='https://pnhd.ru' target='blank'>Оптовый отдел</a>
            <Link className={styles.footer_link} to='/faq'>FAQ</Link>
            <Link className={styles.footer_link} to='/shop'>Каталог</Link>
            <Link className={styles.footer_link} to='/contacts'>Контакты</Link>
            <Link className={styles.footer_link} to='/'>Конфиденциальность</Link>
            <Link className={styles.footer_link} to='/'>Правила печати</Link>
        </footer>
    );
}

export default Footer;