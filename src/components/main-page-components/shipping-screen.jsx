import React, {
  useEffect, useState, useRef, useSyncExternalStore,
} from 'react';
import styles from './shipping-screen.module.css';
import poweredByCDEK from '../images/shippingBlockCDEK.png';
import useDebounce from '../../hooks/useDebounce';

function ShippingScreen() {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    if (window.innerWidth > 1560) {
      setWidth((window.innerWidth - 1560) / 2);
    }
  });
  const updateDimensions = () => {
    if (window.innerWidth > 1560) {
      setWidth((window.innerWidth - 1560) / 2);
    }
    if (window.innerWidth < 650) {
      setWidth(Math.ceil(window.innerWidth / 6));
    }
  };
  useEffect(() => {
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);
  return (
    <div className={styles.wrap}>
      <div style={{ left: `-${width}px` }} className={styles.test} />
      <div className={styles.body}>
        <h2 className={styles.body_text}>А КАК ПОЛУЧИТЬ?</h2>
        <div className={styles.body_wrap}>
          <h3 className={styles.body_wrapTitle}>— САМОВЫВОЗ</h3>
          <p className={styles.body_wrapSubtitle}>Из нашей студии в Санкт-Петербурге. Мы всегда рады гостям, поэтому ждем вас ежедневно с 11 до 20 по адресу ул. Чапыгина 1 (м. Петроградская).</p>
          <h3 className={styles.body_wrapTitle}>— УЛЬТРАДОСТАВКА</h3>
          <p className={styles.body_wrapSubtitle}>Ультра супер быстрая доставка в Москву и другие регионы нашей страны от наших друзей и партнеров СДЕК. Оформить можно в корзине при чекауте или через наших менеджеров.</p>
          <div className={styles.body_wrapImg} />
        </div>
      </div>
    </div>
  );
}

export default ShippingScreen;
