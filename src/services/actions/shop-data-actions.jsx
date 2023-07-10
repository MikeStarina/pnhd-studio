import { apiBaseUrl } from '../../utils/constants';
import { openPopup, ORDER_ERROR } from './utility-actions';

export const GET_DATA = 'GET_DATA';
export const SET_FILTER = 'SET_FILTER';

export const getShopData = () => {
    const checkResponse = (res) => {
        if (res.ok || res.created) {
            return res.json();
        }
        return res.json().then((err) => {
            return Promise.reject(err);
        });
    };
    
    return function (dispatch) {
        fetch(`${apiBaseUrl}/api/products`, {
            headers: {
                'Content-Type': 'application/json',
            },
        })
            .then(checkResponse)
            .then((res) => {
                //console.log(res);
                dispatch({
                    type: GET_DATA,
                    payload: res.data,
                });
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
