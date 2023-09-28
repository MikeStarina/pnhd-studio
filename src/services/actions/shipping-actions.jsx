import { apiBaseUrl } from '../../utils/constants';
import { checkResponse } from '../../utils/utils';
import { openPopup, ORDER_ERROR } from './utility-actions';

export const GET_SDEK_CITIES = 'GET_SDEK_CITIES';
export const GET_SDEK_POINTS = 'GET_SDEK_POINTS';
export const GET_SDEK_SHIPPIG_TARIF = 'GET_SDEK_SHIPPIG_TARIF';
export const SET_SDEK_DEFAULT_STATE = 'GET_SDEK_DEFAULT_STATE';
export const SET_SDEK_RESET_POINTS = 'SET_SDEK_RESET_POINTS';

export const getSdekCities = () => function (dispatch) {
  fetch(`${apiBaseUrl}/api/shipping/cities`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(checkResponse)
    .then((res) => {
      dispatch({
        type: GET_SDEK_CITIES,
        payload: res,
      });
    })
    .catch((err) => {
      dispatch(
        openPopup([
          'Не удалось загрузить список пунктов выдачи. Попробуйте обновить страницу.',
        ]),
      );
    });
};

export const getSdekPoints = (citiesCode) => function (dispatch) {
  fetch(`${apiBaseUrl}/api/shipping/points?city_code=${citiesCode}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
    .then(checkResponse)
    .then((res) => {
      dispatch({
        type: GET_SDEK_POINTS,
        payload: res,
      });
    })
    .catch((err) => {
      dispatch(
        openPopup([
          'Не удалось загрузить список городов. Попробуйте обновить страницу.',
        ]),
      );
    });
};

export const getSdekShippingTarif = (citiesCode, orderWeight) => {
  const data = {
    tariff_code: '138',
    from_location: {
      code: '137',
    },
    to_location: {
      code: `${citiesCode}`,
    },
    services: [
      {
        code: 'INSURANCE',
        parameter: '2',
      },
    ],
    packages: [...orderWeight],
  };

  return function (dispatch) {
    fetch(`${apiBaseUrl}/api/shipping/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then(checkResponse)
      .then((res) => {
        dispatch({
          type: GET_SDEK_SHIPPIG_TARIF,
          payload: res,
        });
      })
      .catch((err) => {
        dispatch(
          openPopup([
            'Не удалось загрузить стоимость доставки. Попробуйте обновить страницу.',
          ]),
        );
      });
  };
};
