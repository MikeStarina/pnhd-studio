import React from "react";
import styles from './form-screen.module.css';


const FormScreen = () => {
    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>ЗАКАЗАТЬ</h4>
            <form className={styles.form}>
                <label htmlFor='email' className={styles.form_input_label}>MAIL</label>
                <input type="text" name='email' id='email' className={styles.form_input}/>
                <label htmlFor='name' className={styles.form_input_label}>ИМЯ</label>
                <input type="text" name='name' id='name' className={styles.form_input}/>
                <label htmlFor='phone' className={styles.form_input_label}>PHONE</label>
                <input type="text" name='phone' id='phone' className={styles.form_input}/>


                <button type='submit' className={styles.form_submit_button}>ЗАКАЗАТЬ</button>

            </form>
        </section>
    );

}

export default FormScreen;