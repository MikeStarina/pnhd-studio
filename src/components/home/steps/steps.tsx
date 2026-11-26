import React from 'react';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './steps.module.css';

export type Step = { title: string; text: React.ReactNode };

/** Шаги по порядку — путь заказа: номер в круге, линия со стрелкой к следующему шагу, название и пояснение. */
const Steps: React.FC<{ items: Step[] }> = ({ items }) => (
  <ol className={styles.list} data-reveal-group>
    {items.map((item, i) => (
      <li key={item.title} className={styles.item}>
        <div className={styles.track} aria-hidden="true">
          <span className={styles.number}>{String(i + 1).padStart(2, '0')}</span>
          {i < items.length - 1 && (
            <span className={styles.line}>
              <Icon name="arrowRight" size="var(--step-arrow)" stroke={2} />
            </span>
          )}
        </div>
        <h3 className={styles.title}>{item.title}</h3>
        <p className={styles.text}>{item.text}</p>
      </li>
    ))}
  </ol>
);

export default Steps;
