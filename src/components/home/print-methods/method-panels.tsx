'use client';

import React, { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import { HOVER_INTENT_MS } from '@/styles/motion';
import type { MethodPanelData } from './data';
import styles from './print-methods.module.css';

/**
 * Методы — панели в один ряд (на телефоне и планшете — столбиком). Открыта одна: фото, назначение, факты.
 * Мышь раскрывает панель наведением, клавиатура — фокусом, поэтому нажатие сразу ведёт на страницу метода.
 * Касание сначала раскрывает свёрнутую панель и только вторым касанием открывает страницу.
 */

const MethodPanels: React.FC<{ panels: MethodPanelData[] }> = ({ panels }) => {
  const [active, setActive] = useState(0);
  const hoverTimer = useRef(0);

  useEffect(() => () => window.clearTimeout(hoverTimer.current), []);

  const hoverOpen = (event: React.PointerEvent, i: number) => {
    if (event.pointerType !== 'mouse') return;
    window.clearTimeout(hoverTimer.current);
    hoverTimer.current = window.setTimeout(() => setActive(i), HOVER_INTENT_MS);
  };

  return (
    <ul className={styles.panels} data-reveal-group="rise" aria-label="Способы печати">
      {panels.map((panel, i) => (
        <li
          key={panel.slug}
          className={styles.panel}
          data-tone={panel.tone}
          data-open={i === active || undefined}
          data-long={panel.longName || undefined}
          onPointerEnter={(event) => hoverOpen(event, i)}
          onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
        >
          <Link
            href={`/methods/${panel.slug}`}
            className={styles.link}
            // Раскрывает только фокус с клавиатуры: касание тоже ставит фокус, и иначе первое же касание открывало бы страницу
            onFocus={(event) => event.currentTarget.matches(':focus-visible') && setActive(i)}
            onClick={(event) => {
              if (i === active) return;
              event.preventDefault();
              setActive(i);
            }}
          >
            <Image src={panel.image} alt="" fill sizes="(min-width: 1024px) 50vw, 100vw" className={styles.photo} />
            <span className={styles.number} aria-hidden>{String(i + 1).padStart(2, '0')}</span>
            <span className={styles.spine} aria-hidden>
              <span className={styles.spineName}>{panel.name}</span>
              <span className={styles.spineRun}>{panel.minRun}</span>
            </span>

            <span className={styles.body}>
              <span className={styles.more} aria-hidden>
                Подробнее&nbsp;<Icon name="arrowRight" size="1.25em" stroke={2} />
              </span>
              <span className={styles.content}>
                <span className={styles.best}>{panel.best}</span>
                <span className={styles.name}>{panel.name}</span>
                <span className={styles.facts}>
                  <span className={styles.run}>{panel.minRun}</span>
                  {panel.facts.map((fact) => (
                    <span key={fact} className={styles.fact}>
                      {fact}
                    </span>
                  ))}
                  {panel.limits.map((limit) => (
                    <span key={limit} className={styles.limit}>
                      {limit}
                    </span>
                  ))}
                </span>
              </span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
};

export default MethodPanels;
