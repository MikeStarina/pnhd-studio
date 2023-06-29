import React, { lazy, Suspense, useRef } from "react";
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

export const ShippingMap = (props) => {
  const map = useRef(null);
  const {points, updatePointInput} = props;
  const mapState = {
    center: [59.972621, 30.306432],
    zoom: 10
  };

  const handleClick = (e) => {
    const placemarkCoords = e.get("coords");
    if (map.current) {
      map.current.setCenter(placemarkCoords);
    }
    // mapState.center=point.coordinates;
    // console.log(point)
  };
// console.log(mapState)
  return (
    <div className={styles.screen}>
      <Suspense fallback={<div>...loading</div>}>
        <YMaps>
          <Map
            defaultState={mapState}
            instanceRef={map}
            width={"100%"}
            height={"100%"}
            className={styles.map}
          >
            {/* <Placemark defaultGeometry={[59.972621, 30.306432]} /> */}
            {points.map((point, index) => (
          <Placemark geometry={point.coordinates} onClick={(e)=>{updatePointInput(point);handleClick(e)}} key={index}/>
        ))}
            <ZoomControl options={{ float: "left" }} />
          </Map>
        </YMaps>
      </Suspense>
    </div>
  );
};

export default ShippingMap;
