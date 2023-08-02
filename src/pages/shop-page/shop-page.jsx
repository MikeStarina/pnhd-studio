import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import { SET_FILTER } from '../../services/actions/shop-data-actions';
import {
  CLOSE_MODAL_MENU,
  closePopup,
} from '../../services/actions/utility-actions.jsx';
import styles from './shop-page.module.css';
import CardsBlock from '../../components/shop-page-components/cards-block.jsx';
import PopupModel from '../../components/popupModel/popupModel';


const ShopPage = () => {
  const dispatch = useDispatch();
  const { filter } = useSelector((store) => store.shopData);
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const { search } = useLocation();
  const history = useHistory();
  const searchValue = search.slice(3);

  const filterHandler = (e) => {
    if (e.target.value) {
      dispatch({
        type: SET_FILTER,
        payload: e.target.value,
      });
      history.push(`/shop?s=${e.target.value}`);
    } else {
      dispatch({
        type: SET_FILTER,
        payload: e.target.value,
      });
      history.push(`/shop`);
    }
  };

  const handelClosePopup = () => {
    dispatch(closePopup());
  };

  useEffect(() => {
    dispatch({
      type: SET_FILTER,
      payload: searchValue,
    });
  }, [dispatch]);

  useEffect(() => {
    dispatch({
      type: CLOSE_MODAL_MENU,
    });
  }, []);

  return (
    <main className={styles.main_screen}>
      <Helmet
        title="Онлайн конструктор для печати футболок и толстовок в Санкт-Петербурге в PINHEAD STUDIO"
        discription="Создай дизайн своей футболки онлайн с помощью конструктора! Конструктор для печати на футболках, толстовках и другой одежде в Санкт-Петербурге от PINHEAD STUDIO."
        meta={[
          {
            name: 'description',
            content:
              'Создай дизайн своей футболки онлайн с помощью конструктора! Конструктор для печати на футболках, толстовках и другой одежде в Санкт-Петербурге от PINHEAD STUDIO.',
          },
          {
            property: 'og:image',
            content:
              'https://sun9-77.userapi.com/impg/r3SRF7rtra4wl-3EmEgVqIRaaGNbjeO6q9ufUw/-yeDgKpu2CQ.jpg?size=500x500&quality=95&sign=d7fc90ef8c432358c10c8b1e16b4945f&type=album',
          },
          {
            property: 'og:title',
            content:
              'PINHEAD STUDIO | Печать на футболках и толстовках | Магазин и конструктор',
          },
          {
            property: 'og:url',
            content: 'https://studio.pnhd.ru/',
          },
          {
            property: 'og:type',
            content: 'website',
          },
        ]}
        script={[
          {
            type: 'application/ld+json',
            innerHTML: `{
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            'address': {
                                '@type': 'PostalAddress',
                                'addressLocality': 'Санкт-Петербург',
                                'postalCode': '197022',
                                'streetAddress': 'ул. Чапыгина 1',
                            },
                            'email': 'studio@pnhd.ru',
                            'name': 'PINHEAD',
                            'telephone': '+78129046156',
                        }`,
          },
        ]}
      />
      <div className={styles.filter_wrapper}>
        <button
          type="button"
          className={filter === 'man' ? styles.filter_active : styles.filter}
          value="man"
          onClick={filterHandler}
        >
          МУЖСКОЕ
        </button>
        <button
          type="button"
          className={filter === 'woman' ? styles.filter_active : styles.filter}
          value="woman"
          onClick={filterHandler}
        >
          ЖЕНСКОЕ
        </button>
        <button
          type="button"
          className={filter === 'kids' ? styles.filter_active : styles.filter}
          value="kids"
          onClick={filterHandler}
        >
          ДЕТСКОЕ
        </button>
        <button
          type="button"
          className={
            filter === 'accesorize' ? styles.filter_active : styles.filter
          }
          value="accesorize"
          onClick={filterHandler}
        >
          АКСЕССУАРЫ
        </button>
        <button
          type="button"
          className={
            filter === 'friends' ? styles.filter_active : styles.filter
          }
          value="friends"
          onClick={filterHandler}
        >
          PNHD&nbsp;&&nbsp;FRIENDS
        </button>
        <button
          type="button"
          className={styles.filter}
          value=""
          onClick={filterHandler}
        >
          СБРОСИТЬ
        </button>
      </div>
      <CardsBlock />
      {isOtherPopupVisible && (
        <PopupModel onClose={handelClosePopup}>
          {isOtherPopupVisible.map((el, index) => (
            <p className={`${styles.validation_message}`} key={index}>
              {el}
            </p>
          ))}
        </PopupModel>
      )}
    </main>
  );
};

export default ShopPage;
