import React, { useState, useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import Button from '../../ui/Button/Button';
import SizeSelection from '../../components/size-selection/size-selection';
import styles from './zagitova-page.module.css';
import zgGallery from '../../components/images/friendsPage/zagitova/zagitova_gallery.png';
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
      console.log(data);
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
            Алина Загитова родилась в 2002 году в Ижевске. С раннего детства она
            занималась фигурным катанием и уже тогда демонстрировала большие
            способности. В возрасте 13 лет она переехала в Москву для
            продолжения спортивной карьеры и стала тренироваться в Школе
            фигурного катания под руководством Этери Тутберидзе.
          </p>
          <p>
            Начиная с 2016 года, Загитова стала выступать на международных
            соревнованиях. Она завоевала серебряную медаль на Чемпионате мира
            среди юниоров 2017 года и выиграла этот турнир в следующем сезоне. В
            2018 году она стала серебряной призеркой взрослого Чемпионата Европы
            и завоевала золотую медаль на зимних Олимпийских играх, проходивших
            в Пхенчхане.
          </p>
          <p>
            После олимпийского золота Загитова продолжает активно участвовать в
            международных соревнованиях и занимать призовые места. В 2021 году
            она выиграла Чемпионат мира и стала двукратной чемпионкой России.
            Также она активно участвует в различных шоу и ледовых спектаклях,
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
        <img src={zgGallery} alt="Загитова фото" />
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
            Многие полезователи отреагировали на эту оговорку с юмором, однако
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
            <img src={zgRecomendCircle} alt="Фото Загитовой" />
            <p>
              “ Очень странно было читать такое большое количество реакций после этого интервью, а тем более видеть такое количество негатива из-за обычной оговорки. Мне захотелось напомнить всем, что ошибаться – это нормально и что меня не задевают комментарии. Я придумала кучу идей и футболка с надписью, как старейший способ заявить о своей позиции, понравилась мне больше всего, так что встречайте #безызбежно на текстиле, не нервничайте и будьте самими сабими :) “
            </p>
          </div>
          <div className={styles.recommendation_bottom}>
            <p>А.&nbsp;Загитова</p>
            <svg
              className={styles.recommendation_bottomSvg}
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 503 256"
              fill="none"
            >
              <path
                d="M495.941 73.4393C454.555 76.2069 414.83 84.0154 376.073 94.4926C303.959 114.063 236.136 139.564 173.572 171.688C133.986 192.049 96.1984 214.19 57.4422 235.441C48.5836 240.284 39.3098 244.93 30.036 249.476C28.7903 250.069 25.8836 250.168 24.6378 249.476C24.361 249.378 24.2226 249.18 24.0842 248.982C23.6689 248.686 23.2537 248.29 22.9769 247.895C21.7311 245.72 21.0391 243.348 20.9006 241.075C20.9006 240.086 21.0391 239.197 21.1775 238.208C21.3159 237.813 21.3159 237.319 21.3159 236.924C21.3159 236.726 21.0391 236.133 21.3159 236.528C20.7622 235.639 20.9006 234.848 21.4543 234.156C21.4543 233.168 21.7311 232.278 22.1464 231.388C30.5897 213.498 47.6147 200.451 69.6227 190.468C72.8063 188.985 79.0349 189.282 76.2666 184.439C76.1282 184.142 77.5124 183.154 78.4813 182.758C89.4161 177.322 100.489 171.886 111.562 166.647C113.223 165.856 115.715 165.955 117.791 165.659C117.237 167.042 116.545 168.426 116.269 169.81C115.992 171.391 115.023 173.764 116.13 174.554C117.514 175.642 120.698 175.839 123.051 175.74C124.85 175.642 126.927 174.653 128.449 173.665C140.214 166.548 151.703 159.135 163.606 152.117C190.321 136.204 216.481 119.796 244.302 104.871C258.144 97.359 271.847 88.0679 291.64 88.3644C295.654 88.4633 299.668 85.9922 303.682 84.8061C305.482 84.3119 307.42 84.0154 309.357 83.5212C308.665 84.8061 307.973 86.0911 307.281 87.376C307.143 87.6725 306.451 87.8702 306.451 88.1667C306.589 89.7482 306.866 91.2308 307.004 92.8123C308.942 92.3181 311.295 92.2193 312.541 91.3297C318.631 87.0795 324.306 82.6316 330.258 78.2826C340.778 70.6718 351.574 63.2586 361.678 55.4501C363.478 54.0664 364.17 50.4092 362.924 49.0254C361.54 47.6417 356.695 46.7521 354.065 47.2463C349.498 48.1359 345.484 50.2115 341.193 51.8918C332.473 55.549 324.306 60.3922 314.894 62.5668C303.267 65.3343 294.962 70.2764 287.349 76.6023C282.09 80.9513 276.691 85.0038 267.418 84.905C263.542 84.8061 259.39 86.3876 255.652 87.5737C240.565 92.4169 225.478 97.4579 210.391 102.4C209.007 102.894 207.484 102.993 205.961 103.29C206.93 102.301 207.484 101.115 208.73 100.423C231.153 88.8586 253.299 77.0965 276.138 65.9274C314.617 47.2463 354.342 29.8501 396.836 16.1112C399.742 15.1227 402.511 13.8378 405.417 13.0471C416.491 10.3783 427.564 7.90729 438.637 5.04088C440.436 4.54668 441.682 2.86637 443.205 1.68027C440.99 1.08722 438.775 -0.197726 436.699 -4.26993e-05C432.408 0.395324 428.117 1.18606 424.103 2.27332C402.788 8.50034 382.025 14.5297 362.232 22.7335C312.403 43.3915 263.265 64.8401 217.173 89.6494C193.643 102.301 169.974 114.854 146.581 127.605C144.505 128.791 141.322 131.459 141.875 132.25C144.505 135.71 148.519 133.93 151.98 132.547C154.194 131.657 155.994 130.372 158.07 129.285C186.307 113.866 217.865 102.696 250.531 93.2077C252.054 92.7135 253.853 92.8123 255.652 92.7135C254.684 93.5042 253.715 94.3938 252.607 95.0857C222.986 111.988 193.089 128.791 163.606 145.791C152.672 152.117 142.291 158.839 131.494 165.263C130.525 165.856 129.141 166.252 128.034 166.647C127.757 166.153 127.203 165.659 127.065 165.164C125.958 159.728 123.605 158.147 116.407 160.321C107.964 162.891 100.212 166.449 92.3228 169.81C85.6788 172.578 79.0349 175.642 72.5294 178.508C74.7441 177.223 77.0971 176.235 78.8965 174.752C95.3679 160.519 112.67 146.78 127.757 131.855C146.443 113.371 163.883 94.0973 180.77 74.7243C188.936 65.4332 195.442 55.4502 201.532 45.3683C204.716 40.2285 201.117 35.2864 193.781 33.3096C188.798 32.0247 182.569 30.8386 177.863 31.9258C163.053 35.2864 147.689 38.5482 134.263 43.9845C99.3819 58.02 72.8063 78.4803 50.6599 102.005C29.0671 124.936 15.6409 150.536 6.50549 177.223C3.46036 186.119 1.79938 195.311 0.553643 204.405C-0.138431 209.643 0.415228 216.957 8.02805 218.144C22.2848 220.219 15.0872 225.26 13.4262 230.005C13.011 231.092 12.7342 232.278 12.4573 233.365C12.5957 233.761 12.5957 234.156 12.4573 234.65C12.1805 235.243 12.0421 235.836 11.9037 236.33C11.9037 236.924 11.7653 237.517 11.35 237.912C10.7964 239.493 10.5195 241.174 10.5195 242.854C10.5195 243.744 10.3811 244.732 10.3811 245.72C10.3811 245.819 10.3811 245.918 10.3811 246.017C11.35 254.517 17.3019 257.779 28.9287 255.506C31.9738 254.913 34.7421 253.628 37.7873 252.738C38.4793 252.54 39.3098 252.343 40.1403 252.244C41.8013 251.354 43.4623 250.465 45.2617 249.674C46.6458 249.081 48.03 248.587 49.4141 247.994C53.2897 244.534 58.2727 241.767 63.394 238.999C66.716 237.22 69.7611 235.243 73.0831 233.365C104.642 215.475 135.508 196.893 167.897 179.793C204.577 160.42 243.333 143.123 284.027 128.296C325.69 113.075 368.184 98.8417 413.307 89.6494C440.713 84.0154 468.95 80.4571 496.771 75.8115C499.124 75.4162 501.339 74.6254 503.554 73.9335C500.647 73.7359 498.294 73.2417 495.941 73.4393ZM325.829 66.7181C333.165 62.3691 341.054 58.4154 348.806 54.3629C350.051 53.7698 351.989 53.8687 353.512 53.671C352.958 54.6594 352.543 55.6478 352.128 56.3397C344.653 61.5783 337.871 66.6193 330.535 71.2648C328.736 72.4509 325.137 72.1544 322.368 72.4509C323.476 70.5729 323.891 68.003 325.829 66.7181ZM307.973 69.881C309.773 68.8926 312.818 68.9915 315.171 68.6949C314.617 70.9683 315.171 74.5266 313.233 75.4162C307.004 78.3814 299.807 80.4571 293.024 82.8293C292.332 83.027 291.363 82.7305 290.533 82.6316C290.948 81.742 291.363 80.9513 292.056 79.5675C297.177 76.4046 302.298 72.9451 307.973 69.881ZM61.041 186.811C49.691 194.718 38.4793 202.724 26.5757 210.335C22.9769 212.707 17.5787 213.696 13.011 215.277C11.35 211.719 8.02805 208.062 8.30488 204.503C8.85854 196.3 9.96586 187.997 12.7342 180.09C21.5927 154.292 33.358 129.087 53.705 106.65C75.713 82.4339 101.873 60.5899 137.861 46.5544C150.319 41.7112 164.575 38.4494 178.555 36.0772C194.058 33.4085 199.456 38.5482 192.812 48.8278C187.275 57.427 180.632 65.8285 173.434 73.7359C156.963 91.9227 139.661 109.813 122.774 127.901C121.667 129.087 119.867 129.878 118.483 130.866C117.653 129.581 116.822 128.395 116.13 127.11C113.777 123.058 108.794 121.971 103.258 121.575C101.458 121.476 99.7972 121.18 97.9978 120.982C98.8283 119.697 99.3819 118.215 100.628 117.226C117.514 102.894 134.401 88.5621 151.426 74.2301C153.225 72.7474 155.855 71.5613 156.824 69.7822C158.07 67.8054 157.793 65.3343 158.347 63.1598C155.025 63.061 150.457 61.8749 148.381 62.9621C137.308 69.0903 126.511 75.515 116.545 82.5328C110.317 86.9807 105.611 92.6146 100.628 97.9521C97.8594 100.917 94.6758 103.981 98.9667 107.836C99.6588 108.429 97.7209 110.802 96.4752 111.988C87.063 120.686 77.5124 129.384 67.9617 138.082C65.7471 140.157 61.041 142.431 66.1623 145.001C70.73 147.274 73.6367 144.408 75.8514 141.739C81.2496 135.413 88.724 130.471 98.2746 127.605C101.043 126.715 104.78 127.308 107.964 127.209C107.825 129.384 108.794 132.052 107.41 133.733C100.628 141.64 93.8453 149.646 85.6788 156.862C77.9276 163.781 68.377 169.612 59.7952 176.037C55.6428 179.101 51.2135 180.386 44.9848 179.694C40.0019 179.101 34.8806 179.496 29.8976 179.694C25.3299 179.892 24.6378 181.869 26.022 184.537C28.5135 188.985 33.2196 191.456 40.0019 191.061C44.0159 190.764 48.3068 189.974 51.7672 188.59C58.5495 185.724 64.7782 182.165 71.2837 178.903C67.9617 181.572 64.6398 184.34 61.041 186.811Z"
                fill="#C0B8AD"
              />
            </svg>
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
          <li>
            <Link to="/" className={styles.menu_link_footer}>
              Студия
            </Link>
          </li>
          <li>
            <Link
              to={{ pathname: 'https://pnhd.ru' }}
              className={styles.menu_link_footer}
              target="blank"
            >
              Оптовый отдел
            </Link>
          </li>
          <li>
            <Link to="/shop" className={styles.menu_link_footer}>
              Каталог
            </Link>
          </li>
          <li>
            <Link to="/#contacts" className={styles.menu_link_footer}>
              Контакты
            </Link>
          </li>
          <li>
            <Link to="/oferta" className={styles.menu_link_footer}>
              Оферта
            </Link>
          </li>
          <li>
            <Link
              to="/size_chart"
              className={styles.menu_link_footer}
              target="blank"
            >
              Гид по размерам
            </Link>
          </li>
        </ul>
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
