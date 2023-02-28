import React, { useEffect } from "react";
import styles from './footer.module.css';
import { Link } from "react-router-dom";
import { HashLink } from "react-router-hash-link";



const Footer = () => {

    
    
    return (
        <footer className={styles.footer}>
            <a className={styles.footer_link} href='https://pnhd.ru' target='blank'>Оптовый отдел</a>
            
            <Link className={styles.footer_link} to='/shop'>Каталог</Link>
            <HashLink className={styles.footer_link} to='/#contacts'>Контакты</HashLink>
            <Link className={styles.footer_link} to='/oferta'>Оферта</Link>
        </footer>
    );
}

export default Footer;