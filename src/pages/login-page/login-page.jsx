import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './login-page.module.css';
import {
  GET_USER_LOGIN_DATA,
  loginFunc,
} from '../../services/actions/user-data-actions';

function LoginPage() {
  const dispatch = useDispatch();
  const { userLoginData } = useSelector((store) => store.userData);

  const onChange = (e) => {
    e.preventDefault();

    const login = e.target.name === 'email' ? e.target.value : userLoginData.login;
    const password = e.target.name === 'password'
      ? e.target.value
      : userLoginData.password;

    dispatch({
      type: GET_USER_LOGIN_DATA,
      login,
      password,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    dispatch(loginFunc(userLoginData));
  };

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>LOGIN @PNHD</h1>

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
          value={userLoginData.login}
          onChange={onChange}
          required
        />
        <label className={styles.input_label} htmlFor="password">
          Пароль:
        </label>
        <input
          type="password"
          className={styles.input}
          id="password"
          name="password"
          placeholder="**********"
          value={userLoginData.password}
          onChange={onChange}
          required
        />

        <button type="submit" className={styles.submit_button}>
          ВОЙТИ
        </button>
      </form>
      <Link to="/forgot" className={styles.link}>
        Я не помню свой пароль
      </Link>
      <Link to="/register" className={styles.link}>
        Создать аккаунт
      </Link>
    </section>
  );
}

export default LoginPage;
