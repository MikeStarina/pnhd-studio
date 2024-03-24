'use client'
import React from 'react';
import styles from './popup.module.css';
import { useAppSelector } from '@/redux/redux-hooks';
import LeadForm from '../lead-form/lead-form';
import { useAppDispatch } from '@/redux/redux-hooks';
import { actions as utilsActions } from '@/redux/utils-slice/utils.slice';





const Popup = () => {
    const dispatch = useAppDispatch()
    const { isPopupVisible, popupTitle, popupType } = useAppSelector(store => store.utils)
    const popupStyles = isPopupVisible ? styles.popup : styles.popup__disabled;

    const closeButtonClickHandler = () => {
        dispatch(utilsActions.setPopupVisibility());
        dispatch(utilsActions.setPopupTitle(''));
        dispatch(utilsActions.setPopupType(''));
    }

    return (
        <div className={popupStyles}>
            <div className={styles.popup_box}>
                <button
                    className={styles.popup_closeButton}
                    onClick={closeButtonClickHandler}
                >
                    X
                </button>
                <h3 className={styles.popup_title}>
                    {popupTitle}
                </h3>
                {popupType === 'lead' && <LeadForm />}
            </div>
        </div>
    )
}

export default Popup;