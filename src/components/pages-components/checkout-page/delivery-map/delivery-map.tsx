'use client';
import React, { Component, lazy, Suspense, type ReactNode } from 'react';
import { ICdekPointsResponse } from '@/app/utils/types';
import { useAppSelector, useAppDispatch } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import form from '../form/form.module.css';

const YMaps = lazy(() => import('@pbe/react-yandex-maps').then(({ YMaps }) => ({ default: YMaps })));
const Map = lazy(() => import('@pbe/react-yandex-maps').then(({ Map }) => ({ default: Map })));
const Placemark = lazy(() => import('@pbe/react-yandex-maps').then(({ Placemark }) => ({ default: Placemark })));

// Карта не читает CSS-переменные: цвета меток — значения --color-ink и --color-blue из tokens.css.
const MARK_SELECTED = '#050505';
const MARK = '#1d19ea';

/** Карта — необязательная часть: сбой загрузки не ломает оформление, пункт выбирают в списке. */
class MapBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? (
      <p className={form.status}>Карта не загрузилась — выбери пункт выдачи в списке выше.</p>
    ) : (
      this.props.children
    );
  }
}

/** Карта пунктов выдачи. Дублирует список над ней: выбор на карте и в списке — одно и то же. */
const DeliveryMap: React.FC<{ points: Array<ICdekPointsResponse> }> = ({ points }) => {
  const dispatch = useAppDispatch();
  const { validCityTo, validDeliveryPoint } = useAppSelector((store) => store.cart.deliveryParams);

  return (
    <div className={form.map} role="region" aria-label="Карта пунктов выдачи">
      <MapBoundary>
        <Suspense fallback={<p className={form.status}>Загружаем карту…</p>}>
          <YMaps>
            <Map
              defaultState={{ center: [validCityTo!.latitude, validCityTo!.longitude], zoom: 12 }}
              width="100%"
              height="100%"
            >
              {points.map((point) => (
                <Placemark
                  key={point.uuid}
                  geometry={[point.location.latitude, point.location.longitude]}
                  onClick={() => dispatch(cartActions.setValidDeliveryPoint(point))}
                  options={{ iconColor: point.uuid === validDeliveryPoint?.uuid ? MARK_SELECTED : MARK }}
                />
              ))}
            </Map>
          </YMaps>
        </Suspense>
      </MapBoundary>
    </div>
  );
};

export default DeliveryMap;
