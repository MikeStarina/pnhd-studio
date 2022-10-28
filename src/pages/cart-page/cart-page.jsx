import React, { useEffect } from "react";
import styles from './cart-page.module.css';
import { useSelector, useDispatch } from "react-redux";
import { useHistory, Link } from "react-router-dom";
import { CHANGE_ITEM_QTY, CLEAR_CART, proceedToPayment, SET_CART_VISIBILITY } from "../../services/actions/cart-actions";
import { createOrder } from "../../services/actions/cart-actions";
import ItemPrint from "../../components/cart-page-components/item-print";
import closeicon from '../../components/images/closeIcon.svg';




const CartPage = () => {


    const history = useHistory()
    const { order } = useSelector(store => store.cartData);
    //console.log(order);
    const dispatch = useDispatch();


    const totalPrice = order.reduce((acc, item) => {
        let printTotalprice = 0;
        //console.log(item.print)
        //console.log(item.print.back)
        const frontPrintPrice = item.print && item.print.front.file ? item.print.front.cartParams.price : 0;
        const backPrintPrice = item.print && item.print.back.file ? item.print.back.cartParams.price : 0;
        const lsleevePrintPrice = item.print && item.print.lsleeve.file ? item.print.lsleeve.cartParams.price : 0;
        const rsleevePrintPrice = item.print && item.print.rsleeve.file ? item.print.rsleeve.cartParams.price : 0;
        const badgePrintPrice = item.print && item.print.badge.file ? item.print.badge.cartParams.price : 0;
       
        printTotalprice = frontPrintPrice + backPrintPrice + lsleevePrintPrice + rsleevePrintPrice + badgePrintPrice;
       

        acc = acc + item.attributes.price * item.attributes.qty + printTotalprice * item.attributes.qty;
        


        return  acc;
    }, 0)




    useEffect(() => {
        dispatch({
            type: SET_CART_VISIBILITY,
            payload: false,
        })

        return () => {dispatch({ type: SET_CART_VISIBILITY, payload: true })}
        
    }, [] )

    //console.log(typeof order[0].print.front.cartParams.price);


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

    const createOrderHandler = () => {
        dispatch(createOrder(order, totalPrice));
    }


    const clearCartHandler = () => {
        dispatch({ type: CLEAR_CART });
    };


    

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

                                {item.print && item.print.front.file && <ItemPrint print={item.print.front_preview.preview} params={item.print.front} qty={item.attributes.qty} title={'Принт на груди:'} />}
                                {item.print && item.print.back.file && <ItemPrint print={item.print.back_preview.preview} params={item.print.back} qty={item.attributes.qty} title={'Принт на спине:'} />}
                                {item.print && item.print.lsleeve.file && <ItemPrint print={item.print.lsleeve_preview.preview} params={item.print.lsleeve} qty={item.attributes.qty} title={'Принт на левом рукаве:'} />}
                                {item.print && item.print.rsleeve.file && <ItemPrint print={item.print.rsleeve_preview.preview} params={item.print.rsleeve} qty={item.attributes.qty} title={'Принт на правом рукаве:'} />}
                                
                                   

                                
                            
                            </li>
                    
                )}
                )}


               
            </ul>
            <div className={styles.cart_controls}>
                                            {order.length > 0 && <p className={styles.total_price}>Итого: = {totalPrice} P.</p>}    
                                            <button type='button' className={styles.control_button} onClick={clearCartHandler}>Очистить корзину</button>
                                            <button type='button' className={styles.control_button} onClick={createOrderHandler}>Оформить</button>
            </div>

           


        </section>
    );
}

export default CartPage;
