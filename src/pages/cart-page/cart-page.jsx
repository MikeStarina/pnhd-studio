import React, { useEffect } from "react";
import styles from "./cart-page.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import {
  CHANGE_ITEM_QTY,
  CLEAR_CART,
  SET_CART_VISIBILITY,
  DELETE_ITEM_FROM_CART,
  DELETE_PRINT_FROM_CART,
} from "../../services/actions/cart-actions";
import { SET_USER_DATA } from '../../services/actions/user-data-actions';
import { createOrder } from "../../services/actions/cart-actions";
import ItemPrint from "../../components/cart-page-components/item-print";
import closeicon from "../../components/images/closeIcon.svg";
import { apiBaseUrl } from "../../utils/constants";
import mir from '../../components/images/mir.png';
import visa from '../../components/images/visa.png';
import kassa from '../../components/images/kassa.png';
import Mastercard from '../../components/images/Mastercard.png';



const CartPage = () => {
  const history = useHistory();
  const { order, paymentUrl } = useSelector((store) => store.cartData);
  const { userCartData } = useSelector((store) => store.userData);
  
  const dispatch = useDispatch();
  //console.log(userCartData);


  const isUserFormValid = userCartData.isNameValid && userCartData.isPhoneValid && userCartData.isEmailValid;
  const validationMessage = `${!userCartData.isNameValid ? 'Имя' : ''} ${!userCartData.isPhoneValid ? 'Телефон': ''} ${!userCartData.isEmailValid ? 'Email' : ''}`;
  //console.log(isUserFormValid);
 
  if (paymentUrl) {
    window.location.href = paymentUrl;

    dispatch({
      type: CLEAR_CART
    })
  }

  const totalPrice = order.reduce((acc, item) => {
    let printTotalprice = 0;
    //console.log(item.print)
    //console.log(item.print.back)
    const frontPrintPrice =
      item.print && item.print.front.file
        ? item.print.front.cartParams.price
        : 0;
    const backPrintPrice =
      item.print && item.print.back.file ? item.print.back.cartParams.price : 0;
    const lsleevePrintPrice =
      item.print && item.print.lsleeve.file
        ? item.print.lsleeve.cartParams.price
        : 0;
    const rsleevePrintPrice =
      item.print && item.print.rsleeve.file
        ? item.print.rsleeve.cartParams.price
        : 0;
    const badgePrintPrice =
      item.print && item.print.badge.file
        ? item.print.badge.cartParams.price
        : 0;

    printTotalprice =
      frontPrintPrice +
      backPrintPrice +
      lsleevePrintPrice +
      rsleevePrintPrice +
      badgePrintPrice;

    acc =
      acc +
      item.attributes.price * item.attributes.qty +
      printTotalprice * item.attributes.qty;

    return acc;
  }, 0);

  useEffect(() => {
    dispatch({
      type: SET_CART_VISIBILITY,
      payload: false,
    });

    return () => {
      dispatch({ type: SET_CART_VISIBILITY, payload: true });
    };
  }, []);


  const qtyChangeHandler = (e, qty) => {

    let newValue = qty;
    if (e.target.name === 'increase') {
      newValue++;
    } else {
      newValue--;
    }

    dispatch({
      type: CHANGE_ITEM_QTY,
      qty: newValue,
      id: e.target.id,
    });
  }
  const onChange = (e) => {

    
     
    
  };


  const inputChangeHandler = (e) => {
    //console.log(e.target.validity.valid);
    dispatch({
        type: SET_USER_DATA,
        inputName: e.target.name,
        inputValue: e.target.value,
        validity: e.target.validity.valid,
    })
  }

  const close = () => {
    history.goBack();
  };

  const createOrderHandler = () => {
    dispatch(createOrder(order, totalPrice, userCartData));
  };

  const clearCartHandler = () => {
    dispatch({ type: CLEAR_CART });
  };


  const deleteItemFromCart = (e) => {

    dispatch({
      type: DELETE_ITEM_FROM_CART,
      payload: e.target.id,
    })
  }




  return (
    <section className={styles.screen}>
      <div className={styles.cart_title_box}>
        <h1 className={styles.cart_title}>КОРЗИНА / <i>CART</i></h1>
        <button type='button' className={styles.goback_button} onClick={close}>&larr; НАЗАД</button>
      </div>
      

      <ul className={styles.cart_container}>
        {order &&
          order.map((item) => {
            return (
              <li className={styles.cart_item} key={item.cart_item_id}>
                <button type='button' className={styles.delete_item_from_cart} id={item.cart_item_id} onClick={deleteItemFromCart}>x</button>
                <div className={styles.textile_description}>
                  <div className={styles.desc_box}>
                    <img
                      src={`${apiBaseUrl}${item.attributes.image_url}`}
                      alt="item pic"
                      className={styles.item_img}
                    ></img>
                    <div className={styles.text_wrapper}>
                      <h3 className={styles.title}>
                        {item.attributes.name}
                      </h3>
                      <p className={styles.description}>
                        Размер: {item.attributes.size}
                      </p>
                      <div className={styles.qty_input_wrapper}>
                        <label
                          htmfor={item.cart_item_id}
                          className={styles.description}
                        >
                          Количество:
                        </label>
                        <button type='button' className={styles.input_control_button} name='decrease' onClick={(e) => qtyChangeHandler(e, item.attributes.qty)} id={item.cart_item_id}>&larr;</button>
                        <input
                          type="number"
                          className={styles.qty_input}
                          value={item.attributes.qty}
                          id={item.cart_item_id}
                          onChange={onChange}
                          readOnly={true}
                          disabled
                        ></input>
                        <button type='button' className={styles.input_control_button} name='increase' id={item.cart_item_id} onClick={(e) => qtyChangeHandler(e, item.attributes.qty)}>&rarr;</button>
                      </div>
                    </div>
                  </div>
                  <p className={styles.price}>
                    = {item.attributes.price * item.attributes.qty} P.
                  </p>
                </div>

                {item.print && item.print.front.file && (
                  <ItemPrint
                    print={item.print.front_preview.preview}
                    params={item.print.front}
                    qty={item.attributes.qty}
                    title={"Принт на груди:"}
                    print_id={'front_print'}
                    item_id={item.cart_item_id}
                    
                  />
                )}
                {item.print && item.print.back.file && (
                  <ItemPrint
                    print={item.print.back_preview.preview}
                    params={item.print.back}
                    qty={item.attributes.qty}
                    title={"Принт на спине:"}
                    print_id={'back_print'}
                    item_id={item.cart_item_id}
                    
                  />
                )}
                {item.print && item.print.lsleeve.file && (
                  <ItemPrint
                    print={item.print.lsleeve_preview.preview}
                    params={item.print.lsleeve}
                    qty={item.attributes.qty}
                    title={"Принт на левом рукаве:"}
                    print_id={'lsleeve_print'}
                    item_id={item.cart_item_id}
                    
                  />
                )}
                {item.print && item.print.rsleeve.file && (
                  <ItemPrint
                    print={item.print.rsleeve_preview.preview}
                    params={item.print.rsleeve}
                    qty={item.attributes.qty}
                    title={"Принт на правом рукаве:"}
                    print_id={'rsleeve_print'}
                    item_id={item.cart_item_id}
                    
                  />
                )}
              </li>
            );
          })}
      </ul>
      <div className={styles.checkout_container}>

      
      <form className={styles.user_form} id='checkout_form'>
          <label htmfor='name' className={styles.input_label}>Имя*:</label>
          <input type='text' minLength='2' placeholder='Ваше имя' id='name' name='name' className={styles.user_form_input} required={true} onChange={inputChangeHandler} value={userCartData.name}></input>
          <label htmfor='phone' className={styles.input_label}>Телефон*:</label>
          <input type='tel' minLength='11' placeholder='+7(999)999-99-99' id='phone' name='phone' className={styles.user_form_input} required={true} onChange={inputChangeHandler} value={userCartData.phone}></input>
          <label htmfor='email' className={styles.input_label}>Email*:</label>
          <input type='email' placeholder='name@pnhd.ru' id='email' name='email' className={styles.user_form_input} required={true} onChange={inputChangeHandler} value={userCartData.email}></input>
      </form>
      <div className={styles.cart_controls}>
        
        {order.length > 0 && (
          <p className={styles.total_price}>Итого: {totalPrice} P.</p>
        )}
        {/*
        <button
          type="button"
          className={styles.control_button}
          onClick={clearCartHandler}
        >
          Очистить корзину
        </button> */}
        <button
          type="button"
          className={styles.control_button}
          onClick={createOrderHandler}
          disabled={!isUserFormValid}
        >
          ОФОРМИТЬ
        </button>
        {!isUserFormValid && <p className={styles.validation_message}>Заполните поля:</p>}
        {!isUserFormValid && <p className={styles.validation_message}>{validationMessage}</p>}
      </div>
      </div>
      <div className={styles.payment_info}>
        <div className={styles.payment_logo_wrapper}>
          <img src={kassa} alt='Юкасса' className={styles.payment_logo}></img>
          <img src={visa} alt='visa' className={styles.payment_logo}></img>
          <img src={Mastercard} alt='Mastercard' className={styles.payment_logo}></img>
          <img src={mir} alt='Мир' className={styles.payment_logo}></img>
        </div>
        <div className={styles.shipping_info}>
          <h4 className={styles.shipping_heading}>Как получить заказ?</h4>
          <p className={styles.shipping_description}>Мы обрабатываем заказы ежедневно с 11 до 20. После оформления заказ и оплаты наши менеджеры свяжутся с вами для его подтверждения.</p>
          <p className={styles.shipping_description}>Способ получения заказа по умолчанию - самовывоз из нашей студии по адресу: Санкт-Петербург, ул. Чапыгина 1. Студия работает с 11 до 20 без выходных</p>
          <p className={styles.shipping_description}>Мы можем доставить заказ по Санкт-Петербургу и России. Если вам требуется доставка, то, пожалуйста, сообщите об этом менеджеру, который сообщит вам о готовности заказа и он(а) расскажет как сделать это удобно и поможет с оформлением</p>
        </div>

      </div>

    </section>
  );
};

export default CartPage;
