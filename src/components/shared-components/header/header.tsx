import React from 'react';
import styles from './header.module.css';
import { actions } from '@/redux/utils-slice/utils.slice';
//import Image from 'next/image';
import Link from 'next/link';
import MenuButton from '../mobile-menu/menu-button';
//import pnhd_studio_header_logo from '../../../../public/pnhd_studio_header_logo.svg';
import LeadButton from '../lead-button/lead-button';



const Header: React.FC<{ searchParams: {[n:string]: string}}> = ({ searchParams }) => {

    return (
        <header className={styles.header}>
            <Link href={{
                pathname: '/',
                query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()
            }} style={{textDecoration: 'none'}}>
                {/*<Image className={styles.logo} src={pnhd_studio_header_logo} alt='Логотип PINHEAD STUDIO'/>*/}
                <p className={styles.header_logo}>PNHD{'>'}STUDIO</p>
            </Link>
            <ul className={styles.header_menu}>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{
                        pathname: '/',
                        hash: '#methods',
                        query: (() => {
                            const { category, type, priceSort, ...rest} = searchParams;
                            return rest;
                        })()
                    }}>методы нанесения</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{pathname: '/shop', query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}}>каталог</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#stages', query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}}>этапы работы</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#feedback', query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}}>отзывы</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#faq', query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}}>FAQ</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{ pathname: '/', hash: '#contacts', query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}}>контакты</Link>
                </li>
                <li className={styles.header_menu_listItem}>
                    <Link className={styles.header_menu_link} href={{pathname: 'https://pnhd.ru', query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}} target='blank'>корпоративный отдел</Link>
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