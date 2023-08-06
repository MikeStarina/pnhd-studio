import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ProductCard.module.css';
import Photos from '../../components/Photos/Photos';
import ProductContent from '../../components/ProductContent/ProductContent';
import PopupModel from '../../components/popupModel/popupModel';
import { closePopup } from '../../services/actions/utility-actions';
import PhotosMobile from '../../components/PhotosMobile/PhotosMobile';

function ProductCard() {
  const { id } = useParams();
  const { data } = useSelector((store) => store.shopData);
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const dispatch = useDispatch();
  const [screen, setScreen] = useState(null);
  const ref = useRef();
  const item = data && data.length > 0 && data.find((elem) => elem._id === id);
  // console.log(item);
  //--------------------------------------------------------------------
  useEffect(() => {
    setScreen(ref.current.offsetWidth);
  }, []);
  console.log(screen);

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
  // console.log(screenSize);
  //--------------------------------------------------------------------

  const closePopupConstructor = () => {
    dispatch(closePopup());
  };

  return (
    <section className={styles.section_photos} ref={ref}>
      {screenWidth.width > 1249 ? <Photos {...item} /> : <PhotosMobile {...item} />}

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
  );
}

export default ProductCard;
