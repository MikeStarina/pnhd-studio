'use client';
import React, { useEffect, useRef } from 'react';
import Link from 'next/link';
import { animate, stagger } from 'motion';
import { EASE_OUT_SOFT, POP_FROM, SPRING_BOUNCE_ELASTIC, SPRING_VISUAL_PART, motionPixels, motionSeconds } from '@/styles/motion';
import { Icon } from '@/features/constructor/ui/icons';
import MoreLink from '@/components/home/more-link/more-link';
import styles from './status-screen.module.css';

type Action = { label: string; href: string } | { label: string; onClick: () => void };

/**
 * Экран-состояние на всю страницу: «Спасибо за заказ», ошибка, 404.
 * Первое действие — главное: переход — белая кнопка со стрелкой (home/more-link), действие — салатовая без стрелки.
 * Остальные — контурные. Знак: успех — галочка, сбой — восклицательный.
 * Появление — Motion: карточка поднимается, части идут по очереди, галочка успеха садится на пружине.
 * До запуска скрипта части прячет CSS — только когда скрипты на странице работают (класс js-reveal) и движение не уменьшено;
 * иначе экран виден сразу и здесь ничего не анимируется.
 */
const StatusScreen: React.FC<{
  tone: 'success' | 'problem';
  title: React.ReactNode;
  text: React.ReactNode;
  note?: React.ReactNode;
  actions: Action[];
  /** Блок под карточкой (например, состав заказа на «Спасибо»): идёт по той же сетке страницы. */
  children?: React.ReactNode;
}> = ({ tone, title, text, note, actions, children }) => {
  const card = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const root = card.current;
    const html = document.documentElement.classList;
    if (!root || !html.contains('js-reveal') || html.contains('reveal-all')) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const rise = { opacity: [0, 1], y: [motionPixels('--reveal-shift'), 0] };
    const step = motionSeconds('--reveal-stagger');
    const badge = root.querySelector('[data-badge]')!;
    const running = [
      animate(root, rise, { duration: motionSeconds('--duration-reveal'), ease: EASE_OUT_SOFT }),
      // Пружина — только на размер и поворот: прозрачность на ней проскакивала бы за единицу и мигала
      animate(badge, tone === 'success' ? { opacity: [0, 1] } : rise, { duration: motionSeconds('--duration-reveal-part'), ease: EASE_OUT_SOFT, delay: step }),
      ...(tone === 'success'
        ? [animate(badge, { scale: [POP_FROM.scale, 1], rotate: [POP_FROM.rotate, 0] }, {
            type: 'spring', visualDuration: motionSeconds('--duration-celebrate') * SPRING_VISUAL_PART, bounce: SPRING_BOUNCE_ELASTIC, delay: step,
          })]
        : []),
      animate(root.querySelectorAll('[data-part]'), rise, {
        duration: motionSeconds('--duration-reveal-part'), ease: EASE_OUT_SOFT, delay: stagger(step, { startDelay: step * 2 }),
      }),
    ];
    return () => running.forEach((animation) => animation.stop());
  }, [tone]);

  return (
    <section className={styles.page}>
      <div ref={card} className={styles.card}>
        <span className={styles.badge} data-badge aria-hidden="true" data-tone={tone}>
          <Icon name={tone === 'success' ? 'checkMark' : 'alert'} size={32} stroke={2} />
        </span>
        <h1 className={styles.title} data-part>{title}</h1>
        <p className={styles.text} data-part>{text}</p>
        {note && <p className={styles.note} data-part>{note}</p>}
        <div className={styles.actions} data-part>
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
      {children}
    </section>
  );
};

export default StatusScreen;
