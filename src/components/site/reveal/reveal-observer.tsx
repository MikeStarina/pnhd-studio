'use client';
import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Появление блоков при скролле. Разметка помечает элементы:
 * - `data-reveal` — элемент проявляется сам;
 * - `data-reveal-group` — его прямые потомки проявляются друг за другом (номер → `--i`, задержка в CSS).
 *   Номер считается среди потомков, которые показались вместе, а не во всей группе: иначе в длинной сетке каталога
 *   карточка, до которой долистали, ждала бы десятки шагов. Шагов не больше MAX_STEP.
 * Когда элемент показался, метки снимаются после анимации — у элемента снова работают его собственные стили
 * (наведение, трансформации). Новые элементы (вкладки, подгрузка) подхватываются автоматически.
 */
const MAX_STEP = 6;

const RevealObserver: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    const root = document.documentElement;
    (window as unknown as { __revealReady?: boolean }).__revealReady = true;

    // Метки снимаем, когда закончился самый долгий переход: у пружин свойства идут с разной длительностью
    const finish = (el: HTMLElement) => {
      const style = getComputedStyle(el);
      const delays = style.transitionDelay.split(',').map(parseFloat);
      const total = Math.max(...style.transitionDuration.split(',').map((d, i) => parseFloat(d) + (delays[i % delays.length] ?? 0)));
      window.setTimeout(() => {
        el.removeAttribute('data-reveal');
        el.removeAttribute('data-revealed');
        el.style.removeProperty('--i');
      }, total * 1000 + 50);
    };

    // Сколько потомков каждой группы уже запущено в текущей пачке IntersectionObserver
    let step = new Map<Element, number>();

    const reveal = (el: HTMLElement) => {
      if (el.hasAttribute('data-revealed')) return;
      io.unobserve(el);
      const group = el.parentElement;
      if (group?.hasAttribute('data-reveal-group')) {
        const k = step.get(group) ?? 0;
        step.set(group, k + 1);
        el.style.setProperty('--i', String(Math.min(k, MAX_STEP)));
      }
      el.setAttribute('data-revealed', '');
      finish(el);
    };

    const io = new IntersectionObserver(
      (entries) => {
        step = new Map();
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          reveal(el);
          // Горизонтальные ленты: карточки за правым краем экрана проявляются вместе с видимыми, а не при пролистывании
          if (!el.parentElement?.hasAttribute('data-reveal-group')) return;
          Array.from(el.parentElement.children).forEach((sibling) => {
            if (sibling instanceof HTMLElement && sibling.getBoundingClientRect().right > window.innerWidth) reveal(sibling);
          });
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 },
    );

    const scan = () => {
      document.querySelectorAll<HTMLElement>('[data-reveal-group]').forEach((group) => {
        Array.from(group.children).forEach((child, i) => {
          if (!(child instanceof HTMLElement) || child.hasAttribute('data-reveal-done')) return;
          child.setAttribute('data-reveal-done', '');
          child.setAttribute('data-reveal', '');
          // До появления --i задаёт только разброс стартовой позы (наклон веера) — по кругу, чтобы не расти с длиной группы
          child.style.setProperty('--i', String(i % (MAX_STEP + 1)));
        });
      });
      document.querySelectorAll<HTMLElement>('[data-reveal]:not([data-revealed])').forEach((el) => io.observe(el));
    };

    scan();
    root.classList.add('js-reveal');
    // Живые блоки (витрина конструктора, смена фото) меняют разметку десятки раз в секунду:
    // пересматриваем страницу не чаще раза за кадр, а не на каждое изменение
    let pending = 0;
    const mo = new MutationObserver(() => {
      if (!pending) pending = requestAnimationFrame(() => {
        pending = 0;
        scan();
      });
    });
    mo.observe(document.body, { childList: true, subtree: true });
    return () => {
      io.disconnect();
      mo.disconnect();
      cancelAnimationFrame(pending);
    };
  }, [pathname]);

  return null;
};

export default RevealObserver;
