"use client";
import React, { useState } from "react";
import styles from "./mobile-menu.module.css";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { actions as utilsActions } from "@/redux/utils-slice/utils.slice";
import Link from "next/link";

const MobileMenu: React.FC = () => {
    const dispatch = useAppDispatch();
    const { isMobileMenuActive } = useAppSelector((store) => store.utils);

    const closeMenuHandler = () => {
        dispatch(utilsActions.setMobileMenuActive(false));
    };

    return (
        <>
            {isMobileMenuActive ? (
                <div className={styles.menu}>
                    <div className={styles.menu_closeButtonWrapper}>
                        <button
                            type="button"
                            onClick={closeMenuHandler}
                            className={styles.menu_closeButton}
                        >
                            <div className={styles.button_line}></div>
                            <div className={styles.button_line}></div>
                        </button>
                    </div>
                    <div className={styles.menu_wrapper}>
                        <ul className={styles.menu_list}>
                            <li className={styles.menu_listItem}>
                                <Link
                                    href={{
                                        pathname: "/",
                                        hash: "#methods",
                                    }}
                                    onClick={closeMenuHandler}
                                    className={styles.menu_link}
                                >
                                    методы нанесения
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href="/shop"
                                    className={styles.menu_link}
                                    onClick={closeMenuHandler}
                                >
                                    каталог
                                </Link>
                            </li>
                            <li>
                                <Link 
                                    href={{
                                        pathname: "/",
                                        hash: "#stages",
                                    }}
                                    className={styles.menu_link}
                                    onClick={closeMenuHandler}
                                >
                                    этапы работы
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={{
                                        pathname: "/",
                                        hash: "#feedback",
                                    }}
                                    className={styles.menu_link}
                                    onClick={closeMenuHandler}
                                >
                                    отзывы
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={{
                                        pathname: "/",
                                        hash: "#faq",
                                    }}
                                    className={styles.menu_link}
                                    onClick={closeMenuHandler}
                                >
                                    faq
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href={{
                                        pathname: "/",
                                        hash: "#contacts",
                                    }}
                                    className={styles.menu_link}
                                    onClick={closeMenuHandler}
                                >
                                    контакты
                                </Link>
                            </li>
                        </ul>
                        <div className={styles.menu_buttonsWrapper}>
                            <Link className={styles.menu_phoneButton} href='/'>+7 (812) 904 61 56</Link>
                            <Link className={styles.menu_phoneButton} href='https://pnhd.ru'>корпоративный отдел</Link>                           
                            <button className={styles.menu_leadButton}>проконсультироваться</button>
                        </div>
                    </div>
                </div>
            ) : null}
        </>
    );
};

export default MobileMenu;
