import React from 'react';
import { Metadata } from 'next';
import { SITE_INFO } from '@/app/constants';
import Breadcrumbs from '@/components/shared-components/breadcrumbs/Breadcrumbs';
import Section from '@/components/home/section/section';
import MethodsList from '@/components/pages-components/methods-page/methods-list/methods-list';
import { methods } from '@/components/pages-components/methods-page/methods-list/data';
import MethodsConsult from '@/components/pages-components/methods-page/methods-consult/methods-consult';
import styles from './page.module.css';
import { ogImageHref } from '@/components/site/links';

export const metadata: Metadata = {
  title: 'Методы печати на одежде в Санкт-Петербурге в Pinhead Studio',
  description:
    'Методы нанесения принтов на одежду в Pinhead Studio. Печатаем любым способом: DTG, шелкография, термоперенос, вышивка.',
  keywords:
    'методы печати на одежде, нанесение принта, dtg, dtf, шелкография, термотрансфер, вышивка, печать на футболках, санкт-петербург, от 1 шт',
  metadataBase: new URL(SITE_INFO.domain),
  alternates: { canonical: '/methods' },
  openGraph: { type: 'website', title: 'Методы печати на одежде — Pinhead Studio', images: ogImageHref },
};

/** Методы нанесения: бенто методов (цена от и тираж, ведут на страницы методов), под ним — форма консультации */
const Page: React.FC = () => (
  <div data-layout="wide" data-inner-page>
    <Section tone="white" id="methods" labelledBy="methods-title">
      <div className={styles.crumbs}>
        <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Методы нанесения', href: '/methods' }]} />
      </div>
      {/* В h1 — ключ для поиска (строка сверху), слоган крупно и подзаголовок, как на старом /methods */}
      <MethodsList
        methods={methods}
        heading={
          <h1 id="methods-title" className={styles.title}>
            <span className={styles.eyebrow}>Методы печати на&nbsp;одежде</span>
            <span className={styles.big}>Воплощай смелые идеи</span>
            <span className={styles.sub}>с&nbsp;любым методом нанесения</span>
          </h1>
        }
      />
    </Section>
    <MethodsConsult />
  </div>
);

export default Page;
