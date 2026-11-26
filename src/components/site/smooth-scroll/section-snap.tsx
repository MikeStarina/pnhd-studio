'use client';

import { useEffect } from 'react';
import type Lenis from 'lenis';
import { SECTION_SNAP } from '@/styles/motion';
import { subscribeLenis } from './smooth-scroll';

/** Секции страницы, к которым доводится прокрутка: прямые дети обёртки с data-section-snap. */
const SECTIONS = '[data-section-snap] > section';

/**
 * Мягкая привязка секций к шапке: остановил колесо или тачпад рядом с началом секции — страница доезжает,
 * и содержимое секции встаёт под шапку с обычным зазором. Обычные секции только подправляются, если почти попал;
 * секция с id из strong доводится уверенно (порог больше). Далеко от начала прокрутку не трогает.
 * Расстояние считается от места, где страница действительно остановилась (инерция Lenis закончилась),
 * а не от прогноза по последнему рывку колеса: прогноз после быстрой прокрутки улетал за порог, и доводки не было.
 * Работает только с плавным скроллом (Lenis): на тачскрине, при reduced motion и без Lenis прокрутка обычная.
 */
const SectionSnap: React.FC<{ strong?: string }> = ({ strong }) => {
  useEffect(() => {
    let stop: (() => void) | undefined;

    const unsubscribe = subscribeLenis((lenis) => {
      stop?.();
      stop = lenis ? attach(lenis, strong) : undefined;
    });

    return () => {
      unsubscribe();
      stop?.();
    };
  }, [strong]);

  return null;
};

export default SectionSnap;

type Point = { value: number; strong: boolean };

function attach(lenis: Lenis, strong: string | undefined) {
  let points: Point[] = [];
  // Двигали колесом или тачпадом с прошлой остановки; клавиатура, полоса прокрутки и тачскрин привязку не включают
  let wheelMoved = false;
  let timer: ReturnType<typeof setTimeout> | undefined;

  // Точка привязки — начало содержимого секции (верх + внутренний отступ) ровно через --header-gap под шапкой,
  // как первый блок любой страницы. Секция с полосой сама держит поле под шапку: её верх встаёт к верху окна.
  // Первую секцию не привязываем: её место — верх страницы. Низ высоких секций точкой не делаем: заголовок уезжал под шапку
  const update = () => {
    const root = getComputedStyle(document.documentElement);
    const offset =
      (parseFloat(root.getPropertyValue('--header-bar-height')) || 0) + (parseFloat(root.getPropertyValue('--promo-bar-space')) || 0) + (parseFloat(root.getPropertyValue('--header-gap')) || 0);
    points = [...document.querySelectorAll<HTMLElement>(SECTIONS)].slice(1).map((section) => {
      const top = section.getBoundingClientRect().top + window.scrollY;
      const value = section.hasAttribute('data-strip') ? top : top + parseFloat(getComputedStyle(section).paddingTop) - offset;
      return { value: Math.max(0, Math.round(value)), strong: section.id === strong };
    });
  };

  const settle = () => {
    if (!wheelMoved || lenis.isScrolling) return;
    wheelMoved = false;
    const scroll = lenis.scroll;
    const nearest = points.reduce<Point | null>(
      (best, point) => (!best || Math.abs(point.value - scroll) < Math.abs(best.value - scroll) ? point : best),
      null,
    );
    if (!nearest) return;
    const distance = Math.abs(nearest.value - scroll);
    const threshold = (parseFloat(nearest.strong ? SECTION_SNAP.strongThreshold : SECTION_SNAP.threshold) / 100) * window.innerHeight;
    if (distance < 1 || distance > threshold) return;
    lenis.scrollTo(nearest.value, { duration: SECTION_SNAP.duration, easing: SECTION_SNAP.easing, userData: { initiator: 'snap' } });
  };

  // Каждый кадр движения откладывает проверку: она срабатывает после паузы, когда инерция закончилась
  const onScroll = () => {
    if (lenis.userData?.initiator === 'snap') return;
    clearTimeout(timer);
    timer = setTimeout(settle, SECTION_SNAP.debounce);
  };

  const onInput = ({ event }: { event: Event }) => {
    wheelMoved = event.type === 'wheel';
  };

  update();
  const resize = new ResizeObserver(update);
  resize.observe(document.body);
  window.addEventListener('resize', update);
  const offScroll = lenis.on('scroll', onScroll);
  const offInput = lenis.on('virtual-scroll', onInput);

  return () => {
    clearTimeout(timer);
    resize.disconnect();
    window.removeEventListener('resize', update);
    offScroll();
    offInput();
  };
}
