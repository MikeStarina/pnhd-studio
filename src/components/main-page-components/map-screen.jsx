import React, { lazy, Suspense } from 'react';
import styles from './map-screen.module.css';
// import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';
import { contactPhone } from '../../utils/constants';

const YMaps = lazy(() => import('@pbe/react-yandex-maps').then(({ YMaps }) => ({ default: YMaps })));
const Map = lazy(() => import('@pbe/react-yandex-maps').then(({ Map }) => ({ default: Map })));
const Placemark = lazy(() => import('@pbe/react-yandex-maps').then(({ Placemark }) => ({
  default: Placemark,
})));
const ZoomControl = lazy(() => import('@pbe/react-yandex-maps').then(({ ZoomControl }) => ({
  default: ZoomControl,
})));

function MapScreen() {
  return (
    <section className={styles.screen} id="contacts">
      <Suspense fallback={<div>...loading</div>}>
        <YMaps>
          <Map
            defaultState={{
              center: [59.972621, 30.306432],
              zoom: 15,
            }}
            instanceRef={(ref) => {
              ref && ref.behaviors.disable('scrollZoom');
            }}
            width="100%"
            height="100%"
            className={styles.map}
          >
            <Placemark defaultGeometry={[59.972621, 30.306432]} />
            <ZoomControl options={{ float: 'left' }} />
          </Map>
        </YMaps>
      </Suspense>
      <div className={styles.contact_box}>
        <h5 className={styles.contacts_heading}>КОНТАКТЫ</h5>
        <a
          className={styles.description}
          href="tel:+78129046156"
          id="calltracking"
        >
          {contactPhone}
        </a>
        <p className={styles.description}>studio@pnhd.ru</p>
        <p className={styles.description}>
          197022, Санкт-Петербург, ул. Чапыгина 1 /м. Петроградская/
        </p>
        <p className={styles.description}>
          Каждый день с 11:00 до 20:00
        </p>
        <div className={styles.socials_container}>
          <a
            href="https://t.me/pnhd_studio"
            className={styles.socials}
            target="blank"
          >
            / TG
          </a>
          <a
            href="whatsapp://send?phone=79313566552"
            className={styles.socials}
            target="blank"
          >
            / WA
          </a>
          <a
            href="https://vk.com/pinheadspb"
            className={styles.socials}
            target="blank"
          >
            / VK
          </a>
          <a
            href="https://instagram.com/pnhd.studio"
            className={styles.socials}
            target="blank"
          >
            / INST
          </a>
        </div>
      </div>
    </section>
  );
}

export default MapScreen;

/**
 *
 */
