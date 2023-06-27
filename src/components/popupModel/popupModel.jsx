import React, { useEffect } from 'react';
import styles from './popupModel.module.css';

const PopupModel = ({ openPopup, children }) => {
    const closeByBGClick = (e) => {
        if (e.target.id === 'container') {
            openPopup();
        }
    };

    const handleEscKeydown = (e) => {
        e.key === 'Escape' && openPopup();
    };

    useEffect(() => {
        document.addEventListener('keydown', handleEscKeydown);
        return () => {
            document.removeEventListener('keydown', handleEscKeydown);
        };
    }, []);

    return (
        <div
            className={styles.popup_container}
            onMouseDown={closeByBGClick}
            id="container"
        >
            <div className={styles.lead}>
                <button
                    type="button"
                    className={styles.close_button}
                    onMouseDown={openPopup}
                >
                    X
                </button>
                {children}
            </div>
        </div>
    );
};

export default PopupModel;
