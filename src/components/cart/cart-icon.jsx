import React from 'react';
import { Link } from 'react-router-dom';
import styles from './cart-icon.module.css';
// import cartIcon from '../images/cartIcon.svg';
// import { useSelector } from "react-redux";

function CartIcon({ qty }) {
  return (
    <div className={styles.cart_wrapper}>
      <Link to="/checkout" className={styles.link}>
        <div className={styles.counter_wrapper}>
          <p className={styles.counter}>{qty}</p>
        </div>
      </Link>
    </div>
  );
}

export default CartIcon;

// <img src={cartIcon} alt='cart icon' className={styles.cart_icon}></img>
