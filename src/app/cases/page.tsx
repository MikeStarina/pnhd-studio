import React from 'react';
import { Metadata } from 'next';
import { SITE_INFO } from '@/app/constants';
import Section from '@/components/home/section/section';
import SectionHead from '@/components/home/section-head/section-head';
import Cases from '@/components/home/cases/cases';
import { CASES_PUBLISHED } from '@/components/home/cases/data';
import MoreLink from '@/components/home/more-link/more-link';
import { constructorHref, ogImageHref } from '@/components/site/links';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Кейсы: корпоративный мерч и печать на одежде для брендов — Pinhead Studio',
  description:
    'Проекты Pinhead Studio для бизнеса: одежда с принтом для команд, мероприятий и промо. Задача, изделия и метод печати в каждом кейсе.',
  metadataBase: new URL(SITE_INFO.domain),
  alternates: { canonical: '/cases' },
  // Пока на странице заглушки — не индексировать (см. CASES_PUBLISHED).
  ...(CASES_PUBLISHED ? {} : { robots: { index: false, follow: true } }),
  openGraph: { type: 'website', title: 'PNHD STUDIO | Кейсы', images: ogImageHref },
};

const CasesPage: React.FC = () => (
  <div data-layout="wide">
    <Section tone="black" labelledBy="cases-title">
      <SectionHead
        titleId="cases-title"
        as="h1"
        title="Кейсы"
        lead="Одежда с принтом для команд, мероприятий и&nbsp;промо: задача, изделия и&nbsp;метод печати в&nbsp;каждом проекте"
      />
      <Cases layout="grid" />
      <div className={styles.bar} data-reveal>
        <p className={styles.hint}>Нужна одежда с принтом для команды или события? Собери её в&nbsp;конструкторе</p>
        <MoreLink href={constructorHref}>Нанести принт</MoreLink>
      </div>
    </Section>
  </div>
);

export default CasesPage;
