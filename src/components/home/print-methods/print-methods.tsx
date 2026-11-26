import React from 'react';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import MoreLink from '../more-link/more-link';
import MethodPanels from './method-panels';
import { methodPanels, methodsTitle } from './data';
import styles from './print-methods.module.css';

/** Методы печати на главной: панели методов (ведут на страницы методов) и ссылка к расчёту цен ниже */
const PrintMethods: React.FC = () => (
  <Section tone="white" id="methods" labelledBy="methods-title">
    <SectionHead
      titleId="methods-title"
      title={methodsTitle(methodPanels.length)}
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
