import { apiBaseUrl } from '../../utils/constants';
import { getError } from '../../utils/utils';

export const OPEN_MODAL_MENU = 'OPEN_MODAL_MENU';
export const CLOSE_MODAL_MENU = 'CLOSE_MODAL_MENU';
export const SET_ACTIVE_PRICE_TABLE = 'SET_ACTIVE_PRICE_TABLE';
export const GET_ORDER_FORM_DATA = 'GET_ORDER_FORM_DATA';
export const IS_IMAGE_LOADING = 'IS_IMAGE_LOADING';
export const SET_POPUP_VISIBILITY = 'SET_POPUP_VISIBILITY';
export const CLEAR_LEAD_FORM_DATA = 'CLEAR_LEAD_FORM_DATA';
export const ORDER_ERROR = 'ORDER_ERROR';
export const CLOSE_ORDER_ERROR = 'CLOSE_ORDER_ERROR';

export const sendLeadFormData = (name, phone) => {
    const data = {
        name,
        phone,
    };

    const checkResponse = (res) => {
        if (res.ok || res.created) {
            return res.json();
        }
        return res.json().then((err) => {
            return Promise.reject(err);
        });
    };

    return function (dispatch) {
        fetch(`${apiBaseUrl}/api/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        })
            .then(checkResponse)
            .then((res) => {
                if (res.message === 'Заявка отправлена') {
                    //alert('Заявка успешно отправлена');
                    dispatch({
                        type: CLEAR_LEAD_FORM_DATA,
                        text: res.message,
                    });
                }
            })
            .catch((err) => {
                // console.log(err, 'line 47 utility-actions');
                dispatch({
                    type: ORDER_ERROR,
                    text: 'Заявка не отправлена, заполните поля корректно',
                });
            });
    };

    function getError(text) {
        return {
            type: ORDER_ERROR,
            text,
        };
    }
    function closeError() {
        return {
            type: CLOSE_ORDER_ERROR,
        };
    }
};
