import Link from 'next/link';
import { getCategoriesData, getShopData } from '@/app/utils/constants';
import Breadcrumbs, { type BreadcrumbItem } from '@/components/shared-components/breadcrumbs/Breadcrumbs';
import MarkupScript from '@/components/shared-components/markup-script/markup-script';
import Faq from '@/components/home/faq/faq';
import type { FaqItem } from '@/components/home/faq/data';
import SectionHead from '@/components/home/section-head/section-head';
import SheetCut from '@/components/home/sheet-cut/sheet-cut';
import { constructorHref, contactsHref } from '@/components/site/links';
import { Icon } from '@/features/constructor/ui/icons';
import { CATALOG_CATEGORIES, getTags, modelsWord, sortForShop } from '../data';
import CatalogFilters from '../catalog-filters/catalog-filters';
import ProductGrid from '../product-grid/product-grid';
import SeoText from '../seo-text/seo-text';
import {
  applyFilters,
  buildQuery,
  countActive,
  filterOptions,
  parseFilters,
  printableOptions,
  sortOptions,
  type FilterOptions,
  type Filters,
  type ListKey,
  type SearchParams,
} from '../filters';
import styles from './catalog-page.module.css';

type ActivePill = { label: string; next: Filters };

const withoutValue = (filters: Filters, key: ListKey, value: string): Filters => ({
  ...filters,
  [key]: filters[key].filter((item) => item !== value),
});

/** Выбранные фильтры: каждый — ссылка на тот же раздел без этого значения */
const activePills = (filters: Filters, options: FilterOptions): ActivePill[] => {
  const labelOf = (group: keyof FilterOptions, value: string) =>
    options[group].find((option) => option.value === value)?.label ?? value;
  const lists: [ListKey, (value: string) => string][] = [
    ['categories', (value) => labelOf('categories', value)],
    ['sizes', (value) => labelOf('sizes', value)],
    ['colors', (value) => labelOf('colors', value)],
    ['tags', (value) => labelOf('tags', value)],
    ['types', (value) => CATALOG_CATEGORIES.find((category) => category.type === value)?.label ?? value],
  ];
  return [
    ...lists.flatMap(([key, label]) =>
      filters[key].map((value) => ({ label: label(value), next: withoutValue(filters, key, value) })),
    ),
    ...(filters.printable
      ? [{ label: printableOptions.find((option) => option.value === filters.printable)?.label ?? '', next: { ...filters, printable: '' as const } }]
      : []),
    ...(filters.priceSort
      ? [{ label: sortOptions.find((option) => option.value === filters.priceSort)?.label ?? '', next: { ...filters, priceSort: '' as const } }]
      : []),
  ];
};

/**
 * Страница каталога: /shop (все модели) и страницы разделов. Весь каталог берётся один раз, раздел — фильтр по типу,
 * поэтому у карточек есть другие цвета. Фильтры выбирают по адресу страницы на сервере: без скриптов работают
 * ссылки разделов и «таблетки» выбранного.
 */
