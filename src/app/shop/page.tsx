import React from 'react';
import {Metadata} from 'next';
import {getShopData} from '../utils/constants';
import {IProduct} from '../utils/types';
import {productMainPhotoUrl} from '../utils/product-photos';
import {CatalogPageNavigationJsonLD} from "@/app/utils/markups";
import CatalogPage from '@/components/catalog/catalog-page/catalog-page';
import type {SearchParams} from '@/components/catalog/filters';


export const metadata: Metadata = {
  title: 'Печать на одежде в Санкт-Петербурге на заказ от 1 штуки цена в ПИНХЭД СТУДИЯ',
  description: 'Печать на одежде на заказ от 1 штуки в Санкт-Петербурге по выгодной цене в ПИНХЭД СТУДИЯ. Сколько стоит печать на одежде смотрите онлайн на нашем сайте.',
  keywords: 'печать на футболках, санкт-петербург, недорого, на заказ, цена, от 1 шт, срочный, заказать, хороший, сделать, стоимость, доставка, быстрый, качественный, черный, оверсайз, белый, онлайн, спортивный, свой дизайн, конструктор, создать макет, нанесение, собственный, толстовка, худи, студия, услуги, каталог, а3, а4, одежда, свитшот',
  metadataBase: new URL('https://studio.pnhd.ru'),
  alternates: {
    canonical: '/shop',
  },
  openGraph: {
    type: 'website',
    title: 'PNHD STUDIO | Главная',
    images: '/opengraph-image.jpg',
  },
};

const ShopPage: React.FC<{ searchParams: SearchParams }> = async ({ searchParams }) => {
  const shopData: IProduct[] = await getShopData();
  const jsonLdCatalog = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "name": "Каталог",
    "description": "Каталог одежды и сумок для печати в Санкт-Петербурге. Печать, на футболках,толстовках, шопперах на заказ от 1 штуки по выгодной цене вПИНХЭД СТУДИЯ",
    "url": "https://studio.pnhd.ru/shop",
    "mainEntity": {
      "@type": "ItemList",
      "numberOfItems": shopData.slice(0, 20).length ?? 0,
      "itemListElement": shopData.slice(0, 20).map((item, index) => {
        return {
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "Product",
            "name": item.name,
            "url": `https://studio.pnhd.ru/shop/${item.slug}`,
            "image": productMainPhotoUrl(item)
          }
        }
      })
    }
  }

  return (
    <CatalogPage
      title="Каталог"
      breadcrumbs={[{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/shop' }]}
      jsonLd={[jsonLdCatalog, CatalogPageNavigationJsonLD]}
      searchParams={searchParams}
    />
  )
}

export default ShopPage;
