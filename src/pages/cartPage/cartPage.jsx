import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { DELETE_PRINT_FROM_CART, DELETE_ITEM_FROM_CART } from '../../services/actions/cart-actions';
import styles from './cartPage.module.css';
import SizeSelection from '../../components/size-selection/size-selection';
import Modal from '../../components/modal/modal';
import Mir from '../../components/images/cartPageMir.svg';
import Visa from '../../components/images/cartPageVisa.svg';
import MasterCard from '../../components/images/cartPageMastercard.svg';
import Ukassa from '../../components/images/cartPageUkassa.svg';
import { apiBaseUrl } from '../../utils/constants';

function Cart() {
  const [size, setSize] = useState('');
  const [prewievImg, setPrewievImg] = useState('');
  const [modalActive, setModalActive] = useState(false);
  const {
    order,
    paymentUrl,
    user_promocode,
    isPromocodeLoading,
    promocodeFail,
    validPromoCode,
  } = useSelector((store) => store.cartData);
  const dispatch = useDispatch();
  const deletePrintFromCart = (e) => {
    dispatch({
      type: DELETE_PRINT_FROM_CART,
      item_id: e.target.id,
      print_id: e.target.name,
    });
  };
  const deleteItemFromCart = (e) => {
    dispatch({
      type: DELETE_ITEM_FROM_CART,
      payload: e.target.id,
    });
  };
  // console.log(order);
  let arr = [];
  let totalPrintSum = 0;
  let totalProductsSum = 0;

  const getPreviewArr = (obj) => {
    const { print, cart_item_id } = obj;
    const initialValue = 0;
    const productPriece = obj.attributes.size.reduce(
      (accumulator, currentValue) => accumulator + currentValue.qty,
      initialValue,
    );
    arr = [];
    totalPrintSum = 0;
    if (!print) return;
    if (print.front.file) {
      totalPrintSum += print.front.cartParams.price * productPriece;
      arr.push({
        place: 'Принт на груди.',
        name: 'front_print',
        format: print.front.cartParams.format,
        price: print.front.cartParams.price,
        size: print.front.cartParams.size,
        preview: print.front_preview.preview,
        id: cart_item_id,
      });
    }
    if (print.back.file) {
      totalPrintSum += print.back.cartParams.price * productPriece;
      arr.push({
        place: 'Принт на спине.',
        name: 'back_print',
        format: print.back.cartParams.format,
        price: print.back.cartParams.price,
        size: print.back.cartParams.size,
        preview: print.back_preview.preview,
        id: cart_item_id,
      });
    }
    if (print.lsleeve.file) {
      totalPrintSum += print.lsleeve.cartParams.price * productPriece;
      arr.push({
        place: 'Принт на л. рукаве.',
        name: 'lsleeve_print',
        format: print.lsleeve.cartParams.format,
        price: print.lsleeve.cartParams.price,
        size: print.lsleeve.cartParams.size,
        preview: print.lsleeve_preview.preview,
        id: cart_item_id,
      });
    }
    if (print.rsleeve.file) {
      totalPrintSum += print.rsleeve.cartParams.price * productPriece;
      arr.push({
        place: 'Принт на п. рукаве.',
        name: 'rsleeve_print',
        format: print.rsleeve.cartParams.format,
        price: print.rsleeve.cartParams.price,
        size: print.rsleeve.cartParams.size,
        preview: print.rsleeve_preview.preview,
        id: cart_item_id,
      });
    }
  };
  return (
    <>
      <h1 className={styles.pageTitle}>КОРЗИНА / CART</h1>
      {order.map((item, index) => {
        const url = `${apiBaseUrl}${item.attributes.image_url}`;
        const initialValue = 0;
        const productPriece = item.attributes.size.reduce(
          (accumulator, currentValue) => accumulator + currentValue.qty,
          initialValue,
        );
        totalProductsSum += totalPrintSum + item.attributes.price * productPriece;
        return (
          <div className={styles.products}>
            <div className={styles.productsImage}>
              <Link
                to={{ pathname: `/shop/${item.attributes.slug}` }}
                className={styles.link}
                key={index}
              >
                <img
                  className={styles.productsImage_test}
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
                <p className={styles.productsInfo_name}>
                  {item.attributes.name}
                </p>
              </Link>
              <p className={styles.productsInfo_count}>
                {item.attributes.price} Р. Х {productPriece} шт.
              </p>
              <p className={styles.productsInfo_sum}>
                — {item.attributes.price * productPriece} Р.
              </p>
              <p className={styles.ttt2}>Изменить&nbsp;размер</p>
              <p className={styles.productsInfo_text}>
                {item.attributes.description}
              </p>
              <div className={styles.ttt}>
                {item.attributes.size.length > 0 ? (
                  item.attributes.size.map((item) => (
                    <SizeSelection
                      name={item.name}
                      type="shop"
                      qty={item.qty}
                      size={size}
                      id={item._id}
                      key={item._id}
                    />
                  ))
                ) : (
                  <option>Нет в наличии</option>
                )}
              </div>
            </div>
            <div className={styles.productsPrint}>
              {getPreviewArr(item)}
              {arr.length > 0 ? (
                arr.map((elem, index) => {
                  return (
                    <div
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
                          {elem.place} {elem.size}
                        </p>
                        <p className={`${styles.productsPrint_prewievPrice_right} ${styles.productsPrint_prewievPrice_right__top}`}>
                          — формат {elem.format}
                        </p>
                        <p className={styles.productsPrint_prewievPrice_down}>
                          {elem.price} Р. х {productPriece} шт
                        </p>
                        <p className={`${styles.productsPrint_prewievPrice_right} ${styles.productsPrint_prewievPrice_right_down}`}>
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
                        <button
                          type="button"
                          className={styles.productsPrint_button}
                        >
                          Изменить
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p>Принты не выбраны</p>
              )}
              {arr.length < 4 && (
                <div className={styles.addPrintButton_wrap}>
                  <p>Добавить принт &gt;</p>
                </div>
              )}
            </div>
            <div className={styles.productsBottom}>
              <span className={styles.productsBottom_button_wrap}>
                <button
                  type="button"
                  className={styles.productsBottom_button}
                  onClick={deleteItemFromCart}
                  id={item.cart_item_id}
                >
                  Удалить&nbsp;товар
                </button>
              </span>
              <div className={styles.productsBottom_price}>
                <p>Текстиль: {item.attributes.price * productPriece}&nbsp;Р.</p>
                <p className={styles.productsBottom_pricePrint}>
                  Печать: {totalPrintSum}&nbsp;Р.
                </p>
                <p className={styles.productsBottom_priceAll}>
                  Подытог:{' '}
                  {totalPrintSum + item.attributes.price * productPriece}{' '}
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
            <span className={styles.payment_button}>Оферта</span>
            &nbsp;/
            <span type="button" className={styles.payment_button}>
              Гид по размерам
            </span>
            &nbsp;/
            <span type="button" className={styles.payment_button}>
              Гид&nbsp;по&nbsp;уходу
            </span>
          </div>
        </div>
        <p className={styles.paymentPrice}>
          Итого на сумму: {totalProductsSum} Р.
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
          <p>К оформлению &gt;&gt;</p>
        </div>
      </div>
      <>
        <Modal active={modalActive} setActive={setModalActive}>
          <img src={prewievImg} alt="Превью принта" />
        </Modal>
      </>
    </>
  );
}

export default Cart;
