import React from 'react';
import styles from './brand-mark.module.css';

/** Фирменные маркировки из брендбука (графика «иголок»). Файлы — public/brand/marks. */
export const brandMarks = [
  'crosshair',
  'target',
  'star-8',
  'web',
  'plus-dot',
  'burst',
  'crosshair-ring',
  'star-dot',
  'burst-skew',
] as const;

export type BrandMarkName = (typeof brandMarks)[number] | 'registered';

/** Маркировка по номеру: соседние элементы получают разные знаки, а порядок всегда один и тот же. */
export const markAt = (index: number): BrandMarkName => brandMarks[index % brandMarks.length];

/** Маркировка цветом текста (или --mark-color), размер — size в px или любая длина CSS. */
const BrandMark: React.FC<{ name: BrandMarkName; size?: number | string }> = ({ name, size = '1em' }) => (
  <span
    className={styles.mark}
    aria-hidden="true"
    style={
      {
        '--mark': `url('/brand/marks/${name}.svg')`,
        '--mark-size': typeof size === 'number' ? `${size}px` : size,
      } as React.CSSProperties
    }
  />
);

export default BrandMark;
