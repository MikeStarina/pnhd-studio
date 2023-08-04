import React from 'react';
import { useParams } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import styles from './ProductCard.module.css';
import Photos from '../../components/Photos/Photos';
import ProductContent from '../../components/ProductContent/ProductContent';

function ProductCard() {
  const { id } = useParams();
  const { data } = useSelector((store) => store.shopData);

  const item = data && data.length > 0 && data.find((elem) => elem._id === id);
  console.log(item);

  return (
    <section className={styles.section_photos}>
      <Photos {...item} />
      <ProductContent {...item} />
    </section>
  );
}

export default ProductCard;
