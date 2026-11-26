import React from 'react';
import BrandMark, { markAt } from '../../site/brand-mark/brand-mark';
import styles from './marquee.module.css';

/**
 * Бегущая строка во всю ширину экрана: слова через фирменные маркировки — у каждого слова своя.
 * Два одинаковых трека подряд дают бесшовный круг; второй скрыт от экранных дикторов.
 */
const Marquee: React.FC<{ items: string[]; tone: 'white' | 'black' | 'lime' | 'blue'; label: string }> = ({ items, tone, label }) => {
  const track = (hidden: boolean) => (
    <ul className={styles.track} aria-hidden={hidden || undefined}>
      {[...items, ...items].map((item, i) => (
        <li key={i} className={styles.item}>
          {item}
          <BrandMark name={markAt(i)} size="0.9em" />
        </li>
      ))}
    </ul>
  );

  return (
    <div
      className={styles.marquee}
      data-tone={tone}
      data-surface={tone === 'black' ? 'dark' : undefined}
      role="region"
      aria-label={label}
    >
      {track(false)}
      {track(true)}
    </div>
  );
};

export default Marquee;
