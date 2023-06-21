import React from 'react';
import styles from './footer.module.css';
import { Link } from 'react-router-dom';
import { HashLink } from 'react-router-hash-link';

const Footer = () => {
    return (
        <footer className={styles.footer} id="footer">
            <Link
                className={styles.footer_link}
                to="https://pnhd.ru"
                target="blank"
            >
                Оптовый отдел
            </Link>
            <Link className={styles.footer_link} to="/shop">
                Каталог
            </Link>
            <HashLink className={styles.footer_link} to="/#contacts">
                Контакты
            </HashLink>
            <Link className={styles.footer_link} to="/oferta">
                Оферта
            </Link>
            <ul className={styles.list}>
                <li>
                    <Link
                        className={styles.item}
                        to="/termotransfernaya-pechat"
                    >
                        Флекс
                    </Link>
                </li>
                <li>
                    <Link className={styles.item} to="/vishivka">
                        Вышивка
                    </Link>
                </li>
                <li>
                    <Link className={styles.item} to="/shelkografiya">
                        Шелкография
                    </Link>
                </li>
                <li>
                    <Link className={styles.item} to="/pryamaya-dtg-pechat">
                        DTG
                    </Link>
                </li>
                <li>
                    <Link className={styles.item} to="/dtf-pechat">
                        DTF
                    </Link>
                </li>
            </ul>
            <ul className={styles.list}>
                <li className={styles.item}>Печать изображений</li>
                <li className={styles.item}>Печать фото</li>
                <li className={styles.item}>Печать надписей</li>
                <li className={styles.item}>Печать имени и номера</li>
                <li className={styles.item}>Печать логотипов</li>
            </ul>
        </footer>
    );
};

export default Footer;
