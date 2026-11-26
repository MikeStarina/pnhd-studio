'use client';
import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '@/redux/redux-hooks';
import { useGetCdekPointsQuery, useGetCdekDeliveryPriceQuery } from '@/api/api';
import { cartSummaryFunc, packagesWeightCalcFunc } from '@/app/utils/cart-utils';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { ACQUIRE_RATIO } from '@/app/utils/constants';
import { Icon } from '@/features/constructor/ui/icons';
import DeliveryMap from '../delivery-map/delivery-map';
import form from '../form/form.module.css';

/** Пункты выдачи выбранного города: список (доступен с клавиатуры) и карта; цена доставки — в итог заказа. */
const ShippingPoints: React.FC<{ error?: string }> = ({ error }) => {
  const dispatch = useAppDispatch();
  const { order, deliveryParams } = useAppSelector((store) => store.cart);
  const cityTo = deliveryParams.validCityTo!;
  const points = useGetCdekPointsQuery(cityTo.code);
  const price = useGetCdekDeliveryPriceQuery({
    orderWeightArr: packagesWeightCalcFunc(order!),
    cityTo,
    totalPrice: cartSummaryFunc(order!),
  }, { skip: !order?.length }); // одни изделия из конструктора — доставку рассчитает менеджер

  useEffect(() => {
    if (price.data) dispatch(cartActions.setDeliveryPrice(Math.round(price.data.total_sum / ACQUIRE_RATIO)));
  }, [price.data, dispatch]);

  const selected = deliveryParams.validDeliveryPoint?.uuid ?? '';

  if (points.isLoading) return <p className={form.status}>Загружаем пункты выдачи…</p>;
  if (points.isError || !points.data) {
    return (
      <p className={form.status} role="alert">
        Не удалось загрузить пункты выдачи.
        <button type="button" className={form.retry} onClick={() => points.refetch()}>
          Повторить
        </button>
      </p>
    );
  }

  return (
    <div className={form.appear}>
      <div className={form.field}>
        <label htmlFor="checkout-point" className={form.label}>
          Пункт выдачи
        </label>
        <div className={form.selectWrap}>
          <select
            id="checkout-point"
            className={`${form.input} ${form.select}`}
            value={selected}
            onChange={(event) => {
              const point = points.data!.find((item) => item.uuid === event.target.value);
              if (point) dispatch(cartActions.setValidDeliveryPoint(point));
            }}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? 'checkout-point-error' : undefined}
          >
            <option value="" disabled>
              {points.data.length ? `Выбери из ${points.data.length} в списке или на карте` : 'В этом городе нет пунктов'}
            </option>
            {points.data.map((point) => (
              <option key={point.uuid} value={point.uuid}>
                {point.name}
              </option>
            ))}
          </select>
          <Icon name="chevronDown" size={20} className={form.selectIcon} />
        </div>
        {error && (
          <p id="checkout-point-error" className={form.error}>
            {error}
          </p>
        )}
      </div>
      {price.isError && (
        <p className={form.status} role="alert">
          Не удалось посчитать доставку.
          <button type="button" className={form.retry} onClick={() => price.refetch()}>
            Повторить
          </button>
        </p>
      )}
      {points.data.length > 0 && <DeliveryMap key={cityTo.code} points={points.data} />}
    </div>
  );
};

export default ShippingPoints;
