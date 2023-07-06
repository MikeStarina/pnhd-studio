import React, { lazy, Suspense, useRef, useState, useMemo } from "react";
import { useEffect } from "react";
import styles from "./shipping-map.module.css";
const YMaps = lazy(() =>
  import("@pbe/react-yandex-maps").then(({ YMaps }) => ({ default: YMaps }))
);
const Map = lazy(() =>
  import("@pbe/react-yandex-maps").then(({ Map }) => ({ default: Map }))
);
const Placemark = lazy(() =>
  import("@pbe/react-yandex-maps").then(({ Placemark }) => ({
    default: Placemark,
  }))
);
const ZoomControl = lazy(() =>
  import("@pbe/react-yandex-maps").then(({ ZoomControl }) => ({
    default: ZoomControl,
  }))
);

const Clusterer = lazy(() =>
  import("@pbe/react-yandex-maps").then(({ Clusterer }) => ({
    default: Clusterer,
  }))
);

export const ShippingMap = (props) => {
  const map = useRef(null);
  const placemark = useRef(null);
  const { points, updatePointInput, setCenter } = props;
  const [a, b] = useState([59.972621, 30.306432]);

  // useEffect(()=>{},[points])
  if (a[0] != setCenter[0]) {
    b(setCenter);
    
   if(map.current){
    map.current.setCenter(setCenter);
    map.current.setZoom(17);
   }
  }

  const handleClick = (point, e) => {
      updatePointInput(point, "#00FF00");   
  };
  return (
    <div className={styles.screen}>
      <Suspense fallback={<div>...loading</div>}>
        <YMaps>
          <Map
            defaultState={{
              center: a||[59.972621, 30.306432],
              zoom: 10,
            }}
            instanceRef={map}
            width={"100%"}
            height={"100%"}
            className={styles.map}
          >            
            <Clusterer
              options={{
                preset: 'islands#invertedBlueClusterIcons',
                groupByCoordinates: false,
              }}
            >
              {points.map((point, index) => (
                
                <Placemark
                  className={styles.placemark}
                  geometry={point.coordinates}
                  onClick={(e) => {
                    handleClick(point, e);
                  }}
                  key={index}
                  options={
                    {
                      iconColor: `${point.color}`,
                    }
                  }
                />
              ))}
            </Clusterer>
            <ZoomControl options={{ float: "left" }} />
          </Map>
        </YMaps>
      </Suspense>
    </div>
  );
};

export default ShippingMap;
