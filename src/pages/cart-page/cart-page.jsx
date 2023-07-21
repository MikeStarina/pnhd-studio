import React, { useEffect, useState } from 'react';
import styles from './cart-page.module.css';
import { useSelector, useDispatch } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
    CHANGE_ITEM_QTY,
    CLEAR_CART,
    SET_CART_VISIBILITY,
    DELETE_ITEM_FROM_CART,
    DELETE_PRINT_FROM_CART,
    GET_USER_PROMOCODE,
    DELETE_ACTIVE_PROMOCODE,
} from '../../services/actions/cart-actions';
import {
    SET_USER_DATA,
    SET_SHIPPING_CITIES,
    SET_SHIPPING_PVZ,
    SET_DEFAULT_USERSHIPPINGDATA,
} from '../../services/actions/user-data-actions';
import { createOrder } from '../../services/actions/cart-actions';
import ItemPrint from '../../components/cart-page-components/item-print';
import closeicon from '../../components/images/closeIcon.svg';
import { apiBaseUrl } from '../../utils/constants';
import mir from '../../components/images/mir.png';
import visa from '../../components/images/visa.png';
import kassa from '../../components/images/kassa.png';
import Mastercard from '../../components/images/Mastercard.png';
import { checkPromoCodeValidity } from '../../services/actions/cart-actions';
import { ShippingMap } from '../../components/shipping-components/shipping-map';
import { ShippingSelect } from '../../components/shipping-components/shipping-select';
import { v4 as uuidv4 } from 'uuid';
import PopupModel from '../../components/popupModel/popupModel';
import {
    SET_POPUP_VISIBILITY,
    openPopup,
    closePopup,
} from '../../services/actions/utility-actions';
import useDebounce from '../../hooks/useDebounce';
import {
    getSdekCities,
    getSdekPoints,
    getSdekShippingTarif,
    SET_SDEK_DEFAULT_STATE,
    SET_SDEK_RESET_POINTS,
} from '../../services/actions/shipping-actions';
import SizeSelection from '../../components/size-selection/size-selection';

