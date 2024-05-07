'use client'
import React, { useEffect, useRef, useState} from 'react';
import styles from './product-cards-block.module.css';
import Link from 'next/link';
import { IProduct } from '@/app/utils/types';
import ProductCard from '../product-card/product-card';
import { apiBaseUrl } from '@/app/utils/constants';

export const ProductCardsBlock: React.FC<{ shopData: Array<IProduct> }> = ({ shopData }) => {
 
    const [ endIndex, setEndIndex ] = useState(8);
    const observerRef = useRef(null);
    
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px 50px 0px',
      threshold: 0.1,
    }

    useEffect(() => {

      const observer = new IntersectionObserver((entries) => {
          const [ entry ] = entries;
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
          {shopData && shopData.map((item, index) => {
            const url = `${apiBaseUrl}${item.image_url}`;
            return index < endIndex && (
              <Link
                href={`/shop/${item.slug}`}
                className={styles.link}
                key={item._id}
              >
                <ProductCard
                  title={item.name}
                  price={item.price}
                  img={url}
                  sizes={item.sizes}
                />
              </Link>
            );
          })} 
         
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






