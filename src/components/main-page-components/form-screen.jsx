import React from "react";
import styles from './form-screen.module.css';


const FormScreen = () => {

    const onSubmit = (e) => {
        e.preventDefault()
    }


    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>ЗАКАЗАТЬ</h4>
            <form className={styles.form} onSubmit={onSubmit}>
                <label htmlFor='email' className={styles.form_input_label}>MAIL</label>
                <input type="email" name='email' id='email' placeholder="666@whitehouse.gov" className={styles.form_input} required/>
                <label htmlFor='name' className={styles.form_input_label}>ИМЯ</label>
                <input type="text" name='name' id='name' placeholder='MAD IVAN' className={styles.form_input} required/>
                <label htmlFor='phone' className={styles.form_input_label}>PHONE</label>
                <input type="text" name='phone' id='phone' placeholder="+7 (666) 666-66-66" className={styles.form_input} required/>
                <label htmlFor='comment' className={styles.form_input_label}>СООБЩЕНИЕ</label>
                <textarea name='comment' id='comment' rows='5' placeholder="type something..." className={styles.form_input_textarea}/>
                


                <button type='submit' className={styles.form_submit_button}>ЗАКАЗАТЬ</button>

            </form>
        </section>
    );

}

export default FormScreen;