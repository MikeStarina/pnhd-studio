'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import { subscribeLenis } from './smooth-scroll';

/**
 * Якоря без следа в адресе: ссылка «/#contacts» на главной прокручивает к блоку, но «#…» в адресную строку не попадает,
 * иначе после обновления страница открывается сразу на этом блоке. Пришли с другой страницы по «/#contacts» —
 * прокручиваем к блоку и убираем якорь из адреса (как ?product в конструкторе).
 * Прокрутка — через Lenis, если он включён, иначе нативная (плавная, если человек не просил меньше движения).
 */
const AnchorLinks: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    let lenis: Lenis | null = null;
    const unsubscribe = subscribeLenis((next) => {
      lenis = next;
    });

    // Захват на document: срабатывает раньше Link из Next, и тот видит defaultPrevented и не пишет «#…» в историю
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = (event.target as Element | null)?.closest?.('a[href*="#"]');
      if (!(link instanceof HTMLAnchorElement) || link.target === '_blank') return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname !== location.pathname || !url.hash) return;
      const target = document.getElementById(decodeURIComponent(url.hash.slice(1)));
      if (!target) return;
      event.preventDefault();
      // Через кадр: пункт меню-бургера сначала закрывает меню, и Lenis снова запускается — запуск обрывает начатую прокрутку
      requestAnimationFrame(() => scrollToBlock(target, lenis));
    };

    document.addEventListener('click', onClick, { capture: true });
    return () => {
      document.removeEventListener('click', onClick, { capture: true });
      unsubscribe();
    };
  }, []);

  // Переход с другой страницы: Next доводит до блока по якорю, но по сдвинутому проявлением положению — ставим точно и убираем якорь
  useEffect(() => {
    if (!location.hash) return;
    const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
    if (!target) return;
    const frame = requestAnimationFrame(() => {
      window.scrollTo({ top: blockTop(target), behavior: 'instant' });
      // state = null: со своим состоянием (__NA) Next пропускает вызов и позже возвращает «#…» в адрес из своей памяти
      window.history.replaceState(null, '', location.pathname + location.search);
    });
    return () => cancelAnimationFrame(frame);
  }, [pathname]);

  return null;
};

export default AnchorLinks;

function scrollToBlock(target: HTMLElement, lenis: Lenis | null) {
  const top = blockTop(target);
  if (lenis) {
    lenis.scrollTo(top);
    return;
  }
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' });
}

/**
 * Где блок стоит в раскладке, минус его scroll-margin-top. Считаем по offsetTop, а не getBoundingClientRect:
 * блок, который ещё не проявился, сдвинут вниз на --reveal-shift, и прокрутка по нему недоезжала бы на эти пиксели.
 */
function blockTop(target: HTMLElement) {
  let top = 0;
  for (let el: HTMLElement | null = target; el; el = el.offsetParent as HTMLElement | null) top += el.offsetTop;
  return top - (Number.parseFloat(getComputedStyle(target).scrollMarginTop) || 0);
}
