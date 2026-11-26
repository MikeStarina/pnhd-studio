'use client';
import { useEffect } from 'react';
import { rememberEntry, track, type SiteGoal } from './analytics';

/** Где на странице стоит ссылка: меню, шапка, подвал (метка data-source), иначе — по адресу страницы. */
const sourceOf = (link: HTMLAnchorElement) => {
  // Меню-бургер лежит внутри шапки — проверяем его раньше метки шапки
  if (link.closest('#site-menu')) return 'menu';
  // Шапку и подвал сайта узнаём по метке data-source, а не по тегу: <header> есть и у шапок секций
  const marked = link.closest<HTMLElement>('[data-source]')?.dataset.source;
  if (marked) return marked;
  const path = window.location.pathname;
  if (path === '/') return 'home';
  if (path === '/shop') return 'catalog';
  if (path.startsWith('/shop/')) return 'product';
  return path.split('/')[1] || 'home';
};

/** Тип клика по ссылке → цель. Ссылку на конструктор разбирает отдельно goalFor. */
const LINK_GOALS: Array<[test: (url: URL) => boolean, goal: SiteGoal]> = [
  [(u) => u.protocol === 'tel:', 'phone_click'],
  [(u) => u.protocol === 'mailto:', 'email_click'],
  [(u) => u.hostname === 't.me' || u.hostname === 'telegram.me', 'telegram_click'],
  [(u) => u.hostname === 'wa.me', 'whatsapp_click'],
  [(u) => u.hostname === 'vk.com', 'vk_click'],
];

/**
 * Цели сайта по кликам на ссылки — одним слушателем на странице, без правок в каждом компоненте:
 * «Нанести принт» (ссылка на конструктор с ?product=), телефон, почта, мессенджеры, корзина.
 * Источник клика запоминается и уходит в цели конструктора и в заявку.
 */
export function SiteGoals() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const link = (event.target as Element | null)?.closest?.('a');
      if (!link?.href) return;
      let url: URL;
      try {
        url = new URL(link.href, window.location.href);
      } catch {
        return;
      }
      const source = sourceOf(link);
      const block = link.closest('section[id]')?.id;
      const page = window.location.pathname;

      if (url.origin === window.location.origin && url.pathname === '/constructor') {
        const product = url.searchParams.get('product') ?? undefined;
        rememberEntry({ source, product, block });
        track(product ? 'print_cta_click' : 'cta_constructor_click', { source, block, page, product });
        return;
      }
      if (url.origin === window.location.origin && url.pathname === '/cart') {
        track('cart_open', { source, page });
        return;
      }
      const goal = LINK_GOALS.find(([test]) => test(url))?.[1];
      if (goal) track(goal, { source, page });
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);
  return null;
}
