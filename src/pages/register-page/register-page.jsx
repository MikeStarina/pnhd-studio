import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import styles from './register-page.module.css';
import {
  SET_NEW_USER_DATA,
  createNewUser,
} from '../../services/actions/user-data-actions';

function RegisterPage() {
  const dispatch = useDispatch();
  const { registerFormData } = useSelector((store) => store.userData);

  const onChange = (e) => {
    e.preventDefault();

    const userName = e.target.name === 'name' ? e.target.value : registerFormData.name;
    const email = e.target.name === 'email' ? e.target.value : registerFormData.email;
    const password = e.target.name === 'password' ? e.target.value : registerFormData.password;

    dispatch({
      type: SET_NEW_USER_DATA,
      name: userName,
      email,
      password,
    });
  };

  const onSubmit = (e) => {
    e.preventDefault();

    dispatch(createNewUser(registerFormData));
  };

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>РЕГИСТРАЦИЯ @PNHD</h1>

      <form className={styles.form} onSubmit={onSubmit}>
        <label className={styles.input_label} htmlFor="email">
          Ваше имя:
        </label>
        <input
          type="text"
          className={styles.input}
          id="name"
          name="name"
          placeholder="Boris"
          value={registerFormData.name}
          onChange={onChange}
          required
          minLength={3}
        />
        <label className={styles.input_label} htmlFor="email">
          email:
        </label>
        <input
          type="email"
          className={styles.input}
          id="email"
          name="email"
          placeholder="boris@pnhd.ru"
          value={registerFormData.email}
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
          value={registerFormData.password}
          onChange={onChange}
          required
          minLength={6}
        />

        <button type="submit" className={styles.submit_button}>
          РЕГИСТРАЦИЯ
        </button>
      </form>
      <Link to="/login" className={styles.link}>
        Есть аккаунт? Войти
      </Link>
    </section>
  );
}

export default RegisterPage;
