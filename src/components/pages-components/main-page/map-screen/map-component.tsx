'use client'
import React, { Suspense } from "react";
import styles from './map-component.module.css';
import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';




const MapComponent = () => {
    return (
        <div className={styles.map_wrapper}>
            <Suspense fallback={null}>                    
                    <YMaps>
                        <Map defaultState={{ center: [59.972621, 30.306432], zoom: 14 }} instanceRef={ref => { ref && ref.behaviors.disable('scrollZoom'); }} width={'100%'} height={'100%'} className={styles.map}>
                            <Placemark defaultGeometry={[59.972621, 30.306432]} />
                            <ZoomControl />
                        </Map>
                    </YMaps>                    
            </Suspense>
        </div>
    )
}

export default MapComponent;