import React, { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useParams, useHistory, useLocation, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper';
import styles from './item-page.module.css';
import closeicon from '../../components/images/closeIcon.svg';
import { ADD_TO_CART } from '../../services/actions/cart-actions.jsx';
import { apiBaseUrl } from '../../utils/constants';
import SizeSelection from '../../components/size-selection/size-selection';
import { addItemSize, deleteItemOrder, getSizeFlag } from '../../services/actions/item-action';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import isSizeFunction from '../../utils/isSizeFunction';
import PopupModel from '../../components/popupModel/popupModel';
import { closePopup, openPopup } from '../../services/actions/utility-actions';
import { instructionForPopup } from '../../data/instructionForPopup/instructionForPopup';

function ItemPage() {
  const { id } = useParams();
  const { data } = useSelector((store) => store.shopData);
  const { order } = useSelector((store) => store.itemReducer);
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);

  const history = useHistory();
  const dispatch = useDispatch();
  // let location = useLocation();

  const onClick = () => {
    history.goBack();
  };

  const item = data && data.length > 0 && data.filter((elem) => elem._id === id)[0];
  const [size, setSize] = useState('');

  useEffect(() => {
    item.sizes?.map((el, i) => {
      dispatch(
        addItemSize({
          name: el.name,
          qty: 0,
          _id: item._id + i,
        }),
      );
    });

    return () => {
      dispatch(deleteItemOrder());
    };
  }, [item]);

  useEffect(() => {
    item && item.sizes.length > 0 && setSize(item.sizes[0].name);
  }, [item]);

  useEffect(() => {
    if (item) {
      window.dataLayer.push({
        ecommerce: {
          currencyCode: 'RUB',
          detail: {
            products: [
              {
                id: item._id,
                name: item.name,
                price: item.price,
                category: item.category,
              },
            ],
          },
        },
      });
    }
  }, [item]);

  const onChange = (e) => {
    setSize(e.target.value);
  };

  const closePopupConstructor = () => {
    dispatch(closePopup());
  };

  const addToCart = () => {
    if (isSizeFunction(order)) {
      window.dataLayer.push({
        ecommerce: {
          currencyCode: 'RUB',
          add: {
            products: [
              {
                id: item._id,
                name: item.name,
                price: item.price,
                size: order,
                category: item.category,
                variant: 'без принта',
              },
            ],
          },
        },
      });

      const data = {
        attributes: { ...item },
        cart_item_id: uuidv4(),
      };
      data.attributes.size = order;
      data.attributes.key = uuidv4();

      dispatch({
        type: ADD_TO_CART,
        payload: { ...data },
      });

      history.goBack();
    } else {
      dispatch(openPopup(['Нужно выбрать размер']));
    }
  };

  const addToConstructor = () => {
    dispatch(openPopup(['Нужно выбрать размер']));
  };

  const descriptionArray = item ? item.description.split('=') : [];

  return (
    data.length > 0 &&
    item && (
      <section className={styles.screen}>
        <Helmet
          title={`PINHEAD STUDIO | ${item.name}`}
          meta={[
            {
              property: 'og:image',
              content:
                'https://sun9-77.userapi.com/impg/r3SRF7rtra4wl-3EmEgVqIRaaGNbjeO6q9ufUw/-yeDgKpu2CQ.jpg?size=500x500&quality=95&sign=d7fc90ef8c432358c10c8b1e16b4945f&type=album',
            },
            {
              property: 'og:title',
              content: `PINHEAD STUDIO | ${item.name}`,
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
                            '@type': 'Product',
                            "description": ${item.description},
                            "name": ${item.name},
                            "image": ${apiBaseUrl}${item.image_url},
                            "offers": {
                                        "@type": "Offer",
                                        "availability": "http://schema.org/InStock",
                                        "price": ${item.price},
                                        "priceCurrency": "RUB"
                            }
                        }`,
            },
          ]}
        />

        <div className={styles.close_icon_wrapper}>
          <img src={closeicon} alt="close icon" onClick={onClick} className={styles.close_icon} />
        </div>

        <div className={styles.shop_item_wrapper}>
          {item.galleryPhotos ? (
            <Swiper
              className={styles.gallery_wrapper}
              navigation
              pagination
              modules={[Navigation, Pagination]}
            >
              {item.galleryPhotos.map((image, index) => (
                <SwiperSlide className={styles.swiper_slide} key={index}>
                  <img src={`${apiBaseUrl}${image}`} alt={item.name} />
                </SwiperSlide>
              ))}
            </Swiper>
          ) : (
            <div className={styles.gallery_wrapper}>
              <img
                src={`${apiBaseUrl}${item.image_url}`}
                alt="item"
                className={styles.gallery_image}
              />
            </div>
          )}
          <div className={styles.item_info_wrapper}>
            <div className={styles.item_info_block}>
              <h1 className={styles.item_title}>{item.name}</h1>
              {!item.isSale && <p className={styles.item_description}>{item.description}</p>}
              {item.isSale &&
                descriptionArray &&
                descriptionArray.map((item, index) => (
                  <p className={styles.item_description} key={index}>
                    {item}
                  </p>
                ))}
              <br />
              {item.isSale && (
                <a href="https://instagram.com/easyvisa_inc" target="blank">
                  instagram
                </a>
              )}
              {item.isSale && (
                <a href="https://easyvisainc.ru" target="blank">
                  сайт
                </a>
              )}
              <form className={styles.item_form}>
                {item.stock === 'supplier' && (
                  <span className={styles.stock_type}>
                    В наличии на удаленном складе. Срок изготовления заказа 2-4 дня!
                  </span>
                )}
                {!item.isSale && (
                  <label className={styles.select_label} htmfor="sizeSelect">
                    Выберите размер:
                  </label>
                )}
                {item.isSale && (
                  <label className={styles.select_label} htmfor="sizeSelect">
                    Выберите код:
                  </label>
                )}

                <div className={styles.form_select} id="sizeSelect" name="sizeSelect">
                  {order.length > 0 ? (
                    order.map((item) => (
                      <SizeSelection
                        name={item.name}
                        type="shop"
                        qty={item.qty}
                        size={size}
                        id={item._id}
                        key={item._id}
                      />
                    ))
                  ) : (
                    <option>Нет в наличии</option>
                  )}
                </div>
                {!item.sale && (
                  <Link to="/size_chart" className={styles.size_chart_link} target="blank">
                    (Гид по размерам)
                  </Link>
                )}
              </form>
              <p className={styles.item_price}>{item.price} Р.</p>
            </div>

            <div className={styles.item_button_wrapper}>
              {item.isForPrinting &&
                !item.isSale &&
                item.sizes.length > 0 &&
                (isSizeFunction(order) ? (
                  <Link
                    to={{
                      pathname: `/shop/${id}/constructor`,
                      state: { size: order },
                    }}
                  >
                    <button type="button" className={styles.item_button}>
                      Добавить принт
                    </button>
                  </Link>
                ) : (
                  <button type="button" className={styles.item_button} onClick={addToConstructor}>
                    Добавить принт
                  </button>
                ))}
              {item.sizes.length > 0 && (
                <button type="button" className={styles.item_button} onClick={addToCart}>
                  Добавить в корзину
                </button>
              )}
              {isOtherPopupVisible && (
                <PopupModel onClose={closePopupConstructor}>
                  {isOtherPopupVisible.map((el, index) => (
                    <p className={styles.instruction} key={index}>
                      {el}
                    </p>
                  ))}
                </PopupModel>
              )}
            </div>
          </div>
        </div>
      </section>
    )
  );
}

export default ItemPage;
