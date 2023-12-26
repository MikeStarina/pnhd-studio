import React, { useEffect } from 'react';
import styles from './popupModel.module.css';

function PopupModel({ onClose, children, type = 'infoPopup' }) {
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
      role="button"
      tabIndex="0"
    >
      <div className={type === 'infoPopup' ? styles.lead : styles.no_lead}>
        <button
          type="button"
          className={styles.close_button}
          onMouseDown={onClose}
        >
          X
        </button>
        {type === 'infoPopup' && children }
      </div>
      {type === 'noInfo' && children }
    </div>
  );
}

export default PopupModel;
