import React, { useEffect } from 'react';
import { useLocation, useHistory, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import styles from './cards-block.module.css';
import CardItem from './card-item';
import { apiBaseUrl } from '../../utils/constants';
import {
  SET_DEFAULTFILTER,
  SET_FIRSTSELECTEDITEM,
  SET_SECONDSELECTEDITEM,
  SET_THIRDSELECTEDITEM,
} from '../../services/actions/shop-data-actions';

function CardsBlock() {
  const dispatch = useDispatch();

  const history = useHistory();
  const { search } = useLocation();
  const {
    data,
    firstFilterSelectedItem,
    firstFilterSelect,
    firstCount,
    secondFilterSelectedItem,
    secondFilterSelect,
    secondCount,
    thirdFilterSelectedItem,
    thirdFilterSelect,
    thirdCount,
  } = useSelector((store) => store.shopData);
  useEffect(() => {
    dispatch({ type: SET_DEFAULTFILTER });
  }, []);

  const addressString = decodeURI(search);

  const getAdressFilter = (string, filter, num) => {
    let resultString;
    const arrFilter = string.split('&');
    arrFilter.forEach((item) => {
      if (item.indexOf(filter) !== -1) {
        resultString = item.slice(num).split(',');
      }
    });
    return resultString;
  };

  let frstFilter;
  let secondFilter;
  let thirdFilter;

  let filtr1 = [];
  let count1 = [];
  let filtr2 = [];
  let count2 = [];
  let filtr3 = [];
  let count3 = [];

  if (
    addressString !== '' && firstFilterSelectedItem.length === 0 && secondFilterSelectedItem.length === 0 && thirdFilterSelectedItem.length === 0
  ) {
    frstFilter = getAdressFilter(addressString, 'category', 10);
    secondFilter = getAdressFilter(addressString, 'type', (frstFilter ? 5 : 6));
    thirdFilter = getAdressFilter(addressString, 'color', (frstFilter || secondFilter ? 6 : 7));
    if (frstFilter) {
      filtr1 = firstFilterSelect;
      count1 = firstCount;
      frstFilter.forEach((item) => {
        filtr1.forEach((select, index) => {
          if (select.category === item) {
            filtr1[index].selected = true;
            count1 += 1;
          }
        });
      });
    }
    if (secondFilter) {
      filtr2 = secondFilterSelect;
      count2 = secondCount;
      secondFilter.forEach((item) => {
        filtr2.forEach((select, index) => {
          if (select.category === item) {
            filtr2[index].selected = true;
            count2 += 1;
          }
        });
      });
    }
    if (thirdFilter) {
      filtr3 = thirdFilterSelect;
      count3 = thirdCount;
      thirdFilter.forEach((item) => {
        filtr3.forEach((select, index) => {
          if (select.category === item) {
            filtr3[index].selected = true;
            count3 += 1;
          }
        });
      });
    }
  }

  useEffect(() => {
    if (
      addressString === '' && (firstFilterSelectedItem.length !== 0 || secondFilterSelectedItem.length !== 0 || thirdFilterSelectedItem.length !== 0)
    ) {
      history.push('/shop');
      filtr1 = [];
      count1 = [];
      filtr2 = [];
      count2 = [];
      filtr3 = [];
      count3 = [];
      dispatch({ type: SET_DEFAULTFILTER });
    }
  });
  useEffect(() => {
    if (filtr1.length > 0) {
      dispatch({ type: SET_FIRSTSELECTEDITEM, payload: { filtr1, count1, frstFilter } });
    }
    if (filtr2.length > 0) {
      dispatch({
        type: SET_SECONDSELECTEDITEM,
        payload: { filtr2, count2, secondFilter },
      });
    }
    if (filtr3.length > 0) {
      dispatch({
        type: SET_THIRDSELECTEDITEM,
        payload: { filtr3, count3, thirdFilter },
      });
    }
  }, [filtr1, filtr2, filtr3]);

  let resultArr = [];

  if (
    firstFilterSelectedItem.length === 0 ||
    secondFilterSelectedItem.length === 0 ||
    thirdFilterSelectedItem.length === 0
  ) {
    resultArr = data;
  }

  if (firstFilterSelectedItem.length !== 0) {
    resultArr = [];
    firstFilterSelectedItem.forEach((item) => {
      data.forEach((elem) => {
        if (item === elem.filter_category
        ) {
          resultArr.push(elem);
        }
      });
    });
  }
  if (secondFilterSelectedItem.length !== 0) {
    const a = [...resultArr];
    resultArr = [];
    secondFilterSelectedItem.forEach((item) => {
      a.forEach((elem) => {
        if (item === elem.filter_type) {
          resultArr.push(elem);
        }
      });
    });
  }
  if (thirdFilterSelectedItem.length !== 0) {
    const a = [...resultArr];
    resultArr = [];
    thirdFilterSelectedItem.forEach((item) => {
      a.forEach((elem) => {
        if (item === elem.filter_color
        ) {
          resultArr.push(elem);
        }
      });
    });
  }

  const visibleArr = [];
  const renderQueue = ['Футболка', 'Лонгслив', 'Свитшот', 'Худи', 'Шоппер', 'Кепка'];
  if (renderQueue.length !== secondFilterSelect.length) {
    secondFilterSelect.forEach((item) => {
      if (!renderQueue.includes(item.category)) {
        renderQueue.push(item.category);
      }
    });
  }
  renderQueue.forEach((type) => {
    resultArr.forEach((result) => {
      if (type === result.filter_type) {
        visibleArr.push(result);
      }
    });
  });
  return (
    <>
      {visibleArr.length === 0 && (
        <div className={styles.screen_noProducts}>
          <p>Ничего не найдено UwU</p>
        </div>
      )}

      {visibleArr.length > 0 && (
        <section className={styles.screen}>
          {visibleArr && visibleArr.map((item) => {
            const url = `${apiBaseUrl}${item.image_url}`;
            return (
              <Link
                to={{ pathname: `/shop/${item.slug}` }}
                className={styles.link}
                key={item.slug}
              >
                <CardItem
                  title={item.name}
                  price={item.price}
                  img={url}
                  sizes={item.sizes}
                />
              </Link>
            );
          })}
        </section>
      )}
    </>
  );
}

export default CardsBlock;