const CartPage = () => {
    const [debounceCities, setDebounceCities] = useState([]);
    const [checkInput, setChekInput] = useState(true);
    const [firstLoadInput, setFirstLoadInput] = useState({
        name: false,
        surname: false,
        email: false,
        phone: false,
    });
    const [checkSelect, setChekSelect] = useState(true);
    const [typeDelivery, setTypeDelivery] = useState({
        pickup: true,
        sdek: false,
    });
    const [listCities, setListCities] = useState('');
    const [shippingPrice, setShippingPrice] = useState(0);
    const [listPoints, setListPoints] = useState(null);
    const [typeList, setTypeList] = useState(false);
    const [typeShipping, setTypeShipping] = useState(false);
    const [centerMap, setCenterMap] = useState([59.972621, 30.306432]);
    const [mapPoints, setMapPoints] = useState();
    const [resetPopup, setResetPopup] = useState(true);
    const {
        order,
        paymentUrl,
        user_promocode,
        isPromocodeLoading,
        promocodeFail,
        validPromoCode,
    } = useSelector((store) => store.cartData);
    const { userCartData, userShippingData } = useSelector(
        (store) => store.userData,
    );
    const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
    const { shippingCities, shippingTarif, shippingPoints } = useSelector(
        (store) => store.shippingData.shippingData,
    );
    const { shippingData } = useSelector((store) => store.shippingData);
    const history = useHistory();
    const dispatch = useDispatch();
    const debouncedSearchTerm = useDebounce(listCities, 500);
    const getShippingPoints = () => {
        const arr = shippingPoints.map((item) => {
            return {
                name: item.name,
                coordinates: [item.location.latitude, item.location.longitude],
                color: '#1E98FF',
            };
        });
        setMapPoints(arr);
    };

    useEffect(() => {
        getShippingPoints();
        setShippingPrice(
            shippingTarif.total_sum ? Math.ceil(shippingTarif.total_sum) : 0,
        );
    }, [shippingPoints]);

    //подтсраховка от "зажевывания" стоимости доставки
    useEffect(() => {
        setShippingPrice(
            shippingTarif.total_sum ? Math.ceil(shippingTarif.total_sum) : 0,
        );
    }, [shippingTarif]);
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

    const onChangeSelect = (elem) => {
        shippingPoints.forEach((item) => {
            if (
                item.name.toLowerCase().indexOf(elem.name.toLowerCase()) != -1
            ) {
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
    const { phone } = userCartData;

    let regex = /[^0-9]/gi;

    let newPhone;
    if (phone) {
        if (phone[0] === '8') {
            newPhone = phone.replace('8', '7');
        }
    }

    useEffect(() => {
        if (typeList) {
            if (listCities.city != userShippingData.city.city) {
                setUserShippingDataReset();
                setTypeList(false);
                setCenterMap([59.972621, 30.306432]);
                setListPoints(null);
                setTypeShipping(false);
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

    const oneItemTotalValue = (id) => {
        let accTotal = 0;
        order.map((el) => {
            if (el.cart_item_id === id) {
                return el.attributes.size.reduce((total, element) => {
                    return (accTotal = total + element.qty);
                }, 0);
            }
            return accTotal;
        });
        return accTotal;
    };

    const totalPrice = order.reduce((acc, item) => {
        let printTotalprice = 0;
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
            item.attributes.price * oneItemTotalValue(item.cart_item_id) +
            printTotalprice * oneItemTotalValue(item.cart_item_id);
        return acc;
    }, 0);

    const valueButton = order.some(
        (item) => oneItemTotalValue(item.cart_item_id) === 0,
    );

    useEffect(() => {
        if (!isOtherPopupVisible && resetPopup && valueButton) {
            dispatch(openPopup(['Нужно выбрать размер']));
        }
        if (totalPrice !== 0 && !resetPopup) {
            setResetPopup(true);
        }
    }, [totalPrice, valueButton]);

    const shipping_price = validPromoCode.discount_ratio
        ? totalPrice * validPromoCode.discount_ratio + (shippingPrice || 0)
        : totalPrice + (shippingPrice || 0);

    const shipping_free = validPromoCode.discount_ratio
        ? totalPrice * validPromoCode.discount_ratio
        : totalPrice;

    const discounted_price =
        validPromoCode.mechanic === 'freeShipping'
            ? shipping_free
            : shipping_price;

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

    const onChange = (e) => {};

    const inputChangeHandler = (e) => {
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

    const close = () => {
        history.goBack();
    };

    const handelClosePopup = () => {
        if (totalPrice === 0) {
            setResetPopup(false);
        }
        dispatch(closePopup());
    };

    const createOrderHandler = () => {
        if (valueButton) {
            dispatch(openPopup(['Нужно выбрать размер']));
        } else if (!isUserFormValid) {
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
                    validPromoCode,
                    shippingData,
                    userShippingData,
                ),
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

    // Берет габариты товара для расчета стоимости [{},{}]
    const orderWeight = order.map((el) => {
        const sizes = el.attributes.shippingParams;
        return {
            weight: sizes.weight,
            length: sizes.length,
            width: sizes.width,
            height: sizes.depth,
        };
    });

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
        if (type === 'самовывоз') {
            setTypeDelivery({
                pickup: true,
                sdek: false,
            });
            setTypeShipping(false);
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

    const getCities = (elem) => {
        const list = [];
        if (elem.length >= 3) {
            shippingCities.forEach((item) => {
                if (list.length != 5) {
                    if (
                        item.city.toLowerCase().indexOf(elem.toLowerCase()) !=
                        -1
                    ) {
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

    const setDefoultShippingState = () => {
        setListCities('');
        setDebounceCities([]);
        setListPoints(null);
        setCenterMap([59.972621, 30.306432]);
    };

    const popupStyle = valueButton
        ? `${styles.instruction}`
        : `${styles.popupBlock_message}`;

    return (
        <section className={styles.screen}>
            <div className={styles.cart_title_box}>
                <h1 className={styles.cart_title}>
                    КОРЗИНА / <i>CART</i>
                </h1>
                <button
                    type="button"
                    className={styles.goback_button}
                    onClick={close}
                >
                    &larr; НАЗАД
                </button>
            </div>

            <ul className={styles.cart_container}>
                {order &&
                    order.map((item) => {
                        return (
                            <li
                                className={styles.cart_item}
                                key={item.cart_item_id}
                            >
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
                                            <h3 className={styles.title}>
                                                {item.attributes.name}
                                            </h3>
                                            <p
                                                className={styles.description}
                                            ></p>
                                            <div
                                                className={
                                                    styles.qty_input_wrapper
                                                }
                                            >
                                                <label
                                                    htmfor={item.cart_item_id}
                                                    className={
                                                        styles.description
                                                    }
                                                ></label>
                                                {item.attributes.size ? (
                                                    item.attributes.size.map(
                                                        (el, i) => (
                                                            <SizeSelection
                                                                name={el.name}
                                                                qty={el.qty}
                                                                id={
                                                                    item.cart_item_id
                                                                }
                                                                key={
                                                                    item.cart_item_id +
                                                                    i
                                                                }
                                                            />
                                                        ),
                                                    )
                                                ) : (
                                                    <option>
                                                        Нет в наличии
                                                    </option>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <p className={styles.price}>
                                        ={' '}
                                        {item.attributes.price *
                                            oneItemTotalValue(
                                                item.cart_item_id,
                                            )}{' '}
                                        P.
                                    </p>
                                </div>
                                {item.print && item.print.front.file && (
                                    <ItemPrint
                                        print={item.print.front_preview.preview}
                                        params={item.print.front}
                                        qty={oneItemTotalValue(
                                            item.cart_item_id,
                                        )}
                                        title={'Принт на груди:'}
                                        print_id={'front_print'}
                                        item_id={item.cart_item_id}
                                    />
                                )}
                                {item.print && item.print.back.file && (
                                    <ItemPrint
                                        print={item.print.back_preview.preview}
                                        params={item.print.back}
                                        qty={oneItemTotalValue(
                                            item.cart_item_id,
                                        )}
                                        title={'Принт на спине:'}
                                        print_id={'back_print'}
                                        item_id={item.cart_item_id}
                                    />
                                )}
                                {item.print && item.print.lsleeve.file && (
                                    <ItemPrint
                                        print={
                                            item.print.lsleeve_preview.preview
                                        }
                                        params={item.print.lsleeve}
                                        qty={oneItemTotalValue(
                                            item.cart_item_id,
                                        )}
                                        title={'Принт на левом рукаве:'}
                                        print_id={'lsleeve_print'}
                                        item_id={item.cart_item_id}
                                    />
                                )}
                                {item.print && item.print.rsleeve.file && (
                                    <ItemPrint
                                        print={
                                            item.print.rsleeve_preview.preview
                                        }
                                        params={item.print.rsleeve}
                                        qty={oneItemTotalValue(
                                            item.cart_item_id,
                                        )}
                                        title={'Принт на правом рукаве:'}
                                        print_id={'rsleeve_print'}
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
                            className={
                                firstLoadInput.name && !userCartData.isNameValid
                                    ? `${styles.user_form_input} ${styles.user_form_inputError}`
                                    : styles.user_form_input
                            }
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
                            className={
                                firstLoadInput.surname &&
                                !userCartData.isSurnameValid
                                    ? `${styles.user_form_input} ${styles.user_form_inputError}`
                                    : styles.user_form_input
                            }
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
                            className={
                                firstLoadInput.phone &&
                                !userCartData.isPhoneValid
                                    ? `${styles.user_form_input} ${styles.user_form_inputError}`
                                    : styles.user_form_input
                            }
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
                            className={
                                firstLoadInput.email &&
                                !userCartData.isEmailValid
                                    ? `${styles.user_form_input} ${styles.user_form_inputError}`
                                    : styles.user_form_input
                            }
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
                            <label htmlFor="radioPickup">
                                Самовывоз из студии
                            </label>
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
                                    placeholder="Введите город"
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
                                ></input>
                                {!typeList ? (
                                    debounceCities.length > 0 && (
                                        <div className={styles.cities_wrap}>
                                            <ul className={styles.cities_list}>
                                                {debounceCities.map(
                                                    (item, index) => {
                                                        return (
                                                            <li
                                                                key={index}
                                                                onClick={() => {
                                                                    if (
                                                                        item.latitude
                                                                    ) {
                                                                        setCenterMap(
                                                                            [
                                                                                item.latitude,
                                                                                item.longitude,
                                                                            ],
                                                                        );
                                                                    }
                                                                    dispatch(
                                                                        getSdekPoints(
                                                                            item.code,
                                                                        ),
                                                                    );
                                                                    setListCities(
                                                                        item,
                                                                    );
                                                                    setTypeList(
                                                                        true,
                                                                    );
                                                                    dispatch({
                                                                        type: SET_SHIPPING_CITIES,
                                                                        payload:
                                                                            {
                                                                                item: {
                                                                                    ...item,
                                                                                },
                                                                                isCityValid: true,
                                                                            },
                                                                    });
                                                                    setChekInput(
                                                                        true,
                                                                    );
                                                                    dispatch(
                                                                        getSdekShippingTarif(
                                                                            item.code,
                                                                            (item.orderWeight =
                                                                                orderWeight),
                                                                        ),
                                                                    );
                                                                }}
                                                                className={
                                                                    styles.cities_listItem
                                                                }
                                                            >
                                                                {item.city},{' '}
                                                                {item.region}
                                                            </li>
                                                        );
                                                    },
                                                )}
                                            </ul>
                                        </div>
                                    )
                                ) : (
                                    <>
                                        <p>
                                            Доставка до пункта выдачи:{' '}
                                            {shippingPrice}
                                        </p>
                                        <p>Выберите пункт выдачи: </p>
                                        <ShippingSelect
                                            options={mapPoints}
                                            onChange={onChangeSelect}
                                            defaultValue={
                                                'Выберите пункт выдачи:'
                                            }
                                            editValue={listPoints}
                                            errBorder={checkSelect}
                                        />
                                        {true && (
                                            <>
                                                <ShippingMap
                                                    points={mapPoints}
                                                    updatePointInput={
                                                        findShippingObject
                                                    }
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
                        <form
                            className={styles.promo_form}
                            onSubmit={promoSubmitHandler}
                        >
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
                            <button
                                type="submit"
                                className={styles.promo_submit}
                            >
                                &rarr;
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
                    <p className={styles.total_price}>
                        Итого: {discounted_price} P.
                    </p>
                    <button
                        type="button"
                        className={styles.control_button}
                        onClick={createOrderHandler}

                        // disabled={!isUserFormValid}
                    ></button>
                    {isOtherPopupVisible && (
                        <PopupModel onClose={handelClosePopup}>
                            <div className={styles.popupBlock}>
                                {!isUserFormValid && !valueButton && (
                                    <p
                                        className={`${styles.validation_message}`}
                                    >
                                        Заполните поля:
                                    </p>
                                )}
                                {isOtherPopupVisible.map((el, index) => (
                                    <p
                                        className={`${styles.validation_message} ${popupStyle}`}
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
                    <img
                        src={kassa}
                        alt="Юкасса"
                        className={styles.payment_logo}
                    ></img>
                    <img
                        src={visa}
                        alt="visa"
                        className={styles.payment_logo}
                    ></img>
                    <img
                        src={Mastercard}
                        alt="Mastercard"
                        className={styles.payment_logo}
                    ></img>
                    <img
                        src={mir}
                        alt="Мир"
                        className={styles.payment_logo}
                    ></img>
                </div>
                <div className={styles.shipping_info}>
                    <h4 className={styles.shipping_heading}>
                        Как получить заказ?
                    </h4>
                    <p className={styles.shipping_description}>
                        Мы обрабатываем заказы ежедневно с 11 до 20. После
                        оформления заказ и оплаты наши менеджеры свяжутся с вами
                        для его подтверждения.
                    </p>
                    <p className={styles.shipping_description}>
                        Способ получения заказа по умолчанию - самовывоз из
                        нашей студии по адресу: Санкт-Петербург, ул. Чапыгина 1.
                        Студия работает с 11 до 20 без выходных
                    </p>
                    <p className={styles.shipping_description}>
                        Мы можем доставить заказ по Санкт-Петербургу и России.
                        Если вам требуется доставка, то, пожалуйста, сообщите об
                        этом менеджеру, который сообщит вам о готовности заказа
                        и он(а) расскажет как сделать это удобно и поможет с
                        оформлением
                    </p>
                </div>
            </div>
        </section>
    );
};

export default CartPage;
