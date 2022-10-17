import React from "react";
import styles from './form-screen.module.css';
import { GET_ORDER_FORM_DATA } from "../../services/actions/utility-actions";
import { useDispatch, useSelector } from "react-redux";


const FormScreen = () => {

    const { isFormDataSet } = useSelector(store => store.utilityState);
    const dispatch = useDispatch();

    const onSubmit = (e) => {
        e.preventDefault()
        const data = new FormData(e.target);
        const name = data.get('name');
        const email = data.get('email');
        const phone = data.get('phone');
        const message = data.get('comment') ? data.get('comment') : '';
        dispatch({
            type: GET_ORDER_FORM_DATA,
            name: name,
            email: email,
            phone: phone,
            message: message,
        })

        isFormDataSet && e.target.reset();
    }


    return (
        <section className={styles.screen}>
            <h4 className={styles.heading} id='order_form_heading'>ЗАКАЗАТЬ</h4>
            <form className={styles.form} onSubmit={onSubmit}>
                <label htmlFor='email' className={styles.form_input_label}>MAIL</label>
                <input type="email" name='email' id='email' placeholder="666@whitehouse.gov" className={styles.form_input} required/>
                <label htmlFor='name' className={styles.form_input_label}>ИМЯ</label>
                <input type="text" name='name' id='name' placeholder='MAD IVAN' className={styles.form_input} required/>
                <label htmlFor='phone' className={styles.form_input_label}>PHONE</label>
                <input type="text" name='phone' id='phone' placeholder="+7 (666) 666-66-66" className={styles.form_input} required/>
                <label htmlFor='comment' className={styles.form_input_label}>СООБЩЕНИЕ</label>
                <textarea rows={'5'} name='comment' id='comment' className={styles.form_input_textarea}></textarea>
                


                <button type='submit' className={styles.form_submit_button}>ЗАКАЗАТЬ</button>

            </form>
        </section>
    );

}

export default FormScreen;