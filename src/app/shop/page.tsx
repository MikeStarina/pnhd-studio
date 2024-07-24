import React from 'react';
import styles from './page.module.css';
import { Metadata } from 'next';
import ProductCardsBlock from '@/components/pages-components/shop-page/product-cards-block/product-cards-block';
import { IProduct } from '../utils/types';
import { getShopData } from '../utils/constants';
import ProductFilterComp from '@/components/pages-components/shop-page/products-filter/products-filter';



export const metadata: Metadata = {
    title: 'Печать на одежде в Санкт-Петербурге на заказ от 1 штуки цена в Pinhead Studio',
    description: 'Печать на одежде на заказ от 1 штуки в Санкт-Петербурге по выгодной цене в Pinhead Studio. Сколько стоит печать на одежде смотрите онлайн на нашем сайте.',
    keywords: 'печать на футболках, санкт-петербург, недорого, на заказ, цена, от 1 шт, срочный, заказать, хороший, сделать, стоимость, доставка, быстрый, качественный, черный, оверсайз, белый, онлайн, спортивный, свой дизайн, конструктор, создать макет, нанесение, собственный, толстовка, худи, студия, услуги, каталог, а3, а4, одежда, свитшот',
    metadataBase: new URL('https://studio.pnhd.ru/shop'),
    alternates: {
      canonical: '/shop',
    },
    openGraph: {
      type: 'website',
      title: 'PNHD STUDIO | Главная',
      images: '/opengraph-image.jpg',
    },
  };

const ShopPage: React.FC = async () => {

    const shopData: Array<IProduct> = await getShopData();    
    // if (searchParams.priceSort) {
    //   searchParams.priceSort === 'ASC' && shopData.sort((a,b) => (a.price - b.price));
    //   searchParams.priceSort === 'DESC' && shopData.sort((a,b) => (b.price - a.price));
    // }
    return (
        <ProductFilterComp shopData={shopData}>
          {shopData && shopData.length > 0 && <ProductCardsBlock shopData={shopData} />}
        </ProductFilterComp>
    )
}




export default ShopPage;