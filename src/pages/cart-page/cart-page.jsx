import React, { useEffect } from "react";
import styles from './cart-page.module.css';
import { useSelector, useDispatch } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { CHANGE_ITEM_QTY, SET_CART_VISIBILITY } from "../../services/actions/cart-actions";
import ItemPrint from "../../components/cart-page-components/item-print";
import closeicon from '../../components/images/closeIcon.svg';




const CartPage = () => {


    const history = useHistory()
    const { order } = useSelector(store => store.cartData);
    console.log(order);
    const dispatch = useDispatch();


    const totalPrice = order.reduce((acc, item) => {
        return item.print ? acc = acc + item.attributes.price * item.attributes.qty + item.print.price  * item.attributes.qty : acc = acc + item.attributes.price * item.attributes.qty;
    }, 0)


    useEffect(() => {
        dispatch({
            type: SET_CART_VISIBILITY,
            payload: false,
        })

        return () => {dispatch({ type: SET_CART_VISIBILITY, payload: true })}
        
    }, [] )

    console.log(typeof order[0].print.front.cartParams.price);


    const onChange = (e) => {
        dispatch({
            type: CHANGE_ITEM_QTY,
            qty: e.target.value,
            id: e.target.id
        })
    }

    const close = () => {
        history.goBack();
    }


    

    return (
        <section className={styles.screen}>
            <img src={closeicon} alt='close icon' className={styles.close} onClick={close}></img>
           


            <ul className={styles.cart_container}>
                {order && order.map((item) => {
                    return (
                        
                            <li className={styles.cart_item} key={item.cart_item_id}>
                                <div className={styles.textile_description}>
                                    <div className={styles.desc_box}>
                                    
                                        <img src={item.attributes.image_url} alt='item pic' className={styles.item_img}></img>
                                        <div className={styles.text_wrapper}>
                                            <h3 className={styles.title}>{item.attributes.name} {!item.print && '(Без принта)'}</h3>
                                            <p className={styles.description}>Размер: {item.attributes.size}</p>
                                            <div className={styles.qty_input_wrapper}>

                                                <label htmfor={item.cart_item_id} className={styles.description}>Количество:</label>
                                                <input type='number' className={styles.qty_input} value={item.attributes.qty} id={item.cart_item_id} onChange={onChange}></input>
                                            
                                            </div>
                                          
                                               
                                            
                                        

                                        </div>
                                    </div>
                                    <p className={styles.price}>= {item.attributes.price * item.attributes.qty} P.</p>
                                </div>

                                {item.print.front.file && <ItemPrint print={item.print.front} qty={item.attributes.qty} title={'Принт на груди:'} />}
                                {item.print.back.file && <ItemPrint print={item.print.back} qty={item.attributes.qty} title={'Принт на спине:'} />}
                                {item.print.lsleeve.file && <ItemPrint print={item.print.lsleeve} qty={item.attributes.qty} title={'Принт на левом рукаве:'} />}
                                {item.print.rsleeve.file && <ItemPrint print={item.print.rsleeve} qty={item.attributes.qty} title={'Принт на правом рукаве:'} />}
                                {item.print.badge.file && <ItemPrint print={item.print.badge} qty={item.attributes.qty} title={'Бейдж-принт:'} />}
                                   

                                
                            
                            </li>
                    
                )}
                )}


               
            </ul>
            <div className={styles.cart_controls}>
                                            {order.length > 0 && <p className={styles.total_price}>Итого: = {totalPrice} P.</p>}    
                                            <button type='button' className={styles.control_button}>Очистить корзину</button>
                                            <button type='button' className={styles.control_button}>Оформить</button>
            </div>

           


        </section>
    );
}

export default CartPage;

/**
 *     {item.print && 
                                    <div className={styles.textile_description}>
                                       
                                        <div className={styles.desc_box}>
                                    
                                            <img src={item.print.print} alt='print pic' className={styles.item_img}></img>
                                                <div className={styles.text_wrapper}>
                                                    <h3 className={styles.title}>Принт формата: {item.print.format}</h3>
                                                    <p className={styles.description}>Размер: {item.print.size}</p>
                                                    <p className={styles.description}>Количество: {item.attributes.qty}</p>
                                                

                                                </div>
                                        </div>
                                       
                                            <p className={styles.price}>= {item.print.price * item.attributes.qty} P.</p>
                                            
                                       
                                       
                                    </div> 


                                   
                                }
 */