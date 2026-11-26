'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './facts.module.css';

export type Fact = {
  value: string;
  prefix?: string;
  unit?: string;
  text: React.ReactNode;
  link?: { href: string; label: string };
  /** Главное обещание — чёрная карточка с салатовыми «от»/«₽», пока не выбрали другое */
  highlight?: boolean;
};

/**
 * Обещания «Студии», как поля печатного листа: линия сверху, крупное число с мелкими «от»/«₽», подпись и, если есть, ссылка.
 * Одно обещание — чёрной карточкой: сначала главное, потом то, на которое последним навели мышь или перешли с клавиатуры.
 * Выбор держится, когда курсор ушёл, — карточка не прыгает обратно на главную.
 */
const Facts: React.FC<{ items: Fact[] }> = ({ items }) => {
  const [active, setActive] = useState(() => Math.max(0, items.findIndex((item) => item.highlight)));

  return (
    <ul className={styles.list} data-reveal-group>
      {items.map((item, i) => (
        <li
          key={i}
          className={styles.item}
          data-highlight={item.highlight || undefined}
          data-active={i === active || undefined}
          // Только мышь: на тачскрине касание при прокрутке не должно перекрашивать карточки
          onPointerEnter={(event) => event.pointerType === 'mouse' && setActive(i)}
          // Только фокус с клавиатуры: тап по ссылке тоже ставит фокус, и на телефоне карточки перекрашивались с прыжком текста
          onFocus={(event) => event.target.matches(':focus-visible') && setActive(i)}
        >
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
};

export default Facts;
