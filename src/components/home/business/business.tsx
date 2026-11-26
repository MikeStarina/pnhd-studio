import React from 'react';
import { Icon } from '@/features/constructor/ui/icons';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import Clients from '../clients/clients';
import MoreLink from '../more-link/more-link';
import { businessSiteHref, constructorHref } from '@/components/site/links';
import styles from './business.module.css';

/**
 * «Для бизнеса»: стена клиентов как довод доверия и выход в оптовый отдел (pnhd.ru).
 * Кейсы вернутся сюда (компонент Cases), когда появятся настоящие.
 */
const Business: React.FC = () => (
  <Section tone="black" id="business" labelledBy="business-title">
    <SectionHead
      titleId="business-title"
      title={
        <>
          С&nbsp;кем мы
          <br />
          уже работали
        </>
      }
      lead="Печатаем одежду для команд, мероприятий и&nbsp;промо: от&nbsp;корпоративных подарков до&nbsp;униформы"
    />
    <Clients />
    <div className={styles.footer} data-reveal>
      <a href={businessSiteHref} className={styles.link} target="_blank" rel="noopener noreferrer">
        Большой тираж или корпоративный заказ? Оптовый отдел&nbsp;— на&nbsp;pnhd.ru&nbsp;
        <Icon name="arrowRight" size="1.25em" stroke={2} />
        <span className="visually-hidden"> (откроется в новой вкладке)</span>
      </a>
      <MoreLink href={constructorHref}>Нанести принт</MoreLink>
    </div>
  </Section>
);

export default Business;
