import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './popupCallBack.module.css';
import {
  closePopupHeader,
  GET_ORDER_FORM_DATA,
  sendLeadFormData,
  // SET_POPUP_VISIBILITY,
} from '../../services/actions/utility-actions';

function PopupCallBack() {
  const dispatch = useDispatch();
  const { orderFormData, message } = useSelector((store) => store.utilityState);
  const [isMessageSent, setIsMessageSent] = useState(false);

  const formSubmitHandler = async (e) => {
    e.preventDefault();
    dispatch(sendLeadFormData(orderFormData.name, orderFormData.phone));
  };

  // const openPopup = () => {
  //   dispatch({
  //     type: SET_POPUP_VISIBILITY,
  //   });
  // };

  useEffect(() => {
    let timer;
    if (message === 'Заявка отправлена') {
      setIsMessageSent(true);
      timer = setTimeout(() => {
        setIsMessageSent(false);
        dispatch({ type: GET_ORDER_FORM_DATA });
        dispatch(closePopupHeader());
      }, 3000);
    }
    return () => clearTimeout(timer);
  }, [message]);

  const formOnchangeHandler = (e) => {
    dispatch({
      type: GET_ORDER_FORM_DATA,
      field: e.target.id,
      data: e.target.value,
    });
  };

  const visual = !message ? styles.visibility : '';

  return (
    <form className={styles.form} onSubmit={formSubmitHandler}>
      {!isMessageSent && (
        <>
          <h1 className={styles.title}>ПЕРЕЗВОНИТЬ?</h1>
          <p className={styles.description}>
            Мы с радостью! Проконсультируем уже через 10 минут, просто оставь
            номер телефона!
          </p>
          <label className={styles.input_label} htmlFor="name">
            Ваше имя:
            <input
              className={styles.input}
              type="text"
              name="name"
              id="name"
              value={orderFormData.name}
              onChange={formOnchangeHandler}
            />
          </label>
          <label className={styles.input_label} htmlFor="phone">
            Ваше телефон:
            <input
              className={styles.input}
              type="text"
              name="phone"
              id="phone"
              value={orderFormData.phone}
              onChange={formOnchangeHandler}
            />
          </label>
        </>
      )}
      <label
        className={`${styles.input_label} ${styles.input_label_center} ${visual}`}
        htmlFor="message"
      >
        {message}
      </label>
      {!isMessageSent && (
        <button type="submit" className={styles.submit_button}>
          Отправить
        </button>
      )}
    </form>
  );
}

export default PopupCallBack;
