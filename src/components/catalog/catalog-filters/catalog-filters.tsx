'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/features/constructor/ui/icons';
import { track } from '@/components/site/analytics';
import {
  buildQuery,
  countActive,
  emptyFilters,
  printableOptions,
  sortOptions,
  toggleValue,
  type FilterOptions,
  type Filters,
  type ListKey,
} from '../filters';
import styles from './catalog-filters.module.css';

const listGroups = [
  { key: 'categories', title: 'Для кого' },
  { key: 'sizes', title: 'Размер' },
  { key: 'colors', title: 'Цвет' },
  { key: 'tags', title: 'Метки' },
] as const;

const focusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Кнопка «Фильтры» и боковая панель. Выбор сразу меняет адрес страницы, а сервер присылает новый список;
 * пока он идёт, выбранное уже подсвечено, а сетка бледнеет (метка data-pending на #catalog-results).
 */
const CatalogFilters: React.FC<{
  path: string;
  filters: Filters;
  options: FilterOptions;
  /** Число моделей после фильтров, уже со словом: «12 моделей» */
  countLabel: string;
}> = ({ path, filters, options, countLabel }) => {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);
  const query = buildQuery(filters);
  const active = countActive(draft);

  // Пока ответ сервера в пути, выбор держит черновик: иначе ответ на первое нажатие на миг откатит второе
  useEffect(() => {
    if (!pending) setDraft(filters);
  }, [query, pending]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    document.getElementById('catalog-results')?.toggleAttribute('data-pending', pending);
  }, [pending]);

  useEffect(() => {
    if (!open) {
      if (wasOpen.current) triggerRef.current?.focus();
      wasOpen.current = false;
      return;
    }
    wasOpen.current = true;
    panelRef.current?.focus();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return setOpen(false);
      if (event.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusable));
      const [firstItem, lastItem] = [items[0], items[items.length - 1]];
      const current = document.activeElement;
      if (event.shiftKey && (current === firstItem || current === panelRef.current)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && current === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const apply = (next: Filters) => {
    setDraft(next);
    startTransition(() => router.replace(`${path}${buildQuery(next)}`, { scroll: false }));
  };

  const toggle = (key: ListKey, value: string) => {
    if (!draft[key].includes(value)) track('catalog_filter_apply', { filter: key, value, page: path });
    apply({ ...draft, [key]: toggleValue(draft[key], value) });
  };

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className={styles.trigger}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="catalog-filters"
        onClick={() => setOpen(true)}
      >
        <Icon name="filter" size={20} />
        Фильтры
        {active > 0 && (
          <span className={styles.count}>
            <span className="visually-hidden">выбрано: </span>
            {active}
          </span>
        )}
      </button>

      <div className={styles.backdrop} data-open={open || undefined} onClick={() => setOpen(false)} aria-hidden="true" />

      <div
        id="catalog-filters"
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-filters-title"
        tabIndex={-1}
        className={styles.panel}
        data-open={open || undefined}
      >
        <div className={styles.head}>
          <h2 id="catalog-filters-title" className={styles.title}>
            Фильтры
          </h2>
          <button type="button" className={styles.close} aria-label="Закрыть фильтры" onClick={() => setOpen(false)}>
            <Icon name="close" size={20} stroke={2} />
          </button>
        </div>

        <div className={styles.body} data-lenis-prevent>
          {listGroups.map(({ key, title }) =>
            options[key].length > 0 ? (
              <fieldset key={key} className={styles.group}>
                <legend className={styles.legend}>{title}</legend>
                <div className={styles.chips}>
                  {options[key].map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      className={styles.chip}
                      aria-pressed={draft[key].includes(option.value)}
                      onClick={() => toggle(key, option.value)}
                    >
                      {key === 'colors' && (
                        <span className={styles.dot} style={{ '--dot': option.hex ?? 'var(--color-line)' } as React.CSSProperties} />
                      )}
                      {option.label}
                    </button>
                  ))}
                </div>
              </fieldset>
            ) : null,
          )}

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Вещи</legend>
            <div className={styles.chips}>
              {printableOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.chip}
                  aria-pressed={draft.printable === option.value}
                  onClick={() => {
                    track('catalog_filter_apply', { filter: 'printable', value: option.value, page: path });
                    apply({ ...draft, printable: option.value });
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className={styles.group}>
            <legend className={styles.legend}>Сортировка</legend>
            <div className={styles.chips}>
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={styles.chip}
                  aria-pressed={draft.priceSort === option.value}
                  onClick={() => {
                    track('catalog_filter_apply', { filter: 'priceSort', value: option.value, page: path });
                    apply({ ...draft, priceSort: option.value });
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </fieldset>
        </div>

        <div className={styles.foot}>
          <button
            type="button"
            className={styles.reset}
            disabled={active === 0}
            onClick={() => apply({ ...emptyFilters })}
          >
            Сбросить
          </button>
          <button type="button" className={styles.show} aria-busy={pending} onClick={() => setOpen(false)}>
            {pending ? 'Обновляем…' : `Показать ${countLabel}`}
          </button>
        </div>
      </div>
    </>
  );
};

export default CatalogFilters;
