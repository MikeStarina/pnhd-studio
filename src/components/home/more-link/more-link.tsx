import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './more-link.module.css';

/**
 * Кнопка-таблетка «Весь каталог», «Все кейсы» со стрелкой: ведёт на полный список раздела. Цвета берёт от тона секции.
 * `size="l"` — крупная, рядом с заголовком секции: стрелка в салатовом круге.
 */
const MoreLink: React.FC<{ href: string; size?: 'l'; children: React.ReactNode }> = ({ href, size, children }) => (
  <Link href={href} className={styles.link} data-size={size}>
    {children}
    {size === 'l' ? (
      <span className={styles.arrow}>
        <Icon name="arrowRight" size={24} stroke={2} />
      </span>
    ) : (
      <Icon name="arrowRight" size="1.25em" stroke={2} />
    )}
  </Link>
);

export default MoreLink;
