import React from 'react';
import { Metadata } from 'next';
import { SITE_INFO } from '@/app/constants';
import Breadcrumbs from '@/components/shared-components/breadcrumbs/Breadcrumbs';
import PrintMethods from '@/components/home/print-methods/print-methods';
import SheetCut from '@/components/home/sheet-cut/sheet-cut';
import PriceEstimate from '@/components/home/price-estimate/price-estimate';
import ConstructorPromo from '@/components/home/constructor-promo/constructor-promo';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Методы печати на одежде в Санкт-Петербурге в Pinhead Studio',
  description:
    'Методы нанесения принтов на одежду в Pinhead Studio. Печатаем любым способом: DTG, шелкография, термоперенос, вышивка.',
  keywords:
    'методы печати на одежде, нанесение принта, dtg, dtf, шелкография, термотрансфер, вышивка, печать на футболках, санкт-петербург, от 1 шт',
  metadataBase: new URL(SITE_INFO.domain),
  alternates: { canonical: '/methods' },
  openGraph: { type: 'website', title: 'Методы печати на одежде — Pinhead Studio', images: '/opengraph-image.jpg' },
};

/** Методы нанесения: те же блоки, что на главной — панели методов (ведут на страницы методов), цены с расчётом и конструктор */
const Page: React.FC = () => (
  <div data-layout="wide" data-inner-page>
    <PrintMethods
      as="h1"
      title="Методы печати на одежде"
      before={
        <div className={styles.crumbs}>
          <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Методы нанесения', href: '/methods' }]} />
        </div>
      }
    />
    <SheetCut index={0} />
    <PriceEstimate />
    <ConstructorPromo />
  </div>
);

export default Page;
