import React from 'react';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import MoreLink from '../more-link/more-link';
import MethodPanels from './method-panels';
import { methodPanels, methodsTitle } from './data';
import styles from './print-methods.module.css';

/** На главной — секция с h2; на странице /methods она же открывает страницу: h1, свой заголовок, крошки сверху */
const PrintMethods: React.FC<{ as?: 'h1' | 'h2'; title?: React.ReactNode; before?: React.ReactNode }> = ({
  as = 'h2',
  title = methodsTitle(methodPanels.length),
  before,
}) => (
  <Section tone="white" id="methods" labelledBy="methods-title">
    {before}
    <SectionHead
      as={as}
      titleId="methods-title"
      title={title}
      lead="Под любой тираж, ткань и&nbsp;срок: от&nbsp;одной футболки за&nbsp;15&nbsp;минут до&nbsp;партии в&nbsp;цветах по&nbsp;Пантону"
    />
    <MethodPanels panels={methodPanels} />
    <div className={styles.bar}>
      <p className={styles.hint}>Не знаешь, какой метод нужен? Сравни цены в&nbsp;расчёте ниже</p>
      <MoreLink href="#price">Сравнить цены</MoreLink>
    </div>
  </Section>
);

export default PrintMethods;
