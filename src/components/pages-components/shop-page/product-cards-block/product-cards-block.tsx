import React from 'react';
import styles from './product-cards-block.module.css';
import Link from 'next/link';
import { IProduct } from '@/app/utils/types';
import ProductCard from '../product-card/product-card';
import { getShopData } from '@/app/utils/constants';
import { apiBaseUrl } from '@/app/utils/constants';

export const ProductCardsBlock = async () => {
 
    const shopData: Array<IProduct> = await getShopData();
    //console.log(Object.keys(shopData));
    return (
        <section className={styles.screen}>
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
        </section>
    )
}



export default ProductCardsBlock;




