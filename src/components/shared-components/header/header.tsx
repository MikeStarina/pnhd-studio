import React from 'react';
import styles from './header.module.css';
import { actions } from '@/redux/utils-slice/utils.slice';
//import Image from 'next/image';
import Link from 'next/link';
import MenuButton from '../mobile-menu/menu-button';
//import pnhd_studio_header_logo from '../../../../public/pnhd_studio_header_logo.svg';
import LeadButton from '../lead-button/lead-button';



const Header: React.FC = () => {

    return (
        <header className={styles.header}>
            <Link href='/' style={{textDecoration: 'none'}}>
                {/*<Image className={styles.logo} src={pnhd_studio_header_logo} alt='Логотип PINHEAD STUDIO'/>*/}
                <p className={styles.header_logo}>PNHD{'>'}STUDIO</p>
            </Link>
            <ul className={styles.header_menu}>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{
                        pathname: '/',
                        hash: '#methods'
                    }}>методы нанесения</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href='/shop'>каталог</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#stages'}}>этапы работы</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#feedback'}}>отзывы</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#faq'}}>FAQ</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#contacts'}}>контакты</Link>
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