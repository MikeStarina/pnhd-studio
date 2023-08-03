import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory, useLocation } from 'react-router-dom';
import {
  SET_DEFAULTFILTER,
  SET_FILTER,
  SET_FIRSTSELECT,
  SET_SECONDSELECT,
  SET_THIRDSELECT,
} from '../../services/actions/shop-data-actions';
import {
  CLOSE_MODAL_MENU,
  closePopup,
} from '../../services/actions/utility-actions.jsx';
import styles from './shop-page.module.css';
import CardsBlock from '../../components/shop-page-components/cards-block.jsx';
import PopupModel from '../../components/popupModel/popupModel';
import FilterSelect from '../../components/shop-page-components/filter-select';
import { getString } from '../../utils/utils';

function ShopPage() {
  const dispatch = useDispatch();
  const {
    firstFilterSelect,
    firstCount,
    firstFilterSelectedItem,
    secondFilterSelect,
    secondCount,
    secondFilterSelectedItem,
    thirdFilterSelect,
    thirdCount,
    thirdFilterSelectedItem,
  } = useSelector((store) => store.shopData);
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const { search } = useLocation();
  const history = useHistory();
  const searchValue = search.slice(3);

  const getAdressString = () => {
    let string = '/shop?';
    string += getString('ff=', firstFilterSelectedItem);
    string += getString('sf=', secondFilterSelectedItem);
    string += getString('tf=', thirdFilterSelectedItem);
    history.push(string);
  };

  const resetFilter = () => {
    history.push('/shop');
    dispatch({ type: SET_DEFAULTFILTER });
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

  const onChangeFirst = (elem) => {
    dispatch({ type: SET_FIRSTSELECT, payload: elem });
  };
  const onChangeSecond = (elem) => {
    dispatch({ type: SET_SECONDSELECT, payload: elem });
  };
  const onChangeThird = (elem) => {
    dispatch({ type: SET_THIRDSELECT, payload: elem });
  };
  return (
    <main className={styles.main_screen}>
      <Helmet
        title="PINHEAD STUDIO | Печать на футболках и толстовках | Магазин и конструктор"
        meta={[
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
        <FilterSelect
          defaultValue="Категория"
          options={firstFilterSelect}
          editValue="Категория"
          onChange={onChangeFirst}
          count={firstCount}
          setAdress={getAdressString}
        />
        <FilterSelect
          defaultValue="Тип"
          options={secondFilterSelect}
          editValue="Тип"
          onChange={onChangeSecond}
          count={secondCount}
          setAdress={getAdressString}
        />
        <FilterSelect
          defaultValue="Цвет"
          options={thirdFilterSelect}
          editValue="Цвет"
          onChange={onChangeThird}
          count={thirdCount}
          setAdress={getAdressString}
        />
        <button
          type="button"
          className={styles.filter_active}
          onClick={resetFilter}
        >
          Сбросить&nbsp;Х
        </button>
      </div>
      <CardsBlock />
      {isOtherPopupVisible && (
        <PopupModel onClose={handelClosePopup}>
          {isOtherPopupVisible.map((el, index) => (
            <p className={styles.validation_message} key={index}>
              {el}
            </p>
          ))}
        </PopupModel>
      )}
    </main>
  );
}

export default ShopPage;
