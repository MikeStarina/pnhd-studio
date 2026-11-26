'use client';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import type { MethodItem } from './data';
import styles from './methods-list.module.css';

const pad = (n: number) => String(n).padStart(2, '0');

/**
 * Методы на /methods. Компьютер — бенто как на старом сайте: заголовок в левой верхней ячейке, карточки по местам
 * из данных (area, shape); карточка под курсором — синяя. Планшет — бенто в две колонки.
 * Телефон: заголовок над каруселью белых карточек (синеют только при нажатии), под лентой нажимаемые точки.
 * Каждый метод ведёт на свою страницу; внизу карточки — цена от и тираж. Данные — из ./data (собираются на сервере).
 */
export default function MethodsList({ methods, heading }: { methods: MethodItem[]; heading: ReactNode }) {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState(0);
  // Карточка, к которой лента едет после нажатия на точку: пока не доехала, промежуточные карточки точки не зажигают
  const pending = useRef<number | null>(null);

  // Текущая карточка ленты — только для телефона: на компьютере лента не прокручивается, синим красит наведение (CSS)
  useEffect(() => {
    const list = listRef.current;
    if (!list) return;
    const onScroll = () => {
      const step = (list.firstElementChild as HTMLElement | null)?.offsetWidth ?? 0;
      const gap = parseFloat(getComputedStyle(list).columnGap) || 0;
      if (!step) return;
      // Последняя карточка не доезжает до начала ленты (лента кончается раньше): упёрлись в конец — значит, она
      const atEnd = list.scrollLeft >= list.scrollWidth - list.clientWidth - 1;
      const index = atEnd ? methods.length - 1 : Math.min(methods.length - 1, Math.round(list.scrollLeft / (step + gap)));
      if (pending.current !== null && index !== pending.current && !atEnd) return;
      pending.current = null;
      setActive(index);
    };
    // Палец на ленте прерывает переход к точке: дальше точки снова следуют за лентой
    const onTouch = () => {
      pending.current = null;
    };
    list.addEventListener('scroll', onScroll, { passive: true });
    list.addEventListener('pointerdown', onTouch, { passive: true });
    list.addEventListener('touchstart', onTouch, { passive: true });
    return () => {
      list.removeEventListener('scroll', onScroll);
      list.removeEventListener('pointerdown', onTouch);
      list.removeEventListener('touchstart', onTouch);
    };
  }, [methods.length]);

  const go = (index: number) => {
    pending.current = index;
    setActive(index);
    const item = listRef.current?.children[index] as HTMLElement | undefined;
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // inline: 'start' учитывает scroll-padding ленты, block: 'nearest' не двигает страницу по вертикали
    item?.scrollIntoView({ inline: 'start', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
  };

  return (
    <div className={styles.bento}>
      <div className={styles.head}>{heading}</div>
      {/* role="list": на компьютере у списка display: contents, без роли Safari перестаёт читать его как список */}
      <ul ref={listRef} className={styles.list} role="list">
        {methods.map((method, i) => (
          <li
            key={method.slug}
            className={styles.item}
            data-area={method.area}
            data-shape={method.shape}
          >
            {/* Пустой onTouchStart: без обработчика касания Safari на iPhone не включает :active — синий отклик на нажатие */}
            <Link href={`/methods/${method.slug}`} className={styles.card} onTouchStart={() => {}}>
              <div className={styles.body}>
                <div className={styles.top}>
                  <h2 className={styles.name}>{method.name}</h2>
                  {/* Номер — как у методов на главной: «01» шрифтом заголовков */}
                  <span className={styles.mark} aria-hidden="true">
                    {pad(i + 1)}
                  </span>
                </div>
                <span className={styles.text}>{method.text}</span>
                <span className={styles.price}>
                  <strong className={styles.priceValue}>{method.priceFrom ?? method.minRun}</strong>
                  <span className={styles.priceNote}>
                    {method.priceFrom ? `за принт · тираж ${method.minRun}` : 'цену назовёт менеджер'}
                  </span>
                </span>
              </div>
              <span className={styles.photo}>
                <Image src={method.photo} alt="" fill sizes="(max-width: 599px) 92vw, 33vw" className={styles.img} />
              </span>
            </Link>
          </li>
        ))}
      </ul>

      {/* Под лентой — только точки: где ты в ленте; нажатие переводит к своей карточке */}
      <div className={styles.dots}>
        {methods.map((method, i) => (
          <button
            key={method.slug}
            type="button"
            className={styles.dot}
            onClick={() => go(i)}
            aria-label={`${pad(i + 1)}. ${method.name}`}
            aria-current={i === active || undefined}
          />
        ))}
      </div>
    </div>
  );
}
