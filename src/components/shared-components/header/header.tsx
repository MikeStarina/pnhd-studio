import React from 'react';
import styles from './header.module.css';
//import Image from 'next/image';
import Link from 'next/link';
import MenuButton from '../mobile-menu/menu-button';
//import pnhd_studio_header_logo from '../../../../public/pnhd_studio_header_logo.svg';
import LeadButton from '../lead-button/lead-button';
import UtmLink from '../utm-link/utm-link';



const Header: React.FC = () => {
    return (
       
        <header className={styles.header}>
                <UtmLink
                    pathname='/'
                >
                    <p className={styles.header_logo}>PNHD{'>'}STUDIO</p>
                </UtmLink>
            <ul className={styles.header_menu}>
                <li className={styles.header_menu_listItem}>
                        <UtmLink
                            pathname='/'
                            style={styles.header_menu_link}
                            hash='#methods'
                        >
                            методы нанесения
                        </UtmLink>
                </li>
                <li className={styles.header_menu_listItem}>
                        <UtmLink
                            pathname='/shop'
                            style={styles.header_menu_link}
                        >
                            каталог
                        </UtmLink>
                </li>
                <li className={styles.header_menu_listItem}>
                    <UtmLink style={styles.header_menu_link} pathname='/' hash='#stages'>этапы работы</UtmLink>
                </li>
                <li className={styles.header_menu_listItem}>
                    <UtmLink style={styles.header_menu_link} pathname='/' hash='#feedback'>отзывы</UtmLink>
                </li>
                <li className={styles.header_menu_listItem}>
                    <UtmLink style={styles.header_menu_link} pathname='/' hash='#faq'>FAQ</UtmLink>
                </li>
                <li className={styles.header_menu_listItem}>
                    <UtmLink style={styles.header_menu_link} pathname='/' hash='#contacts'>контакты</UtmLink>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href='https://pnhd.ru' target='blank'>корпоративный отдел</Link>
                </li>
            </ul>
            <div className={styles.header_buttonsWrapper}>
                <span className={styles.header_phoneButton}>+7 (812) 904 61 56</span>
                <LeadButton styleType='green' />
            </div>
            <MenuButton />
        </header>
       
    )
}

export default Header;