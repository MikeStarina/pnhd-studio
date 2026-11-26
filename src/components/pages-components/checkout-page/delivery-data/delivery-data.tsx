'use client';
import React, { useEffect, useMemo } from 'react';
import { useGetCdekCitiesDataQuery } from '@/api/api';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { siteContacts } from '@/components/site/contacts';
import ShippingPoints from '../shipping-points/shipping-points';
import type { TCheckoutErrors } from '../main-user-data/main-user-data';
import type { ICdekCitySearchResponse } from '@/app/utils/types';
import form from '../form/form.module.css';

const ORIGIN_CITY = 'Санкт-Петербург';
const SUGGESTIONS = 30;

/** Городов с одним названием в СДЭК бывает несколько — в подсказке и в поле город идёт вместе с регионом. */
const cityLabel = (city: ICdekCitySearchResponse) => `${city.city}, ${city.region}`;

/** Город по тексту поля: «Город, регион» из подсказки или просто название, если такой город один. */
const findCity = (cities: ICdekCitySearchResponse[], value: string) => {
  const needle = value.trim().toLowerCase();
  const byLabel = cities.find((city) => cityLabel(city).toLowerCase() === needle);
  const byName = cities.filter((city) => city.city.toLowerCase() === needle);
  return byLabel ?? (byName.length === 1 ? byName[0] : undefined);
};

/** Способ получения: самовывоз или СДЭК (город → пункт выдачи на карте или в списке). */
const DeliveryData: React.FC<{ errors: TCheckoutErrors; disabled: boolean }> = ({ errors, disabled }) => {
  const dispatch = useAppDispatch();
  const { isDelivery, deliveryParams } = useAppSelector((store) => store.cart);
  const cities = useGetCdekCitiesDataQuery('', { skip: !isDelivery });
  const query = deliveryParams.userCitySearchQuery;

  // Городов СДЭК тысячи: в подсказках — только начинающиеся с набранного.
  const suggestions = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length < 2 || !cities.data) return [];
    return cities.data.filter((city) => cityLabel(city).toLowerCase().startsWith(needle)).slice(0, SUGGESTIONS);
  }, [cities.data, query]);

  const choose = (delivery: boolean) => {
    dispatch(cartActions.setDelivery(delivery));
    if (delivery) return;
    dispatch(cartActions.resetValidCity());
    dispatch(cartActions.resetValidDeliveryPoint());
    dispatch(cartActions.setCdekCitySearchUserQuery(''));
    dispatch(cartActions.setDeliveryPrice(0));
  };

  const changeCity = (value: string) => {
    dispatch(cartActions.setCdekCitySearchUserQuery(value));
    const validCityTo = findCity(cities.data ?? [], value);
    const validCityFrom = cities.data?.find((city) => city.city === ORIGIN_CITY);
    if (validCityTo?.code === deliveryParams.validCityTo?.code) return;
    dispatch(cartActions.resetValidDeliveryPoint());
    dispatch(cartActions.setDeliveryPrice(0));
    if (!validCityTo || !validCityFrom) {
      dispatch(cartActions.resetValidCity());
      return;
    }
    dispatch(cartActions.setValidCity({ validCityTo, validCityFrom }));
  };

  // Город набран раньше, чем пришёл список СДЭК (или вставлен целиком), — сверяем, когда список появился.
  useEffect(() => {
    if (cities.data && query && !deliveryParams.validCityTo) changeCity(query);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cities.data]);

  return (
    <fieldset className={form.section} disabled={disabled}>
      <legend className={form.legend}>
        <span className={form.step}>02</span>
        Получение
      </legend>
      <div className={form.choices}>
        <label className={form.choice}>
          <input type="radio" name="delivery" className={form.radio} checked={!isDelivery} onChange={() => choose(false)} />
          <span className={form.dot} aria-hidden="true" />
          <span className={form.choiceText}>
            <span className={form.choiceTitle}>Самовывоз</span>
            <span className={form.choiceNote}>{siteContacts.address}, бесплатно</span>
          </span>
        </label>
        <label className={form.choice}>
          <input type="radio" name="delivery" className={form.radio} checked={isDelivery} onChange={() => choose(true)} />
          <span className={form.dot} aria-hidden="true" />
          <span className={form.choiceText}>
            <span className={form.choiceTitle}>Доставка СДЭК</span>
            <span className={form.choiceNote}>До пункта выдачи, цена — после выбора города</span>
          </span>
        </label>
      </div>

      {isDelivery && (
        <div className={form.appear}>
          <div className={form.field}>
            <label htmlFor="checkout-city" className={form.label}>
              Город
            </label>
            <input
              id="checkout-city"
              className={form.input}
              type="text"
              list="checkout-cities"
              autoComplete="address-level2"
              placeholder="Начни вводить название"
              value={query}
              onChange={(event) => changeCity(event.target.value)}
              aria-invalid={Boolean(errors.city)}
              aria-describedby={errors.city ? 'checkout-city-error' : 'checkout-city-hint'}
            />
            <datalist id="checkout-cities">
              {suggestions.map((city) => (
                <option key={city.code} value={cityLabel(city)} />
              ))}
            </datalist>
            {errors.city ? (
              <p id="checkout-city-error" className={form.error}>
                {errors.city}
              </p>
            ) : (
              <p id="checkout-city-hint" className={form.hint}>
                {cities.isLoading ? 'Загружаем города СДЭК…' : 'Выбери город из подсказок'}
              </p>
            )}
          </div>
          {cities.isError && (
            <p className={form.status} role="alert">
              Не удалось загрузить города.
              <button type="button" className={form.retry} onClick={() => cities.refetch()}>
                Повторить
              </button>
            </p>
          )}
          {deliveryParams.validCityTo && <ShippingPoints error={errors.point} />}
        </div>
      )}
    </fieldset>
  );
};

export default DeliveryData;
