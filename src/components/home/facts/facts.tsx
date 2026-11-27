import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './facts.module.css';

export type Fact = {
  value: string;
  prefix?: string;
  unit?: string;
  text: React.ReactNode;
  link?: { href: string; label: string };
};

/** Обещания «Студии» — одна панель с колонками: крупное число с мелкими «от»/«₽», подпись и, если есть, ссылка. */
const Facts: React.FC<{ items: Fact[] }> = ({ items }) => (
  <ul className={styles.list} data-reveal-group>
    {items.map((item, i) => (
      <li key={i} className={styles.item}>
        <p className={styles.value}>
          {item.prefix && <span className={styles.affix}>{item.prefix}</span>}
          {item.value}
          {item.unit && <span className={styles.affix}>{item.unit}</span>}
        </p>
        <p className={styles.text}>{item.text}</p>
        {item.link && (
          <Link href={item.link.href} className={styles.link}>
            {item.link.label}
            <Icon name="arrowRight" size="1.25em" stroke={2} />
          </Link>
        )}
      </li>
    ))}
  </ul>
);

export default Facts;
