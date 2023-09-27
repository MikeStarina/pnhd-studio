import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../ui/Button/Button';
import SizeSelection from '../../components/size-selection/size-selection';
import styles from './zagitova-page.module.css';
import zgGallery from '../../components/images/friendsPage/zagitova/zagitova_gallery.png';
import minSize from '../../components/images/friendsPage/zagitova/minSize.png';
import zgRecomendCircle from '../../components/images/friendsPage/zagitova/zagitova_recomendation.svg';
import zgSale from '../../components/images/friendsPage/zagitova/zagitova_sale_bgi.png';
import isSizeFunction from '../../utils/isSizeFunction';
import addToMemory from '../../utils/addToMemory';
import { ADD_TO_CART } from '../../services/actions/cart-actions';
import { openPopup } from '../../services/actions/utility-actions';
import { closePopup } from '../../services/actions/utility-actions';
import PopupModel from '../../components/popupModel/popupModel';
import { addItemSize, deleteItemOrder } from '../../services/actions/item-action';
import Photos from '../../components/Photos/Photos';
import PhotosMobile from '../../components/PhotosMobile/PhotosMobile';
import { Sign } from '../../components/images/friendsPage/zagitova/Sign';
import zagitova from '../../components/images/friendsPage/zagitova/zagitova_logo.svg';

