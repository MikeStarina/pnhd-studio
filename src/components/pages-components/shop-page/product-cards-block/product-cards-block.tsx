'use client'
import React, { useEffect, useRef, useState } from 'react';
import styles from './product-cards-block.module.css';
import Link from 'next/link';
import { IProduct } from '@/app/utils/types';
import ProductCard from '../product-card/product-card';

export const ProductCardsBlock: React.FC<{ shopData: Array<IProduct> }> = ({ shopData }) => {

  const [endIndex, setEndIndex] = useState(8);
  const observerRef = useRef(null);

  const observerOptions = {
    root: null,
    rootMargin: '0px 0px 50px 0px',
    threshold: 0.1,
  }

  useEffect(() => {

    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && endIndex < shopData.length) {
        setEndIndex(endIndex + 8);
      }
    }, observerOptions);
    if (observerRef && observerRef.current) {
      observer.observe(observerRef.current);
    }

    return () => {
      if (observerRef.current) observer.unobserve(observerRef.current);
    }
  }, [observerRef, endIndex, observerOptions])

  return (
    <>
      <div className={styles.screen}>
        {shopData && shopData.length > 0 && shopData.map((item, index) => {
          return index < endIndex && (
            <Link
              href={`/shop/${item.slug}`}
              className={styles.link}
              key={item._id}
            >
              <ProductCard
                item={item}
                shopData={shopData}
                title={item.name}
                price={item.price}
                sizes={item.sizes}
                tags={item.tags}
              />
            </Link>
          );
        })}
        {shopData && shopData.length === 0 && (
          <div className={styles.empty}>
            <p>Ничего не найдено</p>
          </div>
        )}
      </div>
      {/* observer elem */}
      <div
        style={{ width: '100%', height: '10px' }}
        ref={observerRef}
      >
      </div>
    </>
  )
}



export default ProductCardsBlock;






