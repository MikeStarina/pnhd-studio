import React from 'react';
import { useDispatch } from 'react-redux';
import { DELETE_PRINT_FROM_CART } from '../../services/actions/cart-actions';
import styles from './item-print.module.css';

function ItemPrint({
  print, title, qty, params, print_id, item_id,
}) {
  const dispatch = useDispatch();

  const deletePrintFromCart = (e) => {
    dispatch({
      type: DELETE_PRINT_FROM_CART,
      item_id: e.target.id,
      print_id: e.target.name,
    });
  };

  return (
    <div className={styles.textile_description}>
      <button
        type="button"
        className={styles.delete_print_from_cart}
        id={item_id}
        name={print_id}
        onClick={deletePrintFromCart}
      >
        x
      </button>
      <div className={styles.desc_box}>
        <img src={print} alt="print pic" className={styles.item_img} />
        <div className={styles.text_wrapper}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>
            Размер:
            {params.cartParams && params.cartParams.size}
          </p>
          <p className={styles.description}>
            Формат:
            {params.cartParams && params.cartParams.format}
          </p>
          <p className={styles.description}>
            Количество:
            {qty}
          </p>
        </div>
      </div>

      <p className={styles.price}>
        =
        {params.cartParams && params.cartParams.price * qty}
        {' '}
        P.
      </p>
    </div>
  );
}

export default ItemPrint;
