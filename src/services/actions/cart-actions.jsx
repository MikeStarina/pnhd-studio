import { v4 as uuidv4 } from 'uuid';
import { apiBaseUrl } from '../../utils/constants';

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

export const createOrder = (
  order,
  totalPrice,
  discounted_price,
  userCartData,
  validPromoCode,
  shippingData,
  userShippingData,
) => {
  const data = {
    order_total_price: totalPrice,
    order_discounted_price: discounted_price,
    order_promocode: validPromoCode,
    owner_name: `${userCartData.surname} ${userCartData.name}`,
    owner_phone: userCartData.phone,
    owner_email: userCartData.email,
    order_key: uuidv4(),
    items: [],
    isShipping: shippingData.isShipping,
    shipping_city: userShippingData.city,
    shipping_point: userShippingData.pvz,
    shipping_price: Math.ceil(shippingData.shippingTarif.total_sum),
    packages: [],
  };
  order.forEach((order_item) => {
    const sizeStr = (orderSizeItem) => {
      let size = "";

      let countStr = false;
      orderSizeItem.forEach((item, index) => {
        if (item.qty > 0) {
          size += `размер:${item.name}`;
          countStr = true;
          if (orderSizeItem.length > index && countStr) {
            size += ",";
          }
        }
      });
      size = size.slice(0, -1) + ".";
      return size;
    };

    const item = {
      textile:
        `${order_item.attributes.name},` + sizeStr(order_item.attributes.size),
      qty: order_item.attributes.size,
      qtyAll: 0,
      sizes: order_item.attributes.sizes,
      category: order_item.attributes.category,
      color: order_item.attributes.color,
      description: order_item.attributes.description,
      editor_back_view: order_item.attributes.editor_back_view,
      editor_front_view: order_item.attributes.editor_front_view,
      editor_lsleeve_view: order_item.attributes.editor_lsleeve_view,
      editor_rsleeve_view: order_item.attributes.editor_rsleeve_view,
      galleryPhotos: order_item.attributes.galleryPhotos,
      image_url: order_item.attributes.image_url,
      isForPrinting: order_item.attributes.isForPrinting,
      isSale: order_item.attributes.isSale,
      links: order_item.attributes.links,
      name: order_item.attributes.name,
      stock: order_item.attributes.stock,
      type: order_item.attributes.type,
      _id: order_item.attributes._id,
      item_price: 0,
      print: !!order_item.print,
      printPrice: 0,
      front_print: order_item.print?.front.file
        ? `Печать на груди. Файл: ${order_item.print.front.file.url}, Превью: ${order_item.print.front_preview.preview}; Размер: ${order_item.print.front.cartParams.size}`
        : '',
      back_print: order_item.print?.back.file
        ? `Печать на спине. Файл: ${order_item.print.back.file.url}, Превью: ${order_item.print.back_preview.preview}; Размер: ${order_item.print.back.cartParams.size}`
        : '',
      lsleeve_print: order_item.print?.lsleeve.file
        ? `Печать на спине. Файл: ${order_item.print.lsleeve.file.url}, Превью: ${order_item.print.lsleeve_preview.preview}; Размер: ${order_item.print.lsleeve.cartParams.size}`
        : '',
      rsleeve_print: order_item.print?.rsleeve.file
        ? `Печать на спине. Файл: ${order_item.print.rsleeve.file.url}, Превью: ${order_item.print.rsleeve_preview.preview}; Размер: ${order_item.print.rsleeve.cartParams.size}`
        : '',
    };

    order_item.attributes.size.forEach((elem) => {
      if (elem.qty > 0) {
        item.qtyAll += elem.qty;
      }
    });

    let printTotalprice = 0;

    const frontPrintPrice =
      (order_item.print && order_item.print.front.file
        ? order_item.print.front.cartParams.price
        : 0) * item.qtyAll;
    const backPrintPrice =
      (order_item.print && order_item.print.back.file
        ? order_item.print.back.cartParams.price
        : 0) * item.qtyAll;
    const lsleevePrintPrice =
      (order_item.print && order_item.print.lsleeve.file
        ? order_item.print.lsleeve.cartParams.price
        : 0) * item.qtyAll;
    const rsleevePrintPrice =
      (order_item.print && order_item.print.rsleeve.file
        ? order_item.print.rsleeve.cartParams.price
        : 0) * item.qtyAll;
    const badgePrintPrice =
      (order_item.print && order_item.print.badge.file
        ? order_item.print.badge.cartParams.price
        : 0) * item.qtyAll;

    printTotalprice =
      frontPrintPrice +
      backPrintPrice +
      lsleevePrintPrice +
      rsleevePrintPrice +
      badgePrintPrice;

    const itemPrice =
      (validPromoCode.discount_ratio
        ? order_item.attributes.price * validPromoCode.discount_ratio
        : order_item.attributes.price) * item.qtyAll;
    const printFullPrice = validPromoCode.discount_ratio
      ? printTotalprice * validPromoCode.discount_ratio
      : printTotalprice;

    item.printPrice = printFullPrice;
    item.item_price = printFullPrice
      ? itemPrice + printFullPrice
      : itemPrice;
    data.items.push(item);
    // временная заглушка до получения данных об размерах упаковки
    data.packages.push({
      height: '10',
      length: '10',
      weight: '1000',
      width: '10',
    });
  });

  return function (dispatch) {
    fetch(`${apiBaseUrl}/api/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Content-length": "",
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.paymentUrl) {
          dispatch({
            type: SET_PAYMENT_URL,
            payload: res.paymentUrl,
          });
        }
      });
  };
};

export const checkPromoCodeValidity = (user_promocode) => {
  const data = { user_promocode };

  return function (dispatch) {
    dispatch({ type: IS_PROMOCODE_FAIL, payload: false });
    dispatch({ type: IS_PROMOCODE_LOADING, payload: true });

    fetch(`${apiBaseUrl}/api/promocodes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-length': '',
      },
      body: JSON.stringify(data),
    })
      .then((res) => res.json())
      .then((res) => {
        if (res.promocode.length === 0) {
          dispatch({ type: IS_PROMOCODE_FAIL, payload: true });
          dispatch({ type: IS_PROMOCODE_LOADING, payload: false });
        }

        if (res.promocode.length > 0) {
          dispatch({ type: IS_PROMOCODE_LOADING, payload: false });
          dispatch({
            type: SET_CHECKED_PROMOCODE,
            payload: res.promocode[0],
          });
        }
      });
  };
};
