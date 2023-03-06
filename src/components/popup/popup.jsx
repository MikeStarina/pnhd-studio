import React, { useState } from "react";
import styles from './popup.module.css';
import { useSelector, useDispatch } from "react-redux";
import { GET_ORDER_FORM_DATA } from "../../services/actions/utility-actions";
import { sendLeadFormData } from "../../services/actions/utility-actions";






const Popup = ({ openPopup }) => {

    const dispatch = useDispatch()
    const { orderFormData } = useSelector(store => store.utilityState);
    const [ isMessageSent, setIsMessageSent ] = useState(false);



    const formSubmitHandler = async (e) => {
        e.preventDefault();
        dispatch(sendLeadFormData(orderFormData.name, orderFormData.phone));
        setIsMessageSent(true);
        await new Promise(resolve => setTimeout(resolve, 5000));
        openPopup();
        setIsMessageSent(false);
    }

    const formOnchangeHandler = (e) => {


        dispatch({
            type: GET_ORDER_FORM_DATA,
            field: e.target.id,
            data: e.target.value
        })
    }

    const closeByBGClick = (e) => {

        
        if (e.target.id === 'container') {
            openPopup();
        }
    }



    return (
        <div className={styles.popup_container} onClick={closeByBGClick} id='container'>
            <form className={styles.lead_form} onSubmit={formSubmitHandler}>
                <button type='button' className={styles.close_button} onClick={openPopup}>X</button>
                <h1 className={styles.title}>ПЕРЕЗВОНИТЬ?</h1>
                <p className={styles.description}>Мы с радостью! Проконсультируем уже через 10 минут, просто оставь номер телефона!</p>

                <label className={styles.input_label}>Ваше имя:</label>
                <input className={styles.input} type='text' name='name' id='name' value={orderFormData.name} onChange={formOnchangeHandler}></input>
                <label className={styles.input_label}>Ваше телефон:</label>
                <input className={styles.input} type='text' name='phone' id='phone' value={orderFormData.phone} onChange={formOnchangeHandler}></input>


                {!isMessageSent ? <button type='submit' className={styles.submit_button}>Отправить</button> : <label className={styles.input_label}>Сообщение отправлено!</label>}
            </form>
        </div>
    )
}

export default Popup;