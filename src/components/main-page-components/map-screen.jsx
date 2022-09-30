import React from "react";
import styles from './map-screen.module.css';
import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';



/**
 
    https://pbe-react-yandex-maps.vercel.app/?path=/docs/api-geoobjects-placemark--page
 */


const MapScreen = () => {
    return (
        <section className={styles.screen}>
            <YMaps>
                <Map defaultState={{ center: [ 59.972621, 30.306432 ], zoom: 15 }} instanceRef={ref => { ref && ref.behaviors.disable('scrollZoom'); }} width={'100%'} height={'100%'} className={styles.map}>
                    <Placemark defaultGeometry={[ 59.972621, 30.306432 ]} />
                    <ZoomControl options={{ float: 'left' }} />
                </Map>
            </YMaps>
            <div className={styles.contact_box}>
                <h5 className={styles.contect_heading}>КОНТАКТЫ</h5>
            </div>    

        </section>
    );
}

export default MapScreen;


/** 
 * 
 */