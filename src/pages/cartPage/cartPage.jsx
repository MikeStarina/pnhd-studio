import React, { useEffect, useState } from 'react';
import styles from './cartPage.module.css';
import SizeSelection from '../../components/size-selection/size-selection';
import testImage from '../../components/images/green_marble_w_main 1.png';
import testImagePrew from '../../components/images/mailservice 4.png';
import Mir from '../../components/images/cartPageMir.svg';
import Visa from '../../components/images/cartPageVisa.svg';
import MasterCard from '../../components/images/cartPageMastercard.svg';
import Ukassa from '../../components/images/cartPageUkassa.svg';

const testSizeObject = [
  {
    name: 'XS',
    qty: 0,
    _id: '63dd05d924d623a73dd1a9c50',
  },
  {
    name: 'S',
    qty: 0,
    _id: '63dd05d924d623a73dd1a9c51',
  },
  {
    name: 'M',
    qty: 0,
    _id: '63dd05d924d623a73dd1a9c52',
  },
  {
    name: 'L',
    qty: 0,
    _id: '63dd05d924d623a73dd1a9c53',
  },
  {
    name: 'XL',
    qty: 0,
    _id: '63dd05d924d623a73dd1a9c54',
  },
  {
    name: 'XXL',
    qty: 0,
    _id: '63dd05d924d623a73dd1a9c55',
  },
  {
    name: 'XXXL',
    qty: 0,
    _id: '63dd05d924d623a73dd1a9c56',
  },
];
const testPrewievObject = [
  {
    a: 'Принт на груди. 32х28см',
    b: '- формат А3',
    c: '750 Р. х 1 шт',
    d: '— 750 Р.',
  },
  {
    a: 'Принт на спине. 32х28см',
    b: '- формат А3',
    c: '750 Р. х 1 шт',
    d: '— 750 Р.',
  },
  {
    a: 'Принт на л. рукаве. 32х28см',
    b: '- формат А3',
    c: '750 Р. х 1 шт',
    d: '— 750 Р.',
  },
  {
    a: 'Принт на п. рукаве. 32х28см',
    b: '- формат А3',
    c: '750 Р. х 1 шт',
    d: '— 750 Р.',
  },
];
const testPrewievObject2 = [];
const testPrewievObject3 = [
  {
    a: 'Принт на груди. 32х28см',
    b: '- формат А3',
    c: '750 Р. х 1 шт',
    d: '— 750 Р.',
  },
  {
    a: 'Принт на спине. 32х28см',
    b: '- формат А3',
    c: '750 Р. х 1 шт',
    d: '— 750 Р.',
  },
];
function Cart() {
  const [size, setSize] = useState('');
  return (
    <>
      <h1 className={styles.pageTitle}>КОРЗИНА / CART</h1>
      <div className={styles.products}>
        <div className={styles.productsImage}>
          <img
            className={styles.productsImage_test}
            src={testImage}
            alt="Фото товара"
          />
        </div>
        <div className={styles.productsInfo}>
          <p className={styles.productsInfo_name}>Футболка CLASSIC черная</p>
          <p className={styles.productsInfo_count}>900 Р. Х 1 шт.</p>
          <p className={styles.productsInfo_sum}>— 900 Р.</p>
          <p className={styles.ttt2}>Изменить&nbsp;размер</p>
          <p className={styles.productsInfo_text}>
            Универсальный солдат. Унисекс футболка прямого кроя с широким
            размерным рядом. Подойдет, как для мужчин, так и для женщин.
          </p>
          <div className={styles.ttt}>
            {testSizeObject.length > 0 ? (
              testSizeObject.map((item) => (
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
          {testPrewievObject.length > 0 ? (
            testPrewievObject.map((item, index) => (
              <div
                className={
                  index != 4 ? `${styles.productsPrint_prewiev} ${styles.productsPrint_prewiev_border}` : `${styles.productsPrint_prewiev}`
                }
              >
                <img
                  className={styles.productsPrint_prewievImg}
                  src={testImagePrew}
                  alt="Превью принта"
                />
                <span className={styles.productsPrint_prewievPrice}>
                  <p>{item.a}</p>
                  <p className={styles.productsPrint_prewievPrice_right}>
                    {item.b}
                  </p>
                  <p className={styles.productsPrint_prewievPrice_down}>
                    {item.c}
                  </p>
                  <p className={styles.productsPrint_prewievPrice_right}>
                    {item.d}
                  </p>
                </span>
                <div className={styles.productsPrint_buttons}>
                  <span className={styles.productsPrint_button}>Удалить</span>
                  &nbsp;/&nbsp;
                  <span type="button" className={styles.productsPrint_button}>
                    Изменить
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>Нет в наличии</p>
          )}
          {testPrewievObject.length < 4 && (
            <div className={styles.addPrintButton_wrap}>
              <p>Добавить принт &gt;</p>
            </div>
          )}
        </div>
        <div className={styles.productsBottom}>
          <span className={styles.productsBottom_button_wrap}>
            <p className={styles.productsBottom_button}>Удалить&nbsp;товар</p>
          </span>
          <div className={styles.productsBottom_price}>
            <p>Текстиль: 900&nbsp;Р.</p>
            <p className={styles.productsBottom_pricePrint}>
              Печать: 3000&nbsp;Р.
            </p>
            <p className={styles.productsBottom_priceAll}>
              Подытог: 3900&nbsp;Р.
            </p>
          </div>
        </div>
      </div>
      {/*  */}
      <div className={styles.products}>
        <div className={styles.productsImage}>
          <img
            className={styles.productsImage_test}
            src={testImage}
            alt="Фото товара"
          />
        </div>
        <div className={styles.productsInfo}>
          <p className={styles.productsInfo_name}>Футболка CLASSIC черная</p>
          <p className={styles.productsInfo_count}>900 Р. Х 1 шт.</p>
          <p className={styles.productsInfo_sum}>— 900 Р.</p>
          <p className={styles.productsInfo_text}>
            Универсальный солдат. Унисекс футболка прямого кроя с широким
            размерным рядом. Подойдет, как для мужчин, так и для женщин.
          </p>
          <div className={styles.ttt}>
            {testSizeObject.length > 0 ? (
              testSizeObject.map((item) => (
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
          {testPrewievObject2.length > 0 ? (
            testPrewievObject2.map((item, index) => (
              <div
                className={
                  index != 4 ? `${styles.productsPrint_prewiev} ${styles.productsPrint_prewiev_border}` : `${styles.productsPrint_prewiev}`
                }
              >
                <img src={testImagePrew} alt="Превью принта" />
                <span className={styles.productsPrint_prewievPrice}>
                  <p>{item.a}</p>
                  <p className={styles.productsPrint_prewievPrice_right}>
                    {item.b}
                  </p>
                  <p>{item.c}</p>
                  <p className={styles.productsPrint_prewievPrice_right}>
                    {item.d}
                  </p>
                </span>
                <div className={styles.productsPrint_buttons}>
                  <span className={styles.productsPrint_button}>Удалить</span>
                  &nbsp;/&nbsp;
                  <span type="button" className={styles.productsPrint_button}>
                    Изменить
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>Принты не выбраны</p>
          )}
          {testPrewievObject2.length < 4 && (
            <div className={styles.addPrintButton_wrap}>
              <p>Добавить принт &gt;</p>
            </div>
          )}
        </div>
        <div className={styles.productsBottom}>
          <span className={styles.productsBottom_button_wrap}>
            <p className={styles.productsBottom_button}>Удалить товар</p>
          </span>
          <div className={styles.productsBottom_price}>
            <p>Текстиль: 900 Р.</p>
            <p className={styles.productsBottom_pricePrint}>Печать: 3000 Р.</p>
            <p className={styles.productsBottom_priceAll}>Подытог: 3900 Р.</p>
          </div>
        </div>
      </div>
      <div className={styles.products}>
        <div className={styles.productsImage}>
          <img
            className={styles.productsImage_test}
            src={testImage}
            alt="Фото товара"
          />
        </div>
        <div className={styles.productsInfo}>
          <p className={styles.productsInfo_name}>Футболка CLASSIC черная</p>
          <p className={styles.productsInfo_count}>900 Р. Х 1 шт.</p>
          <p className={styles.productsInfo_sum}>— 900 Р.</p>
          <p className={styles.productsInfo_text}>
            Универсальный солдат. Унисекс футболка прямого кроя с широким
            размерным рядом. Подойдет, как для мужчин, так и для женщин.
          </p>
          <div className={styles.ttt}>
            {testSizeObject.length > 0 ? (
              testSizeObject.map((item) => (
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
              <option>Принты не выбраны</option>
            )}
          </div>
        </div>
        <div className={styles.productsPrint}>
          {testPrewievObject3.length > 0 ? (
            testPrewievObject3.map((item, index) => (
              <div
                className={
                  index != 4 ? `${styles.productsPrint_prewiev} ${styles.productsPrint_prewiev_border}` : `${styles.productsPrint_prewiev}`
                }
              >
                <img src={testImagePrew} alt="Превью принта" />
                <span className={styles.productsPrint_prewievPrice}>
                  <p>{item.a}</p>
                  <p className={styles.productsPrint_prewievPrice_right}>
                    {item.b}
                  </p>
                  <p>{item.c}</p>
                  <p className={styles.productsPrint_prewievPrice_right}>
                    {item.d}
                  </p>
                </span>
                <div className={styles.productsPrint_buttons}>
                  <span className={styles.productsPrint_button}>Удалить</span>
                  &nbsp;/&nbsp;
                  <span type="button" className={styles.productsPrint_button}>
                    Изменить
                  </span>
                </div>
              </div>
            ))
          ) : (
            <p>Принты не выбраны</p>
          )}
          {testPrewievObject3.length < 4 && (
            <div className={styles.addPrintButton_wrap}>
              <p>Добавить принт &gt;</p>
            </div>
          )}
        </div>
        <div className={styles.productsBottom}>
          <span className={styles.productsBottom_button_wrap}>
            <p className={styles.productsBottom_button}>Удалить товар</p>
          </span>
          <div className={styles.productsBottom_price}>
            <p>Текстиль: 900 Р.</p>
            <p className={styles.productsBottom_pricePrint}>Печать: 3000 Р.</p>
            <p className={styles.productsBottom_priceAll}>Подытог: 3900 Р.</p>
          </div>
        </div>
      </div>
      {/*  */}
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
        <p className={styles.paymentPrice}>Итого на сумму: 7200 Р.</p>
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
    </>
  );
}

export default Cart;
