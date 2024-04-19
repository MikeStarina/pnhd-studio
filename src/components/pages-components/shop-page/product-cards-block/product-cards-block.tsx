import React from 'react';
import styles from './product-cards-block.module.css';
import Link from 'next/link';
import { IProduct } from '@/app/utils/types';
import ProductCard from '../product-card/product-card';
import { apiBaseUrl } from '@/app/utils/constants';

export const ProductCardsBlock: React.FC<{ shopData: Array<IProduct> }> = ({ shopData }) => {
 
    

    return (
        <div className={styles.screen}>
          {shopData && shopData.map((item, index) => {
            const url = `${apiBaseUrl}${item.image_url}`;
            return (
              <Link
                href={{ pathname: `/shop/${item.slug}`, query: `id=${item._id}` }}
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
    )
}



export default ProductCardsBlock;




