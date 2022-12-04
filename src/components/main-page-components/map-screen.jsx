import React from "react";
import styles from './map-screen.module.css';
import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';





const MapScreen = () => {
    return (
        <section className={styles.screen} id='contacts'>
            <YMaps>
                <Map defaultState={{ center: [ 59.972621, 30.306432 ], zoom: 15 }} instanceRef={ref => { ref && ref.behaviors.disable('scrollZoom'); }} width={'100%'} height={'100%'} className={styles.map}>
                    <Placemark defaultGeometry={[ 59.972621, 30.306432 ]} />
                    <ZoomControl options={{ float: 'left' }} />
                </Map>
            </YMaps>
            <div className={styles.contact_box}>
                <h5 className={styles.contacts_heading}>КОНТАКТЫ</h5>
                <p className={styles.description}>+7 (812) 904-61-56</p>
                <p className={styles.description}>studio@pnhd.ru</p>
                <p className={styles.description}>197022, Санкт-Петербург, ул. Чапыгина 1 /м. Петроградская/</p>
                <p className={styles.description}>Каждый день с 11:00 до 20:00</p>
            </div>    

        </section>
    );
}

export default MapScreen;


/** 
 * 
 */