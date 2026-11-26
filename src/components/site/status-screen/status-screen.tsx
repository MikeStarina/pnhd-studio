import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './status-screen.module.css';

type Action = { label: string; href: string } | { label: string; onClick: () => void };

/**
 * Экран-состояние на всю страницу: «Спасибо за заказ», ошибка, 404.
 * Первое действие — главное (салатовое), остальные — контурные. Знак: успех — галочка, сбой — восклицательный.
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
          const content = (
            <>
              {action.label}
              {i === 0 && <Icon name="arrowRight" size="1.25em" stroke={2} />}
            </>
          );
          return 'href' in action ? (
            <Link key={action.label} href={action.href} className={className}>{content}</Link>
          ) : (
            <button key={action.label} type="button" onClick={action.onClick} className={className}>{content}</button>
          );
        })}
      </div>
    </div>
  </section>
);

export default StatusScreen;
