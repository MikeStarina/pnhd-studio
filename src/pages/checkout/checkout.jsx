import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// eslint-disable-next-line import/no-extraneous-dependencies
import InputMask from 'react-input-mask';
import { v4 as uuidv4 } from 'uuid';
import { createOrder } from '../../services/actions/cart-actions';
import {
  SET_CART_VISIBILITY,
  GET_USER_PROMOCODE,
  DELETE_ACTIVE_PROMOCODE,
  ADD_ORDER_PRICE,
  CLEAR_CART,
} from '../../services/actions/cart-actions';
import {
  SET_USER_DATA,
  SET_SHIPPING_CITIES,
  SET_SHIPPING_PVZ,
  SET_DEFAULT_USERSHIPPINGDATA,
} from '../../services/actions/user-data-actions';
import {
  getSdekCities,
  getSdekPoints,
  getSdekShippingTarif,
  SET_SDEK_DEFAULT_STATE,
  SET_SDEK_RESET_POINTS,
} from '../../services/actions/shipping-actions';
import { openPopup, closePopup } from '../../services/actions/utility-actions';
import { checkPromoCodeValidity } from '../../services/actions/cart-actions';
import { ShippingMap } from '../../components/shipping-components/shipping-map';
import ShippingSelect from '../../components/shipping-components/shipping-select';
import useDebounce from '../../hooks/useDebounce';
import styles from './checkout.module.css';
import PopupModel from '../../components/popupModel/popupModel';

