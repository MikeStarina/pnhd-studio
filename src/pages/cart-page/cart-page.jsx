import React from "react";
import styles from './cart-page.module.css';
import { useSelector, useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import closeicon from '../../components/images/closeIcon.svg'




const CartPage = () => {

    const history = useHistory()
    const { order } = useSelector(store => store.cartData);
    const dispatch = useDispatch();

    const onClick = () => {
        history.goBack();
    }

    console.log(order);

    return (
        <section className={styles.screen}>
            <img src={closeicon} alt='close icon' onClick={onClick} className={styles.close}></img>


            <ul className={styles.cart_container}>
                {order && order.map((item) => {
                    return (
                        
                            <li className={styles.cart_item} key={item.id}>
                                <img src={item.attributes.image_url} alt='item pic' className={styles.item_img}></img>

                                <h3 className={styles.title}>{item.attributes.name}</h3>
                                <p className={styles.price}>{item.attributes.price}</p>
                            </li>
                    
                )}
                )}
               
            </ul>


        </section>
    );
}

export default CartPage;