'use client'
import React, { useState } from "react"
import styles from './contactsWidget.module.css'
import Link from "next/link"
import Image from "next/image"
import vk from '../../../../public/vk_logo.svg';
import tg from '../../../../public/tg_logo.svg';
import inst from '../../../../public/inst_logo.svg';
import wa from '../../../../public/wa_logo.svg';

const ContactsWidget = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const toggleMenu = () => {
        setIsMenuOpen(!isMenuOpen);
    }

    return (
        <div className={styles.contactsWidget}>
            {isMenuOpen && (
                <ul className={styles.contactsWidget_menu}>
                {/* <li className={styles.contactsWidget_menuItem}>
                    <Link href='tel:+78129046156' className={styles.contactsWidget_menuItem_link}>+7 (812) 904 61 56</Link>
                </li> */}
                {/* <li className={styles.contactsWidget_menuItem}>
                    <Link href='https://vk.com/pinheadspb' target="blank">
                        <button type='button' className={styles.contacts_socialButton}>
                            <Image src={vk} alt='логотип вконтакте' />
                        </button>
                    </Link>
                </li> */}
                <li className={styles.contactsWidget_menuItem}>
                    <Link href='https://t.me/pnhd_studio' target="blank" className={styles.contactsWidget_menuItemLink}>
                        <Image src={tg} alt='логотип телеграм' width={20} height={20} />
                        Написать в Телеграм
                    </Link>
                </li>
                {/* <li className={styles.contactsWidget_menuItem}>
                    <Link href='https://instagram.com/pnhd.studio/' target="blank">
                        <button type='button' className={styles.contacts_socialButton}>
                            <Image src={inst} alt='логотип инстаграм' />
                        </button>
                    </Link>
                </li> */}
                <li className={styles.contactsWidget_menuItem}>
                    <Link href='https://wa.me/79313566552' target="blank" className={styles.contactsWidget_menuItemLink}>
                        <Image src={wa} alt='логотип ватсап' width={20} height={20} />
                        Написать в Ватсап
                    </Link>
                </li>
            </ul>
            )}
            <button className={styles.contactsWidget_icon} onClick={toggleMenu}>
                <svg width="20" height="20" viewBox="0 0 60 60" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M57 -1e-07H21C19.35 -1e-07 18 1.35 18 3V33C18 34.65 19.35 36 21 36H37.77L48.9 47.13C49.41 47.67 50.16 48 51 48C52.65 48 54 46.65 54 45V36H57C58.65 36 60 34.65 60 33V3C60 1.35 58.65 -1e-07 57 -1e-07ZM21 39C17.7 39 15 36.3 15 33V12H3C1.35 12 -1e-07 13.35 -1e-07 15V45C-1e-07 46.65 1.35 48 3 48H6V57C6 58.65 7.35 60 9 60C9.84 60 10.59 59.67 11.13 59.13L22.23 48H39C40.65 48 42 46.65 42 45V44.49L36.51 39H21Z" fill="#040404" />
                </svg>
            </button>
        </div>
    )
}

export default ContactsWidget;