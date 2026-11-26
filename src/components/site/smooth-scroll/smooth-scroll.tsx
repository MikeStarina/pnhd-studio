'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import 'lenis/dist/lenis.css';

type LenisListener = (lenis: Lenis | null) => void;
const lenisListeners = new Set<LenisListener>();
let currentLenis: Lenis | null = null;

const publishLenis = (lenis: Lenis | null) => {
  currentLenis = lenis;
  lenisListeners.forEach((listener) => listener(lenis));
};

/** Подписка на плавный скролл: сразу и при каждой смене; null — плавного скролла нет (конструктор, reduced motion). */
export const subscribeLenis = (listener: LenisListener): (() => void) => {
  lenisListeners.add(listener);
  listener(currentLenis);
  return () => {
    lenisListeners.delete(listener);
  };
};

/**
 * Плавный скролл страниц сайта (Lenis): колесо мыши двигает страницу с инерцией, а не скачками по ~100 px,
 * поэтому всё, что привязано к скроллу, едет ровно. Тачскрин остаётся нативным, а тачпад Mac шлёт те же
 * события, что колесо, и сглаживается тоже — отличить его надёжно нельзя.
 * Выключен в конструкторе, личном кабинете и на входе — там свои области прокрутки и жесты холста —
 * и при reduced motion. Пока что-то запирает страницу (меню, фильтры, окна ставят body overflow: hidden),
 * Lenis стоит, чтобы страница под ними не ехала.
 */
const SmoothScroll: React.FC = () => {
  const pathname = usePathname() ?? '';
  const off =
    pathname.includes('/constructor') || pathname.startsWith('/profile') || pathname.startsWith('/auth');

  useEffect(() => {
    if (off || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let lenis: Lenis | null = null;
    let alive = true;

    // Библиотека нужна только на страницах сайта — грузим её по месту
    import('lenis').then(({ default: LenisClass }) => {
      if (!alive) return;
      // stopInertiaOnNavigate: клик по ссылке гасит инерцию, иначе новая страница доезжает вниз.
      // Якоря ведёт AnchorLinks, а не Lenis: он прокручивает без «#…» в адресе
      lenis = new LenisClass({ autoRaf: true, allowNestedScroll: true, stopInertiaOnNavigate: true });
      syncLock();
      publishLenis(lenis);
    });

    // Меню, модалки и фильтры блокируют прокрутку через overflow у html, а не у body: body с overflow hidden
    // становится своим контейнером прокрутки, и липкая шапка уезжает за верх экрана вместе со страницей
    const syncLock = () => {
      if (!lenis) return;
      if (document.documentElement.style.overflow === 'hidden') lenis.stop();
      else lenis.start();
    };
    const lock = new MutationObserver(syncLock);
    lock.observe(document.documentElement, { attributes: true, attributeFilter: ['style'] });

    return () => {
      alive = false;
      lock.disconnect();
      if (lenis) publishLenis(null);
      lenis?.destroy();
    };
  }, [off]);

  return null;
};

export default SmoothScroll;