function Checkout() {
  const dispatch = useDispatch();
  const {
    order,
    orderPrice,
    paymentUrl,
    user_promocode,
    promocodeFail,
    validPromoCode,
  } = useSelector((store) => store.cartData);
  const { userCartData, userShippingData } = useSelector(
    (store) => store.userData,
  );
  const { shippingCities, shippingTarif, shippingPoints } = useSelector(
    (store) => store.shippingData.shippingData,
  );
  const { shippingData } = useSelector((store) => store.shippingData);
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const [firstLoadInput, setFirstLoadInput] = useState({
    name: false,
    surname: false,
    email: false,
    phone: false,
  });
  const [typeDelivery, setTypeDelivery] = useState({
    pickup: true,
    sdek: false,
  });
  const [centerMap, setCenterMap] = useState([59.972621, 30.306432]);
  const [mapPoints, setMapPoints] = useState();
  const [debounceCities, setDebounceCities] = useState([]);
  const [listCities, setListCities] = useState('');
  const [listPoints, setListPoints] = useState(null);
  const [typeList, setTypeList] = useState(false);
  const [checkInput, setChekInput] = useState(true);
  const [checkSelect, setChekSelect] = useState(true);
  const [shippingPrice, setShippingPrice] = useState(0);
  const debouncedSearchTerm = useDebounce(listCities, 500);
  const shipping_price = validPromoCode.discount_ratio
    ? orderPrice.price * validPromoCode.discount_ratio + (shippingPrice || 0)
    : orderPrice.price + (shippingPrice || 0);
  const shipping_free = validPromoCode.discount_ratio
    ? orderPrice.price * validPromoCode.discount_ratio
    : orderPrice.price;
  const discounted_price =
    validPromoCode.mechanic === 'freeShipping' ? shipping_free : shipping_price;
  const orderWeight = order.map((el) => {
    const sizes = el.attributes.shippingParams;
    return {
      weight: sizes.weight,
      length: sizes.length,
      width: sizes.width,
      height: sizes.depth,
    };
  });

  const promoSubmitHandler = (e) => {
    e.preventDefault();
    dispatch(checkPromoCodeValidity(user_promocode));
  };

  const cancelPromocodeFunc = () => {
    dispatch({ type: DELETE_ACTIVE_PROMOCODE });
  };
  const promoOnChangeHandler = (e) => {
    const value = e.target.value.toUpperCase();
    dispatch({
      type: GET_USER_PROMOCODE,
      payload: value,
    });
  };
  const inputChangeHandler = (e) => {
    const regex = /[\s/+/)/(/-]/g;
    let value;
    if (e.target.name === 'phone') {
      value = e.target.value.replace(regex, '');
    }
    dispatch({
      type: SET_USER_DATA,
      inputName: e.target.name,
      inputSurname: e.target.surname,
      inputValue: e.target.name === 'phone' ? value : e.target.value,
      validity: e.target.validity.valid,
    });
  };

  const getCities = (elem) => {
    const list = [];
    if (elem.length >= 3) {
      shippingCities.forEach((item) => {
        if (list.length != 5) {
          if (item.city.toLowerCase().indexOf(elem.toLowerCase()) != -1) {
            list.push(item);
          }
        }
      });
      setDebounceCities(list);
    } else if (elem.length < 3) {
      setDebounceCities([]);
    }
  };

  const getShippingPoints = () => {
    const arr = shippingPoints.map((item) => ({
      name: item.name,
      coordinates: [item.location.latitude, item.location.longitude],
      color: '#1E98FF',
    }));
    setMapPoints(arr);
  };

  const setRadioDelivery = (type) => {
    if (type === 'самовывоз') {
      setTypeDelivery({
        pickup: true,
        sdek: false,
      });
      setCenterMap([59.972621, 30.306432]);
    }
    if (type === 'сдэк') {
      setTypeDelivery({
        pickup: false,
        sdek: true,
      });
      getShippingPoints();
    }
  };
  const setDefoultShippingState = () => {
    setListCities('');
    setDebounceCities([]);
    setListPoints(null);
    setCenterMap([59.972621, 30.306432]);
  };
  const setUserShippingDataReset = () => {
    dispatch({
      type: SET_SHIPPING_CITIES,
      payload: { item: '', isCityValid: false },
    });

    if (userShippingData.isPvzValid) {
      dispatch({
        type: SET_SHIPPING_PVZ,
        payload: { item: null, isPvzValid: false },
      });
    }
  };

  const setPointColor = (el, color) => {
    if (color === '#00FF00') {
      mapPoints.forEach((item) => {
        item.color = '#1E98FF';
        if (item.name === el.name) {
          item.color = '#00FF00';
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
        setPointColor(elem, '#00FF00');
        setCenterMap([item.location.latitude, item.location.longitude]);
        setChekSelect(true);
      }
    });
  };
  const findShippingObject = (el, color) => {
    if (el.name === ' ') {
      setListPoints('');
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
    if (color === '#00FF00') {
      mapPoints.forEach((item) => {
        item.color = '#1E98FF';
        if (item.name === el.name) {
          item.color = '#00FF00';
        }
      });
    }
  };
  const isUserFormValid =
    userCartData.isNameValid &&
    userCartData.isPhoneValid &&
    userCartData.isEmailValid &&
    userCartData.isSurnameValid &&
    userShippingData.isCityValid &&
    userShippingData.isPvzValid;
  const validationMessage = `${!userCartData.isNameValid ? 'Имя' : ''} ${
    !userCartData.isSurnameValid ? 'Фамилия' : ''
  } ${!userCartData.isPhoneValid ? 'Телефон' : ''} ${
    !userCartData.isEmailValid ? 'Email' : ''
  } ${!userShippingData.isCityValid ? 'Город' : ''} ${
    !userShippingData.isPvzValid ? 'Пункт Выдачи' : ''
  }`;

  if (paymentUrl) {
    window.location.href = paymentUrl;

    dispatch({
      type: CLEAR_CART,
    });
  }
  const handelClosePopup = () => {
    dispatch(closePopup());
  };

  const oneItemTotalValue = (id) => {
    let accTotal = 0;
    order.map((el) => {
      if (el.cart_item_id === id) {
        return el.attributes.size.reduce(
          (total, element) => (accTotal = total + element.qty),
          0,
        );
      }
      return accTotal;
    });
    return accTotal;
  };

  // Вычисляет доставку с страховкой (0.75%) + эквайринг 3,5% все к стоимости доставки
  const deliveryTotalCalc = (sumOrder, delivery) => {
    // Доставка + страховка
    const deliveryOnly = Math.round(delivery + sumOrder * 0.0075);
    // + эквайринг
    return Math.round(deliveryOnly / 0.965);
  };

  const createOrderHandler = () => {
    if (!isUserFormValid) {
      if (!userCartData.isNameValid) {
        setFirstLoadInput((firstLoadInput.name = true));
      }
      if (!userCartData.isPhoneValid) {
        setFirstLoadInput((firstLoadInput.phone = true));
      }
      if (!userCartData.isEmailValid) {
        setFirstLoadInput((firstLoadInput.email = true));
      }
      if (!userCartData.isSurnameValid) {
        setFirstLoadInput((firstLoadInput.surname = true));
      }
      setFirstLoadInput({
        ...firstLoadInput,
      });
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
          variant: item.print ? 'с печатью' : 'без печати',
          quantity: oneItemTotalValue(item.cart_item_id),
        });
      });

      window.dataLayer.push({
        ecommerce: {
          currencyCode: 'RUB',
          purchase: {
            actionField: {
              id: uuidv4(),
              revenue: orderPrice.price,
            },
            products: metrikaProducts,
          },
        },
      });
      dispatch(
        createOrder(
          order,
          orderPrice.price,
          discounted_price,
          userCartData,
          validPromoCode,
          shippingData,
          userShippingData,
          deliveryTotalCalc(orderPrice.price, shippingTarif.total_sum),
        ),
      );
    }
  };

  useEffect(() => {
    getShippingPoints();
    setShippingPrice(
      shippingTarif.total_sum
        ? Math.ceil(
          deliveryTotalCalc(orderPrice.price, shippingTarif.total_sum),
        )
        : 0,
    );
  }, [shippingPoints]);

  // подтсраховка от "зажевывания" стоимости доставки
  useEffect(() => {
    setShippingPrice(
      shippingTarif.total_sum
        ? Math.ceil(
          deliveryTotalCalc(orderPrice.price, shippingTarif.total_sum),
        )
        : 0,
    );
  }, [shippingTarif]);

  useEffect(() => {
    if (debouncedSearchTerm) {
      setListCities(listCities);
      getCities(listCities);
    }
  }, [debouncedSearchTerm]);

  useEffect(() => {
    dispatch({
      type: SET_CART_VISIBILITY,
      payload: false,
    });

    return () => {
      dispatch({ type: SET_CART_VISIBILITY, payload: true });
      dispatch({ type: SET_SDEK_DEFAULT_STATE });
    };
  }, []);

  useEffect(() => {
    if (typeList) {
      if (listCities.city != userShippingData.city.city) {
        setUserShippingDataReset();
        setTypeList(false);
        setCenterMap([59.972621, 30.306432]);
        setListPoints(null);
      }
    }
  });

  useEffect(() => {
    dispatch({
      type: ADD_ORDER_PRICE,
      payload: orderPrice,
    });
  }, [order]);
  return (
    <div className={styles.wrap}>
      <h1 className={styles.wrap_title}>
        ВАШИ ДАННЫЕ / <span className={styles.wrap_subTitle}>CHEСKOUT</span>
      </h1>
      <div className={styles.body}>
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
              className={
                firstLoadInput.name && !userCartData.isNameValid
                  ? `${styles.user_form_input} ${styles.user_form_inputError}`
                  : styles.user_form_input
              }
              required
              onChange={inputChangeHandler}
              value={userCartData.name}
            />
            <label htmfor="surname" className={styles.input_label}>
              Фамилия*:
            </label>
            <input
              type="text"
              minLength="2"
              placeholder="Ваша фамилия"
              id="surname"
              name="surname"
              className={
                firstLoadInput.surname && !userCartData.isSurnameValid
                  ? `${styles.user_form_input} ${styles.user_form_inputError}`
                  : styles.user_form_input
              }
              required
              onChange={inputChangeHandler}
              value={userCartData.surname}
            />
            <label htmfor="phone" className={styles.input_label}>
              Телефон*:
            </label>
            <InputMask
              mask="+7 (999) 999-9999"
              maskChar="_"
              type="tel"
              minLength="11"
              placeholder="Ваш телефон"
              id="phone"
              name="phone"
              className={
                firstLoadInput.phone && !userCartData.isPhoneValid
                  ? `${styles.user_form_input} ${styles.user_form_inputError}`
                  : styles.user_form_input
              }
              required
              onChange={inputChangeHandler}
              value={userCartData.phone}
            />
            <label htmfor="email" className={styles.input_label}>
              Email*:
            </label>
            <input
              type="email"
              placeholder="Ваш email"
              id="email"
              name="email"
              className={
                firstLoadInput.email && !userCartData.isEmailValid
                  ? `${styles.user_form_input} ${styles.user_form_inputError}`
                  : styles.user_form_input
              }
              required
              onChange={inputChangeHandler}
              value={userCartData.email}
            />
          </form>
          <form
            className={`${styles.user_form} ${styles.user_deliveryForm}`}
            id="delivery_form"
          >
            <div className={styles.user_radioWrap}>
              <div className={styles.user_radioWrapper}>
                <input
                  type="radio"
                  id="radioPickup"
                  name="radio"
                  value="1"
                  onClick={() => {
                    setRadioDelivery('самовывоз');
                    setDefoultShippingState();
                    setTypeList(false);
                    dispatch({
                      type: SET_DEFAULT_USERSHIPPINGDATA,
                    });
                    dispatch({
                      type: SET_SDEK_DEFAULT_STATE,
                    });
                    setChekInput(true);
                    setChekSelect(true);
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
                    setDefoultShippingState();
                    dispatch(getSdekCities());
                    setRadioDelivery('сдэк');
                    setUserShippingDataReset();
                  }}
                />
                <label htmlFor="radioSdek">Доставка</label>
              </div>
            </div>
            {typeDelivery.sdek && (
              <>
                <div className={styles.inputShippingWrap}>
                  <label htmlFor="cityInput">Выберите город*:</label>
                  <input
                    type="text"
                    id="cityInput"
                    className={
                      checkInput
                        ? styles.user_form_input
                        : `${styles.user_form_input} ${styles.user_form_inputError}`
                    }
                    required
                    placeholder="Город"
                    value={listCities.city || listCities}
                    onChange={(e) => {
                      setListCities(e.target.value);
                      setTypeList(false);
                      dispatch({
                        type: SET_SDEK_RESET_POINTS,
                      });
                      setUserShippingDataReset();
                      setListPoints(null);
                    }}
                  />
                </div>
                {!typeList ? (
                  debounceCities.length > 0 && (
                    <div className={styles.cities_wrap}>
                      <ul className={styles.cities_list}>
                        {debounceCities.map((item) => (
                          <li
                            key={item.code}
                            onClick={() => {
                              if (item.latitude) {
                                setCenterMap([item.latitude, item.longitude]);
                              }
                              dispatch(getSdekPoints(item.code));
                              setListCities(item);
                              setTypeList(true);
                              dispatch({
                                type: SET_SHIPPING_CITIES,
                                payload: {
                                  item: {
                                    ...item,
                                  },
                                  isCityValid: true,
                                },
                              });
                              setChekInput(true);
                              dispatch(
                                getSdekShippingTarif(
                                  item.code,
                                  (item.orderWeight = orderWeight),
                                ),
                              );
                            }}
                            className={styles.cities_listItem}
                          >
                            {item.city},{item.region}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )
                ) : (
                  <>
                    <p className={styles.shippingPrice}>
                      Доставка до пункта выдачи:{' '}
                      {validPromoCode.mechanic === 'freeShipping'
                        ? 'Бесплатная доставка'
                        : `${shippingPrice} Р`}
                    </p>
                    <div className={styles.shippingSelectWrap}>
                      <p>Выберите ПВЗ*: </p>
                      <ShippingSelect
                        options={mapPoints}
                        onChange={onChangeSelect}
                        defaultValue="Выберите пункт выдачи:"
                        editValue={listPoints}
                        errBorder={checkSelect}
                      />
                    </div>
                    {true && (
                      <ShippingMap
                        points={mapPoints}
                        updatePointInput={findShippingObject}
                        setCenter={centerMap}
                      />
                    )}
                  </>
                )}
              </>
            )}
          </form>
        </div>
        <div className={styles.button_wrapper}>
          <p
            className={`${styles.button_wrapper__text} ${styles.button_wrapper__textPrice}`}
          >
            Стоимость заказа: {orderPrice.price} Р.
          </p>
          <p
            className={`${styles.button_wrapper__text} ${styles.button_wrapper__textShip}`}
          >
            Стоимость доставки:{' '}
            {validPromoCode.mechanic === 'freeShipping'
              ? 'Бесплатная доставка'
              : `${shippingPrice} Р.`}
          </p>
          <p
            className={`${styles.button_wrapper__text} ${styles.button_wrapper__textPrePrice}`}
          >
            Подытог: {discounted_price} Р.
          </p>
          <div className={styles.button_wrapperPromo}>
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
                />
                <button type="submit" className={styles.promo_submit}>
                  &gt;
                </button>
              </form>
            ) : promocodeFail ? (
              <div className={styles.promocode_wrapper}>
                <p className={styles.promocode_message}>
                  Что-то пошло не так :(
                </p>
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
          </div>
          <p
            className={`${styles.button_wrapper__text} ${styles.button_wrapper__textPrePrice}`}
          >
            Итог: {discounted_price} Р.
          </p>
          <button
            type="button"
            className={styles.control_button}
            onClick={createOrderHandler}
          />
          {isOtherPopupVisible && (
            <PopupModel onClose={handelClosePopup}>
              <div className={styles.popupBlock}>
                {!isUserFormValid && (
                  <p className={styles.validation_message}>Заполните поля:</p>
                )}
                {isOtherPopupVisible.map((el) => (
                  <p
                    className={`${styles.validation_message} ${styles.popupBlock_message}`}
                    key={el}
                  >
                    {el}
                  </p>
                ))}
              </div>
            </PopupModel>
          )}
        </div>
      </div>
    </div>
  );
}

export default Checkout;