function ZagitovaPage() {
  const dispatch = useDispatch();
  const history = useHistory();
  const [size, setSize] = useState('');
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const { order } = useSelector((store) => store.itemReducer);
  const {
    isBlockButton,
    isSelected,
    front_file,
    front_file_preview,
    back_file,
    back_file_preview,
    lsleeve_file,
    lsleeve_file_preview,
    rsleeve_file,
    rsleeve_file_preview,
    badge_file,
    activeView,
  } = useSelector((store) => store.editorState);
  const { products } = useSelector((store) => store.friendData);
  // console.log(products);
  const uuId = uuidv4();
  const closePopupConstructor = () => {
    dispatch(closePopup());
  };

  function getCurrentDimension() {
    return {
      width: window.innerWidth,
    };
  }

  const [screenWidth, setScreenWidth] = useState(getCurrentDimension());
  useEffect(() => {
    const updateDimension = () => {
      setScreenWidth(getCurrentDimension());
    };
    window.addEventListener('resize', updateDimension);
    return () => {
      window.removeEventListener('resize', updateDimension);
    };
  }, [screenWidth]);

  const addToCart = () => {
    if (isSizeFunction(order)) {
      const variant = 'безызбежно';
      // Создает обьект заказа, для сохранения в сесионой памяти
      const data = addToMemory(variant, order, products, uuId, front_file, front_file_preview, back_file, back_file_preview, lsleeve_file, lsleeve_file_preview, rsleeve_file, rsleeve_file_preview, badge_file);
      dispatch({
        type: ADD_TO_CART,
        payload: { ...data },
      });

      history.push('/cart');
    } else {
      dispatch(openPopup(['Нужно выбрать размер']));
    }
  };

  useEffect(() => {
    products?.sizes?.map((el, i) => {
      dispatch(
        addItemSize({
          name: el.name,
          qty: 0,
          _id: products._id + i,
        }),
      );
    });

    return () => {
      dispatch(deleteItemOrder());
    };
  }, [products]);

  return (
    <section className={styles.wrap}>
      <img src={zagitova} alt="логотип" className={styles.logo} />
      <div className={styles.header}>
        <div className={styles.header_text}>
          <h2>
            алина <i>загитова</i>
          </h2>
          <h2>
            <i>alina</i> Zagitova
          </h2>
          <h2>
            алина <i>загитова</i>
          </h2>
          <h2>
            <i>alina</i> Zagitova
          </h2>
        </div>
      </div>
      <div className={styles.biography}>
        <div className={styles.biography_text}>
          <p>
            Алина Загитова родилась в 2002 году в Ижевске.
            С раннего детства она занималась фигурным катанием и уже
            тогда демонстрировала большие способности. В возрасте 12 лет
            она переехала в Москву для продолжения спортивной карьеры и стала
            тренироваться в Школе фигурного катания под руководством Этери Тутберидзе.
          </p>
          <p>
            Начиная с 2016 года, Загитова стала выступать на международных соревнованиях.
            Она завоевала золотую медаль на Чемпионате мира среди юниоров 2017 года. <br />
            В 2018 году она выиграла Чемпионат Европы и завоевала золотую и серебряную медаль
            на зимних Олимпийских играх, проходивших в Пхенчхане.
          </p>
          <p>
            После олимпийского золота Алина Загитова продолжила участвовать
            в международных соревнованиях и в 2019 году выиграла Чемпионат мира.
            Сейчас Алина активно участвует в различных шоу и ледовых спектаклях,
            продолжая радовать своих поклонников своим талантом и мастерством.
          </p>
          <div className={styles.biography_textLink}>
            <Link
              to={{ pathname: 'https://instagram.com/azagitova' }}
              className={styles.social_link}
              target="blank"
            >
              / instagram
            </Link>
            <Link
              to={{ pathname: 'https://t.me/azagitova_official' }}
              className={styles.social_link}
              target="blank"
            >
              / TG
            </Link>
          </div>
        </div>
      </div>
      <div className={styles.gallery}>
        <img src={zgGallery} className={styles.bigImage} alt="Загитова фото" />
        <img src={minSize} className={styles.lessImage} alt="Загитова фото" />
      </div>
      <div className={styles.memHistory}>
        <div className={styles.memHistory_wrap}>
          <h2>#безызбежно</h2>
          <p className={styles.memHistory_text}>
            В одном из своих последних интервью Алина Загитова допустила
            оговорку, которая вызвала множество обсуждений и забавных
            комментариев в социальных сетях. Отвечая на вопрос о своем отношении
            к хоккею, сказала: «Ну, конечно. Это безызбе…Безызбежно. Потому что
            у меня папа хоккеист в прошлом, сейчас тренер. Он следит,
            естественно, и на телевизорах у нас все время хоккей»
          </p>
          <p className={styles.memHistory_textDown}>
            Многие пользователи отреагировали на эту оговорку с юмором, однако
            было много и тех, кто комментировал в негативном ключе. В любом
            случае обычная оговорка получила слишком широкое обсуждение и
            история просто не могла не продолжиться, тем более что само слово за
            короткий период стало мемом. Так и случилось после того как Загитова
            выложила свои фотографии в футболке с хэштегом “БЕЗЫЗБЕЖНО”...
          </p>
          <Link
            to={{
              pathname:
                'https://ya.ru/search/?text=%D0%B0%D0%BB%D0%B8%D0%BD%D0%B0+%D0%B7%D0%B0%D0%B3%D0%B8%D1%82%D0%BE%D0%B2%D0%B0+%D0%B1%D0%B5%D0%B7%D1%8B%D0%B7%D0%B1%D0%B5%D0%B6%D0%BD%D0%BE&lr=2&search_source=yaru_desktop_common&search_domain=yaru&src=suggest_B',
            }}
            className={styles.social_link_mem}
            target="blank"
          >
            / сми
          </Link>
        </div>
      </div>
      <div className={styles.memImage} />
      <div className={styles.recommendation}>
        <div className={styles.recommendation_wrap}>
          <div className={styles.recommendation_top}>
            <img src={zgRecomendCircle} className={styles.avatar} alt="Фото Загитовой" />
            <p>
              “ Очень странно было читать такое большое количество реакций после этого интервью, а тем более видеть такое количество негатива из-за обычной оговорки. Мне захотелось напомнить всем, что ошибаться – это нормально и что меня не задевают комментарии. Я придумала кучу идей и футболка с надписью, как старейший способ заявить о своей позиции, понравилась мне больше всего, так что встречайте #безызбежно на текстиле, не нервничайте и будьте самими сабими :) “
            </p>
          </div>
          <div className={styles.recommendation_bottom}>
            <p>А.&nbsp;Загитова</p>
            <Sign className={styles.sign} />
          </div>
        </div>
      </div>
      <section className={styles.section_photos}>
        {screenWidth.width > 1250 ? <Photos {...products} /> : <PhotosMobile {...products} />}
        <div className={styles.product_box}>
          <div className={styles.description}>
            <div className={styles.title_box}>
              <h1 className={styles.title}>Футболка #БЕЗЫЗБЕЖНО</h1>
              <p className={styles.text}>&#8213; {products?.price} Р.</p>
            </div>
            <p className={styles.text}>
              {products?.description}
            </p>
            <ul className={styles.box_link}>
              <li className={styles.menu_elem}>
                <Link
                  to="/size_chart"
                  className={styles.menu_link}
                  target="blank"
                >
                  Гид по размерам
                </Link>
              </li>
              <span>/</span>
              <li className={styles.menu_elem}>
                <Link to="/shop" className={styles.menu_link} target="blank">
                  Гид по уходу
                </Link>
              </li>
            </ul>
            <label className={styles.select_label} htmfor="sizeSelect">
              Выберите размер:
            </label>
            {order.length > 0 ? (order.map((item, index) => (
              <span className={styles.selectionTest} key={index}>
                <SizeSelection
                  name={item.name}
                  type="shop"
                  qty={item.qty}
                  size={size}
                  id={item._id}
                  key={index}
                  remain={products.sizes[index].qty}
                />
              </span>
            ))) : <p>Нет в наличии</p>}
            <Button className={styles.button_down} onClickTo={addToCart}>В корзину &gt;</Button>
          </div>
        </div>
      </section>

      <div className={styles.footer}>
        <ul className={styles.footer_links}>
          <li className={styles.footer_link_item}>
            <Link to="/" className={styles.menu_link_footer}>
              Студия
            </Link>
          </li>
          <li className={styles.footer_link_item}>
            <Link
              to={{ pathname: 'https://pnhd.ru' }}
              className={styles.menu_link_footer}
              target="blank"
            >
              Оптовый отдел
            </Link>
          </li>
          <li className={styles.footer_link_item}>
            <Link to="/shop" className={styles.menu_link_footer}>
              Каталог
            </Link>
          </li>
          <li className={styles.footer_link_item}>
            <Link to="/#contacts" className={styles.menu_link_footer}>
              Контакты
            </Link>
          </li>
          <li className={styles.footer_link_item}>
            <Link to="/oferta" className={styles.menu_link_footer}>
              Оферта
            </Link>
          </li>
          <li className={styles.footer_link_item}>
            <Link
              to="/size_chart"
              className={styles.menu_link_footer}
              target="blank"
            >
              Гид по размерам
            </Link>
          </li>
        </ul>
        <img src={zagitova} alt="лого" className={styles.footer_logo} />
        <span className={styles.footer_companyInfo}>
          <p>ООО “ПИНХЭД СТУДИО”</p>
          <p>ИНН: 7810463916</p>
          <p>ОГРН: 1137847215440</p>
        </span>
        <p className={styles.footer_merch}>MERCH AGAINST THE MACHINES!</p>
      </div>
      {isOtherPopupVisible && (
      <PopupModel onClose={closePopupConstructor}>
        {isOtherPopupVisible.map((el, index) => (
          <p className={styles.instruction} key={index}>
            {el}
          </p>
        ))}
      </PopupModel>
      )}
    </section>
  );
}

export default ZagitovaPage;
