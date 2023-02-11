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





export const createOrder = (order, totalPrice, userCartData) => {

    
    
    const data = {
            order_price: totalPrice,
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
      
        const item = {
            textile: `${order_item.attributes.name}, размер: ${order_item.attributes.size}`,
            qty: order_item.attributes.qty,
            item_price: printTotalprice ? order_item.attributes.price + printTotalprice : order_item.attributes.price,
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







