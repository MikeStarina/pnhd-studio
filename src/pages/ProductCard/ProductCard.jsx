import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ProductCard.module.css';
import Photos from '../../components/Photos/Photos';
import ProductContent from '../../components/ProductContent/ProductContent';
import PopupModel from '../../components/popupModel/popupModel';
import { closeHeader, closePopup, openHeader } from '../../services/actions/utility-actions';
import PhotosMobile from '../../components/PhotosMobile/PhotosMobile';
import { apiBaseUrl } from '../../utils/constants';

function ProductCard() {
  const { slug } = useParams();
  const { data } = useSelector((store) => store.shopData);
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const dispatch = useDispatch();
  const ref = useRef();
  const item = data && data.length > 0 && data.find((elem) => elem.slug === slug);

  function getCurrentDimension() {
    return {
      width: window.innerWidth,
    };
  }

  const [screenWidth, setScreenWidth] = useState(getCurrentDimension());
  useEffect(() => {
    dispatch(closeHeader());
    const updateDimension = () => {
      setScreenWidth(getCurrentDimension());
    };
    window.addEventListener('resize', updateDimension);
    return () => {
      dispatch(openHeader());
      window.removeEventListener('resize', updateDimension);
    };
  }, [screenWidth]);

  const closePopupConstructor = () => {
    dispatch(closePopup());
  };

  return (
    <>
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

      <section className={styles.section_photos} ref={ref}>
        {screenWidth.width > 1250 ? <Photos {...item} /> : <PhotosMobile {...item} />}

        <ProductContent {...item} />

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
    </>
  );
}

export default ProductCard;
