'use client';

import React from 'react';
import { YMaps, Map, Placemark, ZoomControl } from '@pbe/react-yandex-maps';

const center = [59.972621, 30.306432];

const AboutMap: React.FC = () => (
  <YMaps>
    <Map
      defaultState={{ center, zoom: 14 }}
      instanceRef={(ref) => {
        ref?.behaviors.disable('scrollZoom');
      }}
      width="100%"
      height="100%"
    >
      <Placemark defaultGeometry={center} />
      <ZoomControl />
    </Map>
  </YMaps>
);

export default AboutMap;
