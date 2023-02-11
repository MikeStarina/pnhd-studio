import { apiBaseUrl } from "../../utils/constants";


export const OPEN_MODAL_MENU = 'OPEN_MODAL_MENU';
export const CLOSE_MODAL_MENU = 'CLOSE_MODAL_MENU';
export const SET_ACTIVE_PRICE_TABLE = 'SET_ACTIVE_PRICE_TABLE';
export const GET_ORDER_FORM_DATA = 'GET_ORDER_FORM_DATA';
export const IS_IMAGE_LOADING = 'IS_IMAGE_LOADING';
export const SET_POPUP_VISIBILITY = 'SET_POPUP_VISIBILITY';
export const CLEAR_LEAD_FORM_DATA = 'CLEAR_LEAD_FORM_DATA'; 




export const sendLeadFormData = (name, phone) => {
    const data = {
        name,
        phone
    }


    return function (dispatch) {
        fetch(`${apiBaseUrl}/api/leads`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data),
        })
        .then(res => res.json())
        .then((res) => {


            if (res.message === 'заявка отправлена') {
                //alert('Заявка успешно отправлена');
                dispatch({
                    type: CLEAR_LEAD_FORM_DATA,
                })
            }
        })
    }
}