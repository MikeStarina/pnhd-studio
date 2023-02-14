import { apiBaseUrl } from "../../utils/constants";
import { v4 as uuidv4 } from "uuid";

export const ADD_TO_CART = 'ADD_TO_CART';
export const ADD_TO_CART_WITH_PRINT = 'ADD_TO_CART_WITH_PRINT';
export const CHANGE_ITEM_QTY = 'CHANGE_ITEM_QTY';
export const SET_CART_VISIBILITY = 'SET_CART_VISIBILITY';
export const CREATE_ORDER = 'CREATE_ORDER';
export const CLEAR_CART = 'CLEAR_CART';
export const RESTORE_CART_FROM_SSTORAGE = 'RESTORE_CART_FROM_SSTORAGE';
export const SET_PAYMENT_URL = 'SET_PAYMENT_URL'; 
export const DELETE_ITEM_FROM_CART = 'DELETE_ITEM_FROM_CART';
export const DELETE_PRINT_FROM_CART = 'DELETE_PRINT_FROM_CART';
export const GET_USER_PROMOCODE = 'GET_USER_PROMOCODE';
export const IS_PROMOCODE_LOADING = 'IS_PROMOCODE_LOADING';
export const IS_PROMOCODE_FAIL = 'IS_PROMOCODE_FAIL';
export const SET_CHECKED_PROMOCODE = 'SET_CHECKED_PROMOCODE';
export const DELETE_ACTIVE_PROMOCODE = 'DELETE_ACTIVE_PROMOCODE';


/**
 * 
 *  order_key: { type: String, required: false},
    owner_name: { type: String, minlength: 1, maxlength: 40, required: false },
    owner_phone: { type: String, required: false },
    owner_email: { type: String, required: false },
    total_price: { type: Number, required: false },
    promocode: { type: String },
    discounted_price: { type: Number },
 */





export const createOrder = (order, totalPrice, discounted_price, userCartData, validPromoCode) => {


    
    const data = {
            order_total_price: totalPrice,
            order_discounted_price: discounted_price,
            order_promocode: validPromoCode.name,
            owner_name: userCartData.name,
            owner_phone: userCartData.phone,
            owner_email: userCartData.email,
            order_key: uuidv4(),
            items: [],
        
    }
    order.forEach((order_item) => {
       
        let printTotalprice = 0;
        
        const frontPrintPrice =
          order_item.print && order_item.print.front.file
            ? order_item.print.front.cartParams.price
            : 0;
        const backPrintPrice =
          order_item.print && order_item.print.back.file ? order_item.print.back.cartParams.price : 0;
        const lsleevePrintPrice =
          order_item.print && order_item.print.lsleeve.file
            ? order_item.print.lsleeve.cartParams.price
            : 0;
        const rsleevePrintPrice =
          order_item.print && order_item.print.rsleeve.file
            ? order_item.print.rsleeve.cartParams.price
            : 0;
        const badgePrintPrice =
          order_item.print && order_item.print.badge.file
            ? order_item.print.badge.cartParams.price
            : 0;
    
        printTotalprice =
          frontPrintPrice +
          backPrintPrice +
          lsleevePrintPrice +
          rsleevePrintPrice +
          badgePrintPrice;

          //console.log(printTotalprice);

          const itemPrice = validPromoCode.discount_ratio ? order_item.attributes.price * validPromoCode.discount_ratio : order_item.attributes.price;
          const printFullPrice = validPromoCode.discount_ratio ? printTotalprice * validPromoCode.discount_ratio : printTotalprice
      
        const item = {
            textile: `${order_item.attributes.name}, размер: ${order_item.attributes.size}`,
            qty: order_item.attributes.qty,
            item_price: printFullPrice ? itemPrice + printFullPrice : itemPrice,
            print: order_item.print ? true : false,
            front_print: order_item.print?.front.file ? `Печать на груди. Файл: ${order_item.print.front.file.url}, Превью: ${order_item.print.front_preview.preview}; Размер: ${order_item.print.front.cartParams.size}` : '',
            back_print: order_item.print?.back.file ? `Печать на спине. Файл: ${order_item.print.back.file.url}, Превью: ${order_item.print.back_preview.preview}; Размер: ${order_item.print.back.cartParams.size}` : '',
            lsleeve_print: order_item.print?.lsleeve.file ? `Печать на спине. Файл: ${order_item.print.lsleeve.file.url}, Превью: ${order_item.print.lsleeve_preview.preview}; Размер: ${order_item.print.lsleeve.cartParams.size}` : '',
            rsleeve_print: order_item.print?.rsleeve.file ? `Печать на спине. Файл: ${order_item.print.rsleeve.file.url}, Превью: ${order_item.print.rsleeve_preview.preview}; Размер: ${order_item.print.rsleeve.cartParams.size}` : '',

        }

        data.items.push(item);
    })

    
   


   
               
     
 
   
    
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
        .then((res) => {
            if (res.paymentUrl) {
                dispatch({
                    type: SET_PAYMENT_URL,
                    payload: res.paymentUrl,
                })

                
            }
        });
    }
    
}



export const checkPromoCodeValidity = (user_promocode) => {
  const data = { user_promocode };
 

  return function(dispatch) {

    dispatch({ type: IS_PROMOCODE_FAIL, payload: false })
    dispatch({ type: IS_PROMOCODE_LOADING, payload: true })


    
    fetch(`${apiBaseUrl}/api/promocodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-length': '',
      },
      body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then((res) => {
      
      
      if (res.promocode.length === 0) {
        dispatch({ type: IS_PROMOCODE_FAIL, payload: true })
        dispatch({ type: IS_PROMOCODE_LOADING, payload: false })
      };

      if (res.promocode.length > 0) {
        dispatch({ type: IS_PROMOCODE_LOADING, payload: false })
        dispatch({ type: SET_CHECKED_PROMOCODE, payload: res.promocode[0] });
      }
    })
  }
}







