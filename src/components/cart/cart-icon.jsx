import React from "react";
import styles from './cart-icon.module.css';
import { Link } from "react-router-dom";
//import cartIcon from '../images/cartIcon.svg';
//import { useSelector } from "react-redux";





const CartIcon = ({ qty }) => {


    

    return (
        <div className={styles.cart_wrapper}>
            <Link to='/checkout' className={styles.link}>
                 
                <p className={styles.counter}>{qty}</p>
            </Link>
        </div>
    )
}

export default CartIcon;

//<img src={cartIcon} alt='cart icon' className={styles.cart_icon}></img>