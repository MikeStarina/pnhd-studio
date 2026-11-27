import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import MoreLink from '@/components/home/more-link/more-link';
import styles from './status-screen.module.css';

type Action = { label: string; href: string } | { label: string; onClick: () => void };

/**
 * Экран-состояние на всю страницу: «Спасибо за заказ», ошибка, 404.
 * Первое действие — главное: переход — белая кнопка со стрелкой (home/more-link), действие — салатовая без стрелки.
 * Остальные — контурные. Знак: успех — галочка, сбой — восклицательный.
 */
const StatusScreen: React.FC<{
  tone: 'success' | 'problem';
  title: React.ReactNode;
  text: React.ReactNode;
  note?: React.ReactNode;
  actions: Action[];
}> = ({ tone, title, text, note, actions }) => (
  <section className={styles.page}>
    <div className={styles.card}>
      <span className={styles.badge} data-tone={tone} aria-hidden="true">
        <Icon name={tone === 'success' ? 'checkMark' : 'alert'} size={32} stroke={2} />
      </span>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.text}>{text}</p>
      {note && <p className={styles.note}>{note}</p>}
      <div className={styles.actions}>
        {actions.map((action, i) => {
          const className = i === 0 ? styles.primary : styles.secondary;
          if (!('href' in action))
            return (
              <button key={action.label} type="button" onClick={action.onClick} className={className}>
                {action.label}
              </button>
            );
          // Главный переход — общая кнопка со стрелкой; слот растягивает её на телефоне
          return i === 0 ? (
            <div key={action.label} className={styles.slot}>
              <MoreLink href={action.href} onDark>
                {action.label}
              </MoreLink>
            </div>
          ) : (
            <Link key={action.label} href={action.href} className={className}>
              {action.label}
            </Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default StatusScreen;
