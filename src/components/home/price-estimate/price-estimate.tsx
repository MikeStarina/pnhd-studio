import React from 'react';
import Section from '../section/section';
import PriceTable from './price-table';
import PriceForm from './price-form';
import styles from './price-estimate.module.css';

const PriceEstimate: React.FC = () => (
  <Section tone="white" id="price" labelledBy="price-title">
    <div className={styles.shell} data-reveal>
      <div className={styles.prices}>
        <h2 id="price-title" className={styles.title}>
          Цены на печать
        </h2>
        <PriceTable />
      </div>
      <PriceForm />
    </div>
  </Section>
);

export default PriceEstimate;
