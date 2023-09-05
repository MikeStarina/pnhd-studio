import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import {
  DELETE_PRINT_FROM_CART,
  DELETE_ITEM_FROM_CART,
  SET_CART_VISIBILITY,
  ADD_ORDER_PRICE,
} from '../../services/actions/cart-actions';
import styles from './cartPage.module.css';
import SizeSelection from '../../components/size-selection/size-selection';
import Modal from '../../components/modal/modal';
import Mir from '../../components/images/cartPageMir.svg';
import Visa from '../../components/images/cartPageVisa.svg';
import MasterCard from '../../components/images/cartPageMastercard.svg';
import Ukassa from '../../components/images/cartPageUkassa.svg';
import { apiBaseUrl } from '../../utils/constants';
import { getAllPrice, getPreviewArr, getPrintPrice } from '../../utils/cartPage';

function Cart() {
  const [size, setSize] = useState('');
  const [prewievImg, setPrewievImg] = useState('');
  const [modalSizeId, setModalSizeId] = useState({ id: '' });
  const [modalActive, setModalActive] = useState(false);
  const [modalSizeActive, setModalSizeActive] = useState(false);
  const { order } = useSelector((store) => store.cartData);

  const dispatch = useDispatch();
  const allOrderPrice = getAllPrice(order);

  const deletePrintFromCart = (e) => {
    dispatch({
      type: DELETE_PRINT_FROM_CART,
      item_id: e.target.id,
      print_id: e.target.name,
    });
  };
  const deleteItemFromCart = (e) => {
    console.log(e);
    dispatch({
      type: DELETE_ITEM_FROM_CART,
      payload: e.target.id,
    });
  };

  useEffect(() => {
    // event: KeyboardEvent - на будущее, для TS
    function handleEscapeKey(event) {
      if (event.code === 'Escape') {
        setModalSizeActive(false);
      }
    }
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, []);

  useEffect(() => {
    dispatch({
      type: ADD_ORDER_PRICE,
      payload: allOrderPrice,
    });
    return () => {
      dispatch({
        type: ADD_ORDER_PRICE,
        payload: allOrderPrice,
      });
    };
  }, [order]);

  useEffect(() => {
    dispatch({
      type: SET_CART_VISIBILITY,
      payload: false,
    });

    return () => {
      dispatch({ type: SET_CART_VISIBILITY, payload: true });
    };
  }, []);

  return (
    <>
      <h1 className={styles.pageTitle}>
        КОРЗИНА / <i>CART</i>
      </h1>
      {order.map((item, index) => {
        const url = `${apiBaseUrl}${item.attributes.image_url}`;
        const initialValue = 0;
        const productPriece = item.attributes.size.reduce(
          (accumulator, currentValue) => accumulator + currentValue.qty,
          initialValue,
        );
        const arr = getPreviewArr(item);
        const printPrice = getPrintPrice(item);
        return (
          <div className={styles.products} key={index}>
            <div className={styles.productsImage}>
              <Link
                to={{ pathname: `/shop/${item.attributes.slug}` }}
                className={styles.link}
                key={index}
              >
                <img
                  className={styles.productsImage_img}
                  src={url}
                  alt="Фото товара"
                />
              </Link>
            </div>
            <div className={styles.productsInfo}>
              <Link
                to={{ pathname: `/shop/${item.attributes.slug}` }}
                className={`${styles.link} ${styles.link__name}`}
                key={index}
              >
                <h2 className={styles.productsInfo_name}>
                  {item.attributes.name}
                </h2>
              </Link>
              <p className={styles.productsInfo_count}>
                {item.attributes.price} Р. Х {productPriece} шт.
              </p>
              <p className={styles.productsInfo_sum}>
                — {item.attributes.price * productPriece} Р.
              </p>
              <button
                type="button"
                className={styles.editSizeButton}
                onClick={(e) => {
                  setModalSizeActive(true);
                  setModalSizeId(e.target.id);
                }}
                id={item.cart_item_id}
              >
                Изменить&nbsp;размер
              </button>
              <p className={styles.productsInfo_text}>
                {item.attributes.description}
              </p>
              <div
                className={
                  !modalSizeActive || modalSizeId != item.cart_item_id ? styles.modalWrap : `${styles.modal} ${styles.active}`
                }
                onClick={() => {
                  setModalSizeActive(false);
                }}
              >
                <div
                  className={
                    !modalSizeActive ? '' : `${styles.modal__content} ${styles.active}`
                  }
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                >
                  {item.attributes.size.length > 0 && item.attributes.size.map((elem, index) => (
                    <SizeSelection
                        type="cart"
                        name={elem.name}
                        qty={elem.qty}
                        size={size}
                        id={item.cart_item_id}
                        key={elem._id}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className={styles.productsPrint}>
              {arr.length > 0 && (
                arr.map((elem, index) => {
                  return (
                    <div
                      key={index}
                      className={
                        index != 4 ? `${styles.productsPrint_prewiev} ${styles.productsPrint_prewiev_border}` : `${styles.productsPrint_prewiev}`
                      }
                    >
                      <img
                        className={styles.productsPrint_prewievImg}
                        src={elem.preview}
                        alt="Превью принта"
                        onClick={() => {
                          setPrewievImg(elem.preview);
                          setModalActive(true);
                        }}
                      />
                      <span className={styles.productsPrint_prewievPrice}>
                        <p className={styles.productsPrint_prewievPrice_place}>
                          <span
                            className={styles.productsPrint_prewievPrice_format}
                          >
                            {elem.place}
                          </span>
                          <span
                            className={styles.productsPrint_prewievPrice_size}
                          >
                            {elem.size}
                          </span>
                        </p>
                        <p
                          className={`${styles.productsPrint_prewievPrice_right} ${styles.productsPrint_prewievPrice_right__top}`}
                        >
                          — формат {elem.format}
                        </p>
                        <p className={styles.productsPrint_prewievPrice_down}>
                          {elem.price} Р. х {productPriece} шт
                        </p>
                        <p
                          className={`${styles.productsPrint_prewievPrice_right} ${styles.productsPrint_prewievPrice_right_down}`}
                        >
                          — {elem.price * productPriece} Р.
                        </p>
                      </span>
                      <div className={styles.productsPrint_buttons}>
                        <button
                          type="button"
                          className={styles.productsPrint_button}
                          name={elem.name}
                          id={elem.id}
                          onClick={deletePrintFromCart}
                        >
                          Удалить
                        </button>
                        &nbsp;/&nbsp;
                        <Link
                          to={{
                            pathname: `/shop/${item.attributes.slug}/constructor`,
                            state: { state: item.cart_item_id, from: 'cart' },
                          }}
                          className={`${styles.link} ${styles.link__name}`}
                          key={index}
                        >
                          <span className={styles.productsPrint_button}>Изменить</span>
                        </Link>
                      </div>
                    </div>
                  );
                })
              )}
              {arr.length < 4 && (
                <div className={arr.length === 0 ? `${styles.addPrintButton_wrap} ${styles.addPrintButton_wrapBottom}` : `${styles.addPrintButton_wrap}`}>
                  <Link
                  to={{
                    pathname: `/shop/${item.attributes.slug}/constructor`,
                    state: { state: item.cart_item_id, from: 'cart' },
                  }}
                  className={`${styles.link} ${styles.link__name}`}
                  key={index}
                  >
                    <button className={styles.addPrintButton_wrap_text}>Добавить принт &gt;</button>
                  </Link>
                </div>
              )}
            </div>
            <div className={styles.productsBottom}>
              <div className={styles.productsBottom_button_wrap}>
                <button
                  type="button"
                  className={styles.productsBottom_button}
                  onClick={deleteItemFromCart}
                  id={item.cart_item_id}
                >
                  Удалить&nbsp;товар
                </button>
              </div>
              <div className={styles.productsBottom_price}>
                <p>Текстиль: {item.attributes.price * productPriece}&nbsp;Р.</p>
                <p className={styles.productsBottom_pricePrint}>
                  Печать: {printPrice}&nbsp;Р.
                </p>
                <p className={styles.productsBottom_priceAll}>
                  Подытог:{' '}
                  {printPrice + item.attributes.price * productPriece}{' '}
                  &nbsp;Р.
                </p>
              </div>
            </div>
          </div>
        );
      })}
      <div className={styles.payment}>
        <div className={styles.paymentLinks}>
          <img src={Visa} alt="Visa" />
          <img src={MasterCard} alt="MasterCard" />
          <img src={Mir} alt="Mir" />
          <img src={Ukassa} alt="Ukassa" />
          <div className={styles.payment_buttons}>
            <Link to={{ pathname: '/oferta' }} className={`${styles.link} ${styles.link__name}`}>
              <span className={styles.payment_button}>Оферта </span>
            </Link>
            &nbsp;/
            <Link to={{ pathname: '/size_chart' }} className={`${styles.link} ${styles.link__name}`}>
              <span className={styles.payment_button}>Гид по размерам</span>
            </Link>
            &nbsp;/
            <span className={styles.payment_button}>
              Гид&nbsp;по&nbsp;уходу
            </span>
          </div>
        </div>
        <p className={styles.paymentPrice}>
          Итого на сумму: {allOrderPrice.price} Р.
        </p>
      </div>
      <div className={styles.makeOrder}>
        <span className={styles.makeOrder_text}>
          <p>
            Мы обрабатываем онлайн заказы ежедневно с 11 до 19. Если вы оформили
            заказ в нерабочее время, то он будет обработан на следующий рабочий
            день.
          </p>
          <p>
            Наши менеджеры свяжутся с вами через 90 — 120 минут после оформления
            заказа и подтвердят все детали.
          </p>
          <p>
            Заказы без печати готовы к выдаче сразу. Время выполнения заказов с
            печатью зависит от количества изделий, количества принтов на них и
            может составлять от 15 минут до нескольких дней. Пожалуйста
            уточняйте точное время выполнения у менеджера.
          </p>
          <p>
            Доставка осуществляется курьерской службой СДЕК. Срок выполнения
            заказа не учитывает доставку.
          </p>
        </span>
        <div className={styles.addPrintButton_wrap}>
          <Link to={{ pathname: '/checkout' }} className={`${styles.link} ${styles.link__name}`}>
            <button
              className={styles.addPrintButton_wrap_text}
              onClick={() => {
                dispatch({
                  type: ADD_ORDER_PRICE,
                  payload: allOrderPrice,
                });
              }}
            >К оформлению &gt;&gt;
            </button>
          </Link>
        </div>
      </div>
      <>
        <Modal active={modalActive} setActive={setModalActive}>
          <img
            src={prewievImg}
            alt="Превью принта"
            className={styles.modalImg}
          />
        </Modal>
      </>
    </>
  );
}

export default Cart;
