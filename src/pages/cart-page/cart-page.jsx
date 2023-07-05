import React, { useEffect, useState } from "react";
import styles from "./cart-page.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useHistory, useLocation } from "react-router-dom";
import {
  CHANGE_ITEM_QTY,
  CLEAR_CART,
  SET_CART_VISIBILITY,
  DELETE_ITEM_FROM_CART,
  DELETE_PRINT_FROM_CART,
  GET_USER_PROMOCODE,
  DELETE_ACTIVE_PROMOCODE,
} from "../../services/actions/cart-actions";
import {
  SET_USER_DATA,
  SET_SHIPPING_CITIES,
  SET_SHIPPING_PVZ,
} from "../../services/actions/user-data-actions";
import { createOrder } from "../../services/actions/cart-actions";
import ItemPrint from "../../components/cart-page-components/item-print";
import closeicon from "../../components/images/closeIcon.svg";
import { apiBaseUrl } from "../../utils/constants";
import mir from "../../components/images/mir.png";
import visa from "../../components/images/visa.png";
import kassa from "../../components/images/kassa.png";
import Mastercard from "../../components/images/Mastercard.png";
import { checkPromoCodeValidity } from "../../services/actions/cart-actions";
import { ShippingMap } from "../../components/shipping-components/shipping-map";
import { ShippingSelect } from "../../components/shipping-components/shipping-select";
import { v4 as uuidv4 } from "uuid";
import PopupModel from "../../components/popupModel/popupModel";
import {
  SET_POPUP_VISIBILITY,
  openPopup,
  closePopup,
} from "../../services/actions/utility-actions";
import useDebounce from "../../hooks/useDebounce";

