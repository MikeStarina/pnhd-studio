import { apiBaseUrl } from "../../utils/constants";

export const ADD_TO_CART = 'ADD_TO_CART';
export const ADD_TO_CART_WITH_PRINT = 'ADD_TO_CART_WITH_PRINT';
export const CHANGE_ITEM_QTY = 'CHANGE_ITEM_QTY';
export const SET_CART_VISIBILITY = 'SET_CART_VISIBILITY';
export const CREATE_ORDER = 'CREATE_ORDER';
export const CLEAR_CART = 'CLEAR_CART';
export const RESTORE_CART_FROM_SSTORAGE = 'RESTORE_CART_FROM_SSTORAGE';





export const createOrder = (order, totalPrice) => {

    const data = {data: {
        order: JSON.stringify(order),
        order_price: totalPrice
        }
    };
               
     
    console.log(JSON.stringify(data));
   

    return function (dispatch) {
        fetch (`${apiBaseUrl}/api/orders`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-length': '',
            },
            body: JSON.stringify(data),
              
        })
        .then(res => res.json())
        .then((res) => console.log(res));
    }
}



export const proceedToPayment = (totalPrice) => {

    return fetch('https://api.yookassa.ru/v3/payments/', {
        method: 'POST',
        authorization: {'948838': 'test_aG7UT58eEdW_XH7-zdZ-DU7tefEDG2O-pWUmG0pF2qA'},
        headers: {
            'Content-type': 'apllication/json',
        },
        body: JSON.stringify({
            amount: {
                value: `${totalPrice}.00`,
                currency: "RUB"
              },
              payment_method_data: {
                type: "bank_card"
              },
            confirmation: {
                type: "redirect",
                return_url: "https://www.studio.pnhd.ru"
              },
              description: "Тестовый заказ"
        })

    })
}

