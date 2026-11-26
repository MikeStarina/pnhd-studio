import React from 'react';
import BrandMark, { markAt } from '../../site/brand-mark/brand-mark';
import styles from './sheet-cut.module.css';

/**
 * Стык двух светлых секций, оформленный как край печатного листа: фирменные маркировки по краям сетки,
 * тонкая линия и шкала фирменных цветов посередине. Чисто декоративный — от экранных дикторов скрыт.
 * index — номер стыка на странице: у каждого стыка своя пара знаков, слева и справа разные.
 */
const SheetCut: React.FC<{ index: number }> = ({ index }) => (
  <div className={styles.cut} aria-hidden="true">
    <div className={styles.inner} data-reveal>
      <BrandMark name={markAt(index * 2)} size="var(--cut-mark)" />
      <span className={styles.line} />
      <span className={styles.swatches}>
        <span className={styles.swatch} data-color="ink" />
        <span className={styles.swatch} data-color="blue" />
        <span className={styles.swatch} data-color="lime" />
        <span className={styles.swatch} data-color="white" />
      </span>
      <span className={styles.line} />
      <BrandMark name={markAt(index * 2 + 1)} size="var(--cut-mark)" />
    </div>
  </div>
);

export default SheetCut;
