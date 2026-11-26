import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './more-link.module.css';

/** Кнопка-таблетка «Весь каталог», «Все кейсы» со стрелкой: ведёт на полный список раздела. Цвета берёт от тона секции. */
const MoreLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <Link href={href} className={styles.link}>
    {children}
    <Icon name="arrowRight" size="1.25em" stroke={2} />
  </Link>
);

export default MoreLink;
