import React from 'react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './forgot-password.module.css';
import {
  SET_FORGOT_PASSWORD_DATA,
  forgotPasswordRequest,
} from '../../services/actions/user-data-actions';

function ForgotPassword() {
  const dispatch = useDispatch();
  const { forgotPasswordData } = useSelector((store) => store.userData);

  const onChange = (e) => {
    e.preventDefault();

    const email = e.target.value;

    dispatch({
      type: SET_FORGOT_PASSWORD_DATA,
      email,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    dispatch(forgotPasswordRequest(forgotPasswordData));
  };

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>RESET PSWD / 1</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.input_label} htmlFor="email">
          Имя пользователя:
        </label>
        <input
          type="email"
          className={styles.input}
          id="email"
          name="email"
          placeholder="name@pnhd.ru"
          value={forgotPasswordData}
          onChange={onChange}
          required
        />

        <button type="submit" className={styles.submit_button}>
          ВОССТАНОВИТЬ
        </button>
      </form>
      <Link to="/login" className={styles.link}>
        Я вспомнил свой пароль
      </Link>
    </section>
  );
}

export default ForgotPassword;
