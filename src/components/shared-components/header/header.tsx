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
                <Link href='/' style={{ textDecoration: 'none' }}>
                    <p className={styles.header_logo}>PNHD{'>'}STUDIO</p>
                </Link>
            <ul className={styles.header_menu}>
                <li className={styles.header_menu_listItem}>
                        <Link
                            className={styles.header_menu_link}
                            href={{ pathname: '/', hash: '#methods'}}
                        >
                            методы нанесения
                        </Link>
                </li>
                <li className={styles.header_menu_listItem}>
                        <Link
                            href='/shop'
                            className={styles.header_menu_link}
                        >
                            каталог
                        </Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#stages'}}>этапы работы</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{pathname: '/', hash: '#feedback'}}>отзывы</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{pathname: '/', hash: '#faq'}}>FAQ</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{pathname: '/contacts'}}>контакты</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <UtmLink style={styles.header_menu_link} pathname='https://pnhd.ru' target='blank'>оптовый отдел</UtmLink>
                </li>
            </ul>
            <div className={styles.header_buttonsWrapper}>
                <Link href='tel:+78129046156' className={styles.header_phoneButton}>+7 (812) 904 61 56</Link>
                <LeadButton styleType='green' />
            </div>
            <MenuButton />
        </header>
       
    )
}

export default Header;