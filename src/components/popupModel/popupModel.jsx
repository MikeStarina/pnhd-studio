import React, { useEffect } from 'react';
import styles from './popupModel.module.css';

const PopupModel = ({ onClose, children }) => {
    const closeByBGClick = (e) => {
        if (e.target.id === 'container') onClose();
    };

    const handleEscKeydown = (e) => {
        e.key === 'Escape' && onClose();
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
                    onMouseDown={onClose}
                >
                    X
                </button>
                {children}
            </div>
        </div>
    );
};

export default PopupModel;
