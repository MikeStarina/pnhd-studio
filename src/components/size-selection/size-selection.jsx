import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './size-selection.module.css';
import { updateItemOrder } from '../../services/actions/item-action';
import { CHANGE_ITEM_QTY } from '../../services/actions/cart-actions';

function SizeSelection({
  name, qty, id, type,
}) {
  const { order } = useSelector((store) => store.itemReducer);
  const dispatch = useDispatch();
  const [state, setState] = useState(qty);

  const onChangePlus = (name) => {
    setState((state) => state + 1);
    if (type === 'shop') {
      dispatch(
        updateItemOrder({
          name,
          qty: state + 1,
        }),
      );
    } else {
      dispatch({
        type: CHANGE_ITEM_QTY,
        qty: state + 1,
        id,
        name,
      });
    }
  };

  const onChangeMinus = (name) => {
    setState((state) => state - 1);
    if (type === 'shop') {
      dispatch(
        updateItemOrder({
          name,
          qty: state - 1,
        }),
      );
    } else {
      dispatch({
        type: CHANGE_ITEM_QTY,
        qty: state - 1,
        id,
        name,
      });
    }
  };

  return (
    <div className={styles.block}>
      <p className={styles.text}>
        <span className={styles.span_size}>{name}</span>
        <span className={styles.span_x}>x</span>
      </p>
      <p className={styles.text_size}>{type === 'shop' ? state : qty}</p>

      <button
        className={styles.button_size}
        onClick={() => onChangeMinus(name)}
        type="button"
        disabled={state === 0}
      >
        <div className={styles.minus} />
      </button>
      <button
        className={styles.button_size}
        onClick={() => onChangePlus(name)}
        type="button"
      >
        <div className={styles.minus} />
        <div className={styles.plus} />
      </button>
    </div>
  );
}

export default SizeSelection;