const CartPage = () => {
  const [debounceCities, setDebounceCities] = useState([]);
  const [checkInput, setChekInput] = useState(true);  
  const [checkSelect, setChekSelect] = useState(true);
  const [typeDelivery, setTypeDelivery] = useState({
    pickup: true,
    sdek: false,
  });
  const [listCities, setListCities] = useState("");
  const [shippingPrice, setShippingPrice] = useState(0);
  const [listPoints, setListPoints] = useState(null);
  const [typeList, setTypeList] = useState(false);
  const [typeShipping, setTypeShipping] = useState(false);
  const [centerMap, setCenterMap] = useState([59.972621, 30.306432]);
  const [mapPoints, setMapPoints] = useState();
  const {
    order,
    paymentUrl,
    user_promocode,
    isPromocodeLoading,
    promocodeFail,
    validPromoCode,
  } = useSelector((store) => store.cartData);
  const { userCartData, userShippingData } = useSelector(
    (store) => store.userData
  );
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const { shippingCities, shippingTarif, shippingPoints } = useSelector(
    (store) => store.shippingData
  );
  const history = useHistory();
  const dispatch = useDispatch();
  const debouncedSearchTerm = useDebounce(listCities, 500);

  const getShippingPoints = () => {
    const arr = shippingPoints.map((item) => {
      return {
        name: item.name,
        coordinates: [item.location.latitude, item.location.longitude],
        color: "#1E98FF",
      };
    });
    setMapPoints(arr);
  };
  
  const findShippingObject = (el, color) => {
    if (el.name === " ") {
      setListPoints("");
    }
    shippingPoints.forEach((item) => {
      if (
        item.location.latitude === el.coordinates[0] &&
        item.location.longitude === el.coordinates[1]
      ) {
        dispatch({
          type: SET_SHIPPING_PVZ,
          payload: { item: { ...item }, isPvzValid: true },
        });
        setListPoints(item);
        setChekSelect(true);
      }
    });
    if (color === "#00FF00") {
      mapPoints.forEach((item) => {
        item.color = "#1E98FF";
        if (item.name === el.name) {
          item.color = "#00FF00";
        }
      });
    }
  };

  const setPointColor = (el, color) => {
    if (color === "#00FF00") {
      mapPoints.forEach((item) => {
        item.color = "#1E98FF";
        if (item.name === el.name) {
          item.color = "#00FF00";
        }
      });
    }
  };

  const onChangeSelect = (elem) => {
    shippingPoints.forEach((item) => {
      if (item.name.toLowerCase().indexOf(elem.name.toLowerCase()) != -1) {
        dispatch({
          type: SET_SHIPPING_PVZ,
          payload: { item: { ...item }, isPvzValid: true },
        });
        setListPoints(item);
        setPointColor(elem, "#00FF00");
        setCenterMap([item.location.latitude, item.location.longitude]);
        setChekSelect(true);
      }
    });
  };
  const { phone } = userCartData;

  let regex = /[^0-9]/gi;

  let newPhone;
  if (phone) {
    if (phone[0] === "8") {
      newPhone = phone.replace("8", "7");
    }
  }


  useEffect(() => {
    if (typeList) {
      if (listCities.city != userShippingData.city.city) {
        dispatch({
          type: SET_SHIPPING_CITIES,
          payload: { item: "", isCityValid: false },
        });

        if (userShippingData.isPvzValid) {
          dispatch({
            type: SET_SHIPPING_PVZ,
            payload: { item: null, isPvzValid: false },
          });
        }
        setShippingPrice(0);
        setTypeList(false);
        setCenterMap([59.972621, 30.306432]);
        setListPoints(null);
        setTypeShipping(false);
        getShippingPoints();
      }
    }
  });

  const isUserFormValid =
    userCartData.isNameValid &&
    userCartData.isPhoneValid &&
    userCartData.isEmailValid &&
    userCartData.isSurnameValid &&
    userShippingData.isCityValid &&
    userShippingData.isPvzValid;

  const validationMessage = `${!userCartData.isNameValid ? "Имя" : ""} ${
    !userCartData.isPhoneValid ? "Телефон" : ""
  } ${!userCartData.isEmailValid ? "Email" : ""} ${
    !userCartData.isSurnameValid ? "Фамилия" : ""
  } ${!userShippingData.isCityValid ? "Город" : ""} ${
    !userShippingData.isPvzValid ? "Пункт Выдачи" : ""
  }`;
  //console.log(isUserFormValid);

  if (paymentUrl) {
    window.location.href = paymentUrl;

    dispatch({
      type: CLEAR_CART,
    });
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

  const discounted_price = validPromoCode.discount_ratio
    ? totalPrice * validPromoCode.discount_ratio + shippingPrice
    : totalPrice + shippingPrice;

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
    if (e.target.name === "increase") {
      newValue++;
    } else {
      newValue--;
    }

    dispatch({
      type: CHANGE_ITEM_QTY,
      qty: newValue,
      id: e.target.id,
    });
  };
  const onChange = (e) => {};

  const inputChangeHandler = (e) => {
    let value;
    if (e.target.name === "phone") {
      value = e.target.value.replace(regex, "");
    }
    //userCartData.phone.replace(regex, '')
    dispatch({
      type: SET_USER_DATA,
      inputName: e.target.name,
      inputSurname: e.target.surname,
      inputValue: e.target.name === "phone" ? value : e.target.value,
      validity: e.target.validity.valid,
    });
  };

  const close = () => {
    history.goBack();
  };

  const handelClosePopup = () => {
    dispatch(closePopup());
  };

  const createOrderHandler = () => {
    if (!isUserFormValid) {
      if (!userShippingData.isCityValid) {
        setChekInput(false);
      }
      if (!userShippingData.isPvzValid) {
        setChekSelect(false);
      }
      dispatch(openPopup([validationMessage]));
    } else {
      const metrikaProducts = [];
      order.forEach((item) => {
        const frontPrintPrice =
          item.print && item.print.front.file
            ? item.print.front.cartParams.price
            : 0;
        const backPrintPrice =
          item.print && item.print.back.file
            ? item.print.back.cartParams.price
            : 0;
        const lsleevePrintPrice =
          item.print && item.print.lsleeve.file
            ? item.print.lsleeve.cartParams.price
            : 0;
        const rsleevePrintPrice =
          item.print && item.print.rsleeve.file
            ? item.print.rsleeve.cartParams.price
            : 0;

        const printTotalprice =
          frontPrintPrice +
          backPrintPrice +
          lsleevePrintPrice +
          rsleevePrintPrice;

        metrikaProducts.push({
          id: item.attributes._id,
          name:
            printTotalprice > 0
              ? `${item.attributes.name} с печатью`
              : item.attributes.name,
          price: item.attributes.price + printTotalprice,
          category: item.attributes.category,
          variant: item.print ? "с печатью" : "без печати",
          quantity: item.attributes.qty,
        });
      });

      window.dataLayer.push({
        ecommerce: {
          currencyCode: "RUB",
          purchase: {
            actionField: {
              id: uuidv4(),
              revenue: totalPrice,
            },
            products: metrikaProducts,
          },
        },
      });

      dispatch(
        createOrder(
          order,
          totalPrice,
          discounted_price,
          userCartData,
          validPromoCode
        )
      );
    }
  };

  const clearCartHandler = () => {
    dispatch({ type: CLEAR_CART });
  };

  const deleteItemFromCart = (e) => {
    dispatch({
      type: DELETE_ITEM_FROM_CART,
      payload: e.target.id,
    });
  };

  const promoOnChangeHandler = (e) => {
    const value = e.target.value.toUpperCase();
    dispatch({
      type: GET_USER_PROMOCODE,
      payload: value,
    });
  };

  const promoSubmitHandler = (e) => {
    e.preventDefault();
    dispatch(checkPromoCodeValidity(user_promocode));
  };

  const cancelPromocodeFunc = () => {
    dispatch({ type: DELETE_ACTIVE_PROMOCODE });
  };

  const setRadioDelivery = (type) => {
    if (type === "самовывоз") {
      setTypeDelivery({
        pickup: true,
        sdek: false,
      });
      setTypeShipping(false);
      setCenterMap([59.972621, 30.306432]);
    }
    if (type === "сдэк") {
      setTypeDelivery({
        pickup: false,
        sdek: true,
      });
      getShippingPoints();
    }
  };
  //console.log(validPromoCode)

  const getCities = (elem) => {
    const list = [];
    if (elem.length >= 3) {
      shippingCities.forEach((item) => {
        if (list.length != 5) {
          if (item.city.toLowerCase().indexOf(elem.toLowerCase()) != -1) {
            list.push(item);
          }
        }
        return;
      });
      setDebounceCities(list);
    } else if (elem.length < 3) {
      setDebounceCities([]);
    }
  };
  
  

  useEffect(() => {
    if (debouncedSearchTerm) {
      setListCities(listCities);
      getCities(listCities);
    }    
  }, [debouncedSearchTerm]);


  const setDefoultShippingState = () =>{
    setListCities("");
    setDebounceCities([]);
    setListPoints("");
    setShippingPrice(0);
    setListPoints(null);
    setCenterMap([59.972621, 30.306432]);
    dispatch({
      type: SET_SHIPPING_CITIES,
      payload: { item: "", isCityValid: false },
    });
    dispatch({
      type: SET_SHIPPING_PVZ,
      payload: {item:null, isPvzValid: false },
    })}

  return (
    <section className={styles.screen}>
      <div className={styles.cart_title_box}>
        <h1 className={styles.cart_title}>
          КОРЗИНА / <i>CART</i>
        </h1>
        <button type="button" className={styles.goback_button} onClick={close}>
          &larr; НАЗАД
        </button>
      </div>

      <ul className={styles.cart_container}>
        {order &&
          order.map((item) => {
            return (
              <li className={styles.cart_item} key={item.cart_item_id}>
                <button
                  type="button"
                  className={styles.delete_item_from_cart}
                  id={item.cart_item_id}
                  onClick={deleteItemFromCart}
                >
                  x
                </button>
                <div className={styles.textile_description}>
                  <div className={styles.desc_box}>
                    <img
                      src={`${apiBaseUrl}${item.attributes.image_url}`}
                      alt="item pic"
                      className={styles.item_img}
                    />
                    <div className={styles.text_wrapper}>
                      <h3 className={styles.title}>{item.attributes.name}</h3>
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
                        <button
                          type="button"
                          className={styles.input_control_button}
                          name="decrease"
                          onClick={(e) =>
                            qtyChangeHandler(e, item.attributes.qty)
                          }
                          id={item.cart_item_id}
                        >
                          &larr;
                        </button>
                        <input
                          type="number"
                          className={styles.qty_input}
                          value={item.attributes.qty}
                          id={item.cart_item_id}
                          onChange={onChange}
                          readOnly={true}
                          disabled
                        />
                        <button
                          type="button"
                          className={styles.input_control_button}
                          name="increase"
                          id={item.cart_item_id}
                          onClick={(e) =>
                            qtyChangeHandler(e, item.attributes.qty)
                          }
                        >
                          &rarr;
                        </button>
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
                    print_id={"front_print"}
                    item_id={item.cart_item_id}
                  />
                )}
                {item.print && item.print.back.file && (
                  <ItemPrint
                    print={item.print.back_preview.preview}
                    params={item.print.back}
                    qty={item.attributes.qty}
                    title={"Принт на спине:"}
                    print_id={"back_print"}
                    item_id={item.cart_item_id}
                  />
                )}
                {item.print && item.print.lsleeve.file && (
                  <ItemPrint
                    print={item.print.lsleeve_preview.preview}
                    params={item.print.lsleeve}
                    qty={item.attributes.qty}
                    title={"Принт на левом рукаве:"}
                    print_id={"lsleeve_print"}
                    item_id={item.cart_item_id}
                  />
                )}
                {item.print && item.print.rsleeve.file && (
                  <ItemPrint
                    print={item.print.rsleeve_preview.preview}
                    params={item.print.rsleeve}
                    qty={item.attributes.qty}
                    title={"Принт на правом рукаве:"}
                    print_id={"rsleeve_print"}
                    item_id={item.cart_item_id}
                  />
                )}
              </li>
            );
          })}
      </ul>
      <div className={styles.checkout_container}>
        <div className={styles.form_wrapper}>
          <form className={styles.user_form} id="checkout_form">
            <label htmfor="name" className={styles.input_label}>
              Имя*:
            </label>
            <input
              type="text"
              minLength="2"
              placeholder="Ваше имя"
              id="name"
              name="name"
              className={styles.user_form_input}
              required={true}
              onChange={inputChangeHandler}
              value={userCartData.name}
            ></input>
            <label htmfor="surname" className={styles.input_label}>
              Фамилия*:
            </label>
            <input
              type="text"
              minLength="2"
              placeholder="Ваша фамилия"
              id="surname"
              name="surname"
              className={styles.user_form_input}
              required={true}
              onChange={inputChangeHandler}
              value={userCartData.surname}
            ></input>
            <label htmfor="phone" className={styles.input_label}>
              Телефон*:
            </label>
            <input
              type="tel"
              minLength="11"
              placeholder="89990009900"
              id="phone"
              name="phone"
              className={styles.user_form_input}
              required={true}
              onChange={inputChangeHandler}
              value={userCartData.phone}
            ></input>
            <label htmfor="email" className={styles.input_label}>
              Email*:
            </label>
            <input
              type="email"
              placeholder="name@pnhd.ru"
              id="email"
              name="email"
              className={styles.user_form_input}
              required={true}
              onChange={inputChangeHandler}
              value={userCartData.email}
            ></input>
          </form>
          <form
            className={`${styles.user_form} ${styles.user_deliveryForm}`}
            id="delivery_form"
          >
            <div className={styles.user_radioWrapper}>
              <input
                type="radio"
                id="radioPickup"
                name="radio"
                value="1"
                onClick={() => {
                  setRadioDelivery("самовывоз");       
                  setDefoultShippingState();
                }}
                defaultChecked
              />
              <label htmlFor="radioPickup">Самовывоз из студии</label>
            </div>
            <div className={styles.user_radioWrapper}>
              <input
                type="radio"
                id="radioSdek"
                name="radio"
                value="2"
                onClick={() => {
                  setRadioDelivery("сдэк"); 
                  setTypeList(false);
                  setDefoultShippingState();
                }}
              />
              <label htmlFor="radioSdek">Доставка СДЭК</label>
            </div>
            {typeDelivery.sdek && (
              <>
                <input
                  type="text"
                  className={
                    checkInput
                      ? styles.user_form_input
                      : `${styles.user_form_input} ${styles.user_form_inputError}`
                  }
                  required={true}
                  value={listCities.city || listCities}
                  onChange={(e) => {
                    setListCities(e.target.value);
                  }}
                ></input>
                {!typeList ? (
                  <div className={styles.cities_wrap}>
                    <ul className={styles.cities_list}>
                      {debounceCities.map((item, index) => {
                        return (
                          <li
                            key={index}
                            onClick={() => {
                              setListCities(item);
                              setTypeList(true);
                              setShippingPrice(shippingTarif.total_sum);
                              dispatch({
                                type: SET_SHIPPING_CITIES,
                                payload: {
                                  item: { ...item },
                                  isCityValid: true,
                                },
                              });
                              setChekInput(true);
                            }}
                            className={styles.cities_listItem}
                          >
                            {item.city}, {item.region}
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ) : (
                  <>
                    <p>Доставка до пункта выдачи: {shippingPrice}</p>
                    <p>Выберите пункт выдачи: </p>
                    <ShippingSelect
                      options={mapPoints}
                      onChange={onChangeSelect}
                      defaultValue={"Выберите пункт выдачи:"}
                      editValue={listPoints}
                      errBorder={checkSelect}
                    />
                    {true && (
                      <>
                        <ShippingMap
                          points={mapPoints}
                          updatePointInput={findShippingObject}
                          setCenter={centerMap}
                        />
                      </>
                    )}
                  </>
                )}
              </>
            )}
          </form>
        </div>
        <div className={styles.cart_controls}>
          {order.length > 0 && (
            <p className={styles.total_price}>= {totalPrice} P.</p>
          )}
          {!validPromoCode.message && !promocodeFail ? (
            <form className={styles.promo_form} onSubmit={promoSubmitHandler}>
              <input
                type="text"
                placeholder="Промокод"
                id="promocode"
                name="promocode"
                minLength="5"
                className={styles.promo_input}
                onChange={promoOnChangeHandler}
                value={user_promocode}
              ></input>
              <button type="submit" className={styles.promo_submit}>
                &rarr;
              </button>
            </form>
          ) : promocodeFail ? (
            <div className={styles.promocode_wrapper}>
              <p className={styles.promocode_message}>Что-то пошло не так :(</p>
              <button
                type="button"
                className={styles.promocode_cancellation}
                onClick={cancelPromocodeFunc}
              >
                отменить
              </button>
            </div>
          ) : (
            <div className={styles.promocode_wrapper}>
              <p className={styles.promocode_message}>
                Промокод: {validPromoCode.name}
              </p>
              <p className={styles.promocode_message}>
                {validPromoCode.message}
              </p>
              <button
                type="button"
                className={styles.promocode_cancellation}
                onClick={cancelPromocodeFunc}
              >
                отменить
              </button>
            </div>
          )}
          <p className={styles.total_price}>Итого: {discounted_price} P.</p>
          <button
            type="button"
            className={styles.control_button}
            onClick={createOrderHandler}
            // раскоментировать при финальном пуше
            // onClick={() => {
            //   console.log(userCartData);
            // }}
            // disabled={!isUserFormValid}
          ></button>
          {isOtherPopupVisible && (
            <PopupModel onClose={handelClosePopup}>
              <div className={styles.popupBlock}>
                {!isUserFormValid && (
                  <p className={`${styles.validation_message}`}>
                    Заполните поля:
                  </p>
                )}
                {isOtherPopupVisible.map((el, index) => (
                  <p
                    className={`${styles.validation_message} ${styles.popupBlock_message}`}
                    key={index}
                  >
                    {el}
                  </p>
                ))}
              </div>
            </PopupModel>
          )}
        </div>
      </div>

      <div className={styles.payment_info}>
        <div className={styles.payment_logo_wrapper}>
          <img src={kassa} alt="Юкасса" className={styles.payment_logo}></img>
          <img src={visa} alt="visa" className={styles.payment_logo}></img>
          <img
            src={Mastercard}
            alt="Mastercard"
            className={styles.payment_logo}
          ></img>
          <img src={mir} alt="Мир" className={styles.payment_logo}></img>
        </div>
        <div className={styles.shipping_info}>
          <h4 className={styles.shipping_heading}>Как получить заказ?</h4>
          <p className={styles.shipping_description}>
            Мы обрабатываем заказы ежедневно с 11 до 20. После оформления заказ
            и оплаты наши менеджеры свяжутся с вами для его подтверждения.
          </p>
          <p className={styles.shipping_description}>
            Способ получения заказа по умолчанию - самовывоз из нашей студии по
            адресу: Санкт-Петербург, ул. Чапыгина 1. Студия работает с 11 до 20
            без выходных
          </p>
          <p className={styles.shipping_description}>
            Мы можем доставить заказ по Санкт-Петербургу и России. Если вам
            требуется доставка, то, пожалуйста, сообщите об этом менеджеру,
            который сообщит вам о готовности заказа и он(а) расскажет как
            сделать это удобно и поможет с оформлением
          </p>
        </div>
      </div>
    </section>
  );
};

export default CartPage;
