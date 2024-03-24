"use client";
import React, { lazy, Suspense, useRef } from "react";
import styles from './delivery-map.module.css';
import { ICdekPointsResponse } from "@/app/utils/types";
import { useAppSelector, useAppDispatch } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
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


const DeliveryMap: React.FC<{points: Array<ICdekPointsResponse>}> = (props) => {
    const dispatch = useAppDispatch();
    const map = useRef(null);
    const { validCityTo, validDeliveryPoint } = useAppSelector(store => store.cart.deliveryParams);
    const { points } = props;

    const pointClickHandler = (point: any) => {

        dispatch(cartActions.setValidDeliveryPoint(point));
    }

    return (
        <div className={styles.map}>
            <Suspense fallback={<div>...loading</div>}>
                <YMaps>
                    <Map
                        defaultState={{
                            center: [validCityTo!.latitude, validCityTo!.longitude],
                            zoom: 13,
                        }}
                        //@ts-ignore
                        instanceRef={map}
                        width="100%"
                        height="100%"
                    >
                        {points && points.map((point) => {
                            const placemarkColor = point.uuid === validDeliveryPoint?.uuid ? 'rgb(153,255,0)': '#1E98FF';
                            return (
                                <Placemark
                                    geometry={[point.location.latitude, point.location.longitude]}
                                    onClick={() => {pointClickHandler(point)}}
                                    key={point.uuid}
                                    options={{
                                        iconColor: placemarkColor,
                                    }}
                                />)
                        })}
                    </Map>
                </YMaps>
            </Suspense>
        </div>
    );
};

export default DeliveryMap;
