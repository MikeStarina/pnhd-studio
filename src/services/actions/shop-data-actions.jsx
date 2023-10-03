import { apiBaseUrl } from '../../utils/constants';
import { openPopup, ORDER_ERROR } from './utility-actions';

export const GET_DATA = 'GET_DATA';
export const SET_FILTERS = 'SET_FILTERS';
export const SET_FILTER = 'SET_FILTER';
export const SET_FIRSTSELECT = 'SET_FIRSTSELECT';
export const SET_SECONDSELECT = 'SET_SECONDSELECT';
export const SET_THIRDSELECT = 'SET_THIRDSELECT';
export const SET_FIRSTSELECTEDITEM = 'SET_FIRSTSELECTEDITEM';
export const SET_SECONDSELECTEDITEM = 'SET_SECONDSELECTEDITEM';
export const SET_THIRDSELECTEDITEM = 'SET_THIRDSELECTEDITEM';
export const SET_DEFAULTFILTER = 'SET_DEFAULTFILTER';

export const getShopData = () => {
  const checkResponse = (res) => {
    if (res.ok || res.created) {
      return res.json();
    }
    return res.json().then((err) => Promise.reject(err));
  };

  return function (dispatch) {
    function getData(elem) {
      dispatch({
        type: GET_DATA,
        payload: elem,
      });
      dispatch({
        type: SET_FILTERS,
        payload: elem,
      });
    }
    fetch(`${apiBaseUrl}/api/products`, {
      headers: {
        'Content-Type': 'application/json',
      },
    })
      .then(checkResponse)
      .then((res) => {
        dispatch({
          type: GET_DATA,
          payload: res.data,
        });
        getData(res.data);
      })
      .catch((err) => {
        dispatch(
          openPopup([
            'Не удалось загрузить товары. Попробуйте обновить страницу.',
          ]),
        );
      });
  };
};
