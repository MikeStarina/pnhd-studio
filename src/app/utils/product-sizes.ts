const KNOWN_SIZE_ORDER = [
  'XXXS',
  'XXS',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '2XL',
  'XXXL',
  '3XL',
  'XXXXL',
  '4XL',
  'XXXXXL',
  '5XL',
  'XXXXXXL',
  '6XL',
];

export type ShopSizeOption = {
  name: string;
  value: string;
};

/**
 * Один вид размера на весь сайт: буквенные — капсом, «2XL» → «XXL»; детские («3-4 года 92-98 см») — строчными.
 * В админке один и тот же размер записан по-разному («2Xl», «Xl»).
 */
export const normalizeSizeKey = (size?: string): string => {
  if (!size) return '';
  const value = size.trim().replace(/\s+/g, ' ');
  if (!/^[a-z0-9 ]+$/i.test(value)) return value.toLowerCase();
  const upper = value.toUpperCase();
  const multiple = upper.match(/^([2-6])XL$/);
  return multiple ? `${'X'.repeat(Number(multiple[1]))}L` : upper;
};

const sizeSortIndex = (value: string): number => {
  const knownIndex = KNOWN_SIZE_ORDER.indexOf(value);
  if (knownIndex !== -1) return knownIndex;
  if (/^\d+([.,]\d+)?$/.test(value)) return 1000 + Number(value.replace(',', '.'));
  return 2000;
};

export const compareSizeKeys = (a: string, b: string): number => {
  const aIndex = sizeSortIndex(a);
  const bIndex = sizeSortIndex(b);
  if (aIndex !== bIndex) return aIndex - bIndex;
  return a.localeCompare(b, 'ru', { numeric: true });
};

export const getShopSizeOptions = (
  products: Array<{ sizes?: Array<{ name?: string; qty?: number }> | null }>
): ShopSizeOption[] => {
  const seen = new Map<string, ShopSizeOption>();
  for (const item of products) {
    for (const size of item.sizes ?? []) {
      const name = size?.name?.trim();
      if (!name || !size.qty || size.qty <= 0) continue;
      const value = normalizeSizeKey(name);
      if (!value || seen.has(value)) continue;
      seen.set(value, { name: value, value });
    }
  }
  return Array.from(seen.values()).sort((a, b) => compareSizeKeys(a.value, b.value));
};

/** Размер в фильтре значит «есть в наличии»: нулевой остаток не подходит */
export const productHasSize = (
  product: { sizes?: Array<{ name?: string; qty?: number }> | null },
  sizeKeys: string[]
): boolean => {
  if (!sizeKeys.length) return true;
  return (product.sizes ?? []).some((size) => (size?.qty ?? 0) > 0 && sizeKeys.includes(normalizeSizeKey(size?.name)));
};
