import React, { useState, useEffect } from 'react';
import { Link, useHistory, useLocation, useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import styles from './ProductContent.module.css';
import SizeSelection from '../size-selection/size-selection';
import Button from '../../ui/Button/Button';
import { addItemSize, deleteItemOrder } from '../../services/actions/item-action';
import { openPopup } from '../../services/actions/utility-actions';
import isSizeFunction from '../../utils/isSizeFunction';
import { ADD_TO_CART } from '../../services/actions/cart-actions';

function ProductContent(item) {
  const { id } = useParams();
  const dispatch = useDispatch();
  const { order } = useSelector((store) => store.itemReducer);
  const history = useHistory();
  const [size, setSize] = useState('');

  useEffect(() => {
    item.sizes?.map((el, i) => {
      dispatch(
        addItemSize({
          name: el.name,
          qty: 0,
          _id: item._id + i,
        }),
      );
    });

    return () => {
      dispatch(deleteItemOrder());
    };
  }, [item]);

  useEffect(() => {
    if (item) {
      window.dataLayer.push({
        ecommerce: {
          currencyCode: 'RUB',
          detail: {
            products: [
              {
                id: item._id,
                name: item.name,
                price: item.price,
                category: item.category,
              },
            ],
          },
        },
      });
    }
  }, [item]);

  const addToConstructor = () => {
    dispatch(openPopup(['Нужно выбрать размер']));
  };

  const addToCart = () => {
    if (isSizeFunction(order)) {
      window.dataLayer.push({
        ecommerce: {
          currencyCode: 'RUB',
          add: {
            products: [
              {
                id: item._id,
                name: item.name,
                price: item.price,
                size: order,
                category: item.category,
                variant: 'без принта',
              },
            ],
          },
        },
      });

      const data = {
        attributes: { ...item },
        cart_item_id: uuidv4(),
      };
      data.attributes.size = order;
      data.attributes.key = uuidv4();

      dispatch({
        type: ADD_TO_CART,
        payload: { ...data },
      });

      history.goBack();
    } else {
      dispatch(openPopup(['Нужно выбрать размер']));
    }
  };

  return (
    <div className={styles.product_box}>
      <div className={styles.description}>
        <div className={styles.title_box}>
          <h1 className={styles.title}>{item.name}</h1>
          <p className={styles.text}>&#8213; {item.price} P.</p>
        </div>
        <p className={styles.text}>
          Универсальный солдат. Унисекс футболка прямого кроя с широким размерным рядом. Подойдет,
          как для мужчин, так и для женщин.
        </p>
        <ul className={styles.box_link}>
          <li className={styles.menu_elem}>
            <Link to="/size_chart" className={styles.menu_link} target="blank">
              Гид по размерам
            </Link>
          </li>
          <span>/</span>
          <li className={styles.menu_elem}>
            <Link to="/shop" className={styles.menu_link} target="blank">
              Гид по уходу
            </Link>
          </li>
        </ul>
        <label className={styles.select_label} htmfor="sizeSelect">
          Выберите размер:
        </label>
        {order.length > 0 ? (
          order.map((item) => (
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
        {item.isForPrinting &&
          !item.isSale &&
          item.sizes.length > 0 &&
          (isSizeFunction(order) ? (
            <Link
              to={{
                pathname: `/shop/${id}/constructor`,
                state: { size: order },
              }}
            >
              <Button type="button" className={styles.button_up}>
                Добавить принт &gt;
              </Button>
            </Link>
          ) : (
            <Button onClickTo={addToConstructor} className={styles.button_up}>
              Добавить принт &gt;
            </Button>
          ))}
        <Button onClickTo={addToCart} className={styles.button_down}>
          В корзину &gt;
        </Button>
      </div>
    </div>
  );
}

export default ProductContent;