const CatalogPage: React.FC<{
  /** Тип вещи раздела; без него — весь каталог */
  type?: string;
  title: string;
  breadcrumbs: BreadcrumbItem[];
  jsonLd: Record<string, unknown>[];
  /** Вопросы раздела; без них блока нет */
  faq?: FaqItem[];
  seo?: React.ReactNode;
  searchParams: SearchParams;
}> = async ({ type, title, breadcrumbs, jsonLd, faq, seo, searchParams }) => {
  const [shopData, tags, categories] = await Promise.all([getShopData(), getTags(), getCategoriesData()]);
  const all = sortForShop(shopData);
  const path = CATALOG_CATEGORIES.find((category) => category.type === type)?.href ?? '/shop';
  const inSection = type ? all.filter((product) => product.type === type) : all;
  const parsed = parseFilters(searchParams);
  const filters = type ? { ...parsed, types: [] } : parsed;
  const products = applyFilters(inSection, filters);
  const options = filterOptions(inSection, categories, tags);
  const pills = activePills(filters, options);
  const sections = CATALOG_CATEGORIES.map((category) => ({
    ...category,
    count: all.filter((product) => product.type === category.type).length,
  })).filter((section) => section.count > 0);
  const countLabel = `${products.length} ${modelsWord(products.length)}`;

  return (
    <div data-layout="wide">
      {jsonLd.map((item, index) => (
        <MarkupScript key={index} jsonLd={item} />
      ))}

      <section className={styles.catalog} aria-labelledby="catalog-title">
        <div className={styles.inner}>
          <div className={styles.crumbs}>
            <Breadcrumbs items={breadcrumbs} />
          </div>
          <SectionHead
            as="h1"
            titleId="catalog-title"
            title={title}
            lead={
              inSection.length > 0
                ? `${inSection.length} ${modelsWord(inSection.length)} — на любую нанесём твой принт`
                : undefined
            }
          />

          {all.length > 0 && (
            <>
              <div className={styles.toolbar}>
                <nav className={styles.sections} aria-label="Разделы каталога">
                  <ul className={styles.sectionList}>
                    <li>
                      <Link href="/shop" className={styles.tab} aria-current={path === '/shop' ? 'page' : undefined}>
                        Все <span className={styles.tabCount}>{all.length}</span>
                      </Link>
                    </li>
                    {sections.map((section) => (
                      <li key={section.type}>
                        <Link
                          href={section.href}
                          className={styles.tab}
                          aria-current={path === section.href ? 'page' : undefined}
                        >
                          {section.label} <span className={styles.tabCount}>{section.count}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
                {inSection.length > 0 && (
                  <CatalogFilters path={path} filters={filters} options={options} countLabel={countLabel} />
                )}
              </div>

              {pills.length > 0 && (
                <ul className={styles.active} aria-label="Выбранные фильтры">
                  {pills.map((pill) => (
                    <li key={`${pill.label}-${buildQuery(pill.next)}`}>
                      <Link href={`${path}${buildQuery(pill.next)}`} scroll={false} className={styles.pill}>
                        {pill.label}
                        <Icon name="close" size={14} stroke={2} />
                        <span className="visually-hidden"> — убрать фильтр</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}

          <div id="catalog-results" className={styles.results}>
            <h2 className="visually-hidden">Модели</h2>
            {products.length > 0 ? (
              <ProductGrid products={products} all={all} tags={tags} priority />
            ) : (
              <div className={styles.empty}>
                {all.length === 0 ? (
                  <>
                    <p className={styles.emptyTitle}>Каталог сейчас не загрузился</p>
                    <p className={styles.emptyText}>Попробуй обновить страницу чуть позже.</p>
                    <div className={styles.emptyActions}>
                      <Link href={path} className={styles.primary}>
                        Обновить
                      </Link>
                    </div>
                  </>
                ) : inSection.length === 0 ? (
                  <>
                    <p className={styles.emptyTitle}>В этом разделе пока нет моделей</p>
                    <p className={styles.emptyText}>Посмотри другие разделы или нанеси принт в конструкторе.</p>
                    <div className={styles.emptyActions}>
                      <Link href="/shop" className={styles.primary}>
                        Весь каталог
                      </Link>
                      <Link href={constructorHref} className={styles.secondary}>
                        Нанести принт
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <p className={styles.emptyTitle}>Ничего не нашлось</p>
                    <p className={styles.emptyText}>
                      {countActive(filters) > 0 ? 'С такими фильтрами моделей нет.' : 'Моделей нет.'}
                    </p>
                    <div className={styles.emptyActions}>
                      <Link href={path} scroll={false} className={styles.primary}>
                        Сбросить фильтры
                      </Link>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Стык листа — только между блоками: перед подвалом его нет */}
      {seo && (
        <>
          <SheetCut index={0} />
          <SeoText>{seo}</SeoText>
        </>
      )}
      {/* Вопросы — только у разделов: свои тексты со старого сайта (SEO). Общие вопросы живут на главной, на /shop их не дублируем */}
      {faq && (
        <>
          <SheetCut index={1} />
          <Faq items={faq} ctaHref={contactsHref} />
        </>
      )}
    </div>
  );
};

export default CatalogPage;
