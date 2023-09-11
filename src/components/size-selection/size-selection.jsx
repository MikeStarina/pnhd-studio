import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import styles from './size-selection.module.css';
import { updateItemOrder } from '../../services/actions/item-action';
import { CHANGE_ITEM_QTY, CHANGE_ITEM_SIZES } from '../../services/actions/cart-actions';

function SizeSelection({ name, qty, id, type, remain }) {
  // console.log(a);
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
    } else if (type === 'cart') {
      dispatch({
        type: CHANGE_ITEM_SIZES,
        qty: state + 1,
        id,
        name,
      });
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
    } else if (type === 'cart') {
      dispatch({
        type: CHANGE_ITEM_SIZES,
        qty: state - 1,
        id,
        name,
      });
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
    <div className={styles.block_wrap}>
      <div className={`${styles.block} ${remain <= 0 ? `${styles.block_disable}` : ''}`}>
        <p className={styles.text}>
          <span className={styles.span_size}>{name}</span>
        </p>
        <span className={styles.span_x}>x</span>
        <p className={styles.text_size}>{type === 'shop' ? state : qty}</p>

        <button
        className={`${styles.button_size}  ${remain <= 0 ? `${styles.block_disable}` : ''}`}
        onClick={() => onChangeMinus(name)}
        type="button"
        disabled={state === 0}
        >
          &lt;
        </button>
        <button className={`${styles.button_size} ${remain <= 0 ? `${styles.block_disable}` : ''}`} onClick={() => onChangePlus(name)} type="button" disabled={state === (remain < 0 ? 0 : remain)}>
          &gt;
        </button>
      </div>
      <div className={`${styles.product_remain} ${remain > 5 ? `${styles.product_remain_many}` : (remain <= 5 && remain > 0) ? `${styles.product_remain_litle}` : `${styles.product_remain_nope}`}`}>
        <p>&bull; {remain < 0 ? 0 : remain} шт</p>
      </div>
    </div>
  );
}

export default SizeSelection;
