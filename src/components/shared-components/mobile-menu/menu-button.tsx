'use client'
import React from 'react';
import styles from './menu-button.module.css';
import { useAppDispatch } from '@/redux/redux-hooks';
import { actions as utilsActions } from '@/redux/utils-slice/utils.slice';





const MenuButton: React.FC = () => {

    const dispatch = useAppDispatch();

    const clickHandler = () => {
        dispatch(utilsActions.setMobileMenuActive(true));
    }

    return (
        <button type='button' className={styles.menu_button} onClick={clickHandler}>
            <div className={styles.button_line}></div>
            <div className={styles.button_line}></div>
        </button>
    )
}

export default MenuButton;