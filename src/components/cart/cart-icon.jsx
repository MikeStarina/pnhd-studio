import React from 'react';
import { Link } from 'react-router-dom';
import styles from './cart-icon.module.css';

function CartIcon({ qty }) {
  return (
    <div className={styles.cart_wrapper}>
      <Link to="/cart" className={styles.link}>
        <div className={styles.counter_wrapper}>
          <p className={styles.counter}>{qty}</p>
        </div>
      </Link>
    </div>
  );
}

export default CartIcon;
