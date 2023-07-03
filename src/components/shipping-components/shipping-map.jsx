import React, { lazy, Suspense, useRef, useState, useMemo } from "react";
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

  
  if (a[0] != setCenter[0]) {
    b(setCenter);
    map.current.setCenter(setCenter);
    map.current.setZoom(17);
  }

  // центрирование карты относительно выбранного пвз кликом по карте
  const handleClick = (point, e) => {
    // console.log(point)
    // const placemarkCoords = e.get("coords");
    // if (map.current) {
    //   map.current.setCenter(placemarkCoords);
    // }
    // map.current.setCenter(point.coordinates);
    // map.current.setZoom(17);
    // const b = e.get('target').options.freeze();
    // const a = b.get('iconColor');
    // console.log(a === '#ff0000')
    // if(a === '#ff0000'){b.set('iconColor','#00FF00').unfreeze()}else{b.set('iconColor','#ff0000').unfreeze()}

    // const b = e.get('target').options.freeze();




      updatePointInput(point, "#00FF00");  
    // const a = e.get("target").options.get("iconColor");
    // // console.log(a)
    // if (a === "#1E98FF") {
    //   updatePointInput(point);      
    //   e.get("target").options.set("iconColor", "#00FF00");
    // } else {
    //   updatePointInput({name:' ',coordinates:[]});      
    //   e.get("target").options.set("iconColor", "#1E98FF");
    // }
 
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
            {/* <Placemark defaultGeometry={[59.972621, 30.306432]} /> */}
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
