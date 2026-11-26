import { ICategory, IProduct, ITag } from '@/app/utils/types';
import { toCategoryArray } from '@/app/utils/product-categories';
import { toTagArray } from '@/app/utils/product-tags';
import { getShopColorOptions, normalizeColorKey } from '@/app/utils/product-colors';
import { getShopSizeOptions, normalizeSizeKey, productHasSize } from '@/app/utils/product-sizes';

/** Фильтры каталога живут в адресе страницы: ссылки работают без скриптов, а выбор можно переслать */
export type Filters = {
  categories: string[];
  colors: string[];
  tags: string[];
  types: string[];
  sizes: string[];
  priceSort: '' | 'ASC' | 'DESC';
  printable: '' | 'print' | 'blank';
};

export type ListKey = 'categories' | 'colors' | 'tags' | 'types' | 'sizes';

export type SearchParams = Record<string, string | string[] | undefined>;

export type FilterOption = { value: string; label: string; hex?: string | null };

export type FilterOptions = Record<'categories' | 'sizes' | 'colors' | 'tags', FilterOption[]>;

export const emptyFilters: Filters = { categories: [], colors: [], tags: [], types: [], sizes: [], priceSort: '', printable: '' };

export const printableOptions = [
  { value: '', label: 'Все' },
  { value: 'print', label: 'Для печати' },
  { value: 'blank', label: 'С принтом' },
] as const;

export const sortOptions = [
  { value: '', label: 'По порядку' },
  { value: 'ASC', label: 'Сначала дешевле' },
  { value: 'DESC', label: 'Сначала дороже' },
] as const;

const first = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value) ?? '';

const list = (value: string | string[] | undefined) => first(value).split(',').filter(Boolean);

export const parseFilters = (params: SearchParams): Filters => {
  const priceSort = first(params.priceSort);
  const printable = first(params.printable);
  return {
    categories: list(params.category),
    colors: list(params.color).map(normalizeColorKey).filter(Boolean),
    tags: list(params.tags),
    types: list(params.type),
    sizes: list(params.size).map(normalizeSizeKey).filter(Boolean),
    priceSort: priceSort === 'ASC' || priceSort === 'DESC' ? priceSort : '',
    printable: printable === 'print' || printable === 'blank' ? printable : '',
  };
};

export const buildQuery = (filters: Filters) => {
  const lists: [string, string[]][] = [
    ['category', filters.categories],
    ['color', filters.colors],
    ['tags', filters.tags],
    ['type', filters.types],
    ['size', filters.sizes],
  ];
  const parts = lists.flatMap(([name, values]) =>
    values.length ? [`${name}=${values.map(encodeURIComponent).join(',')}`] : [],
  );
  if (filters.priceSort) parts.push(`priceSort=${filters.priceSort}`);
  if (filters.printable) parts.push(`printable=${filters.printable}`);
  return parts.length ? `?${parts.join('&')}` : '';
};

export const countActive = (filters: Filters) =>
  filters.categories.length +
  filters.colors.length +
  filters.tags.length +
  filters.types.length +
  filters.sizes.length +
  (filters.priceSort ? 1 : 0) +
  (filters.printable ? 1 : 0);

export const toggleValue = (values: string[], value: string) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

/** Порядок товаров не меняется, пока не выбрана сортировка по цене */
export const applyFilters = (products: IProduct[], filters: Filters) => {
  const filtered = products.filter(
    (product) =>
      (!filters.categories.length || toCategoryArray(product.category).some((id) => filters.categories.includes(id))) &&
      (!filters.colors.length || filters.colors.includes(normalizeColorKey(product.color))) &&
      (!filters.tags.length || toTagArray(product.tags).some((id) => filters.tags.includes(id))) &&
      (!filters.types.length || filters.types.includes(product.type)) &&
      productHasSize(product, filters.sizes) &&
      (filters.printable === 'print' ? product.isForPrinting : filters.printable === 'blank' ? !product.isForPrinting : true),
  );
  if (filters.priceSort === 'ASC') return filtered.sort((a, b) => a.price - b.price);
  if (filters.priceSort === 'DESC') return filtered.sort((a, b) => b.price - a.price);
  return filtered;
};

/** Варианты выбора — только то, что есть у товаров раздела */
export const filterOptions = (products: IProduct[], categories: ICategory[], tags: ITag[]): FilterOptions => ({
  categories: [...categories]
    .sort((a, b) => a.order - b.order)
    .filter((category) => products.some((product) => toCategoryArray(product.category).includes(category._id)))
    .map((category) => ({ value: category._id, label: category.label })),
  sizes: getShopSizeOptions(products).map((size) => ({ value: size.value, label: size.name })),
  colors: getShopColorOptions(products).map((color) => ({ value: color.value, label: color.name, hex: color.hex })),
  tags: [...tags]
    .sort((a, b) => a.order - b.order)
    .filter((tag) => products.some((product) => toTagArray(product.tags).includes(tag._id)))
    .map((tag) => ({ value: tag._id, label: tag.label })),
});
