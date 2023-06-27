import React, { useState } from 'react';
import styles from './popupModel.module.css';
import { useSelector, useDispatch } from 'react-redux';

const PopupModel = ({ openPopup, children }) => {
    const dispatch = useDispatch();
    const { orderFormData, error } = useSelector((store) => store.utilityState);
    const [isMessageSent, setIsMessageSent] = useState(false);
    const [isError, setIsError] = useState('');

    const closeByBGClick = (e) => {
        if (e.target.id === 'container') {
            openPopup();
        }
    };

    return (
        <div
            className={styles.popup_container}
            onClick={closeByBGClick}
            id="container"
        >
            <div className={styles.lead}>
                <button
                    type="button"
                    className={styles.close_button}
                    onClick={openPopup}
                >
                    X
                </button>
                {children}
            </div>
        </div>
    );
};

export default PopupModel;
