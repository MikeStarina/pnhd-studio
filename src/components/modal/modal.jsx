import React, { useEffect } from 'react';
import styles from './modal.module.css';

function Modal({ active, setActive, children }) {
  useEffect(() => {
    // event: KeyboardEvent - на будущее, для TS
    function handleEscapeKey(event) {
      if (event.code === 'Escape') {
        setActive(false);
      }
    }
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);
  return (
    <div className={active ? `${styles.modal} ${styles.active}` : `${styles.modal}`} onClick={() => { setActive(false); }}>
      <div className={active ? `${styles.modal__content} ${styles.active}` : `${styles.modal__content}`} onClick={(e) => { e.stopPropagation(); }}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
