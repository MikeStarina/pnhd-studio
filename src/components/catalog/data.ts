import { apiBaseUrl } from '@/app/utils/constants';
import { productMainPhotoUrl, absoluteMediaUrl } from '@/app/utils/product-photos';
import { resolveColorHex } from '@/app/utils/product-colors';
import { toTagArray } from '@/app/utils/product-tags';
import { compareSizeKeys, normalizeSizeKey } from '@/app/utils/product-sizes';
import { priceListFor, WHITE_MIN_CHANNEL } from '@/features/constructor/config/pricing';
import { hexToRgb } from '@/features/constructor/model/color';
import { fabricHex } from '@/features/constructor/api/catalog';
import { promoPrice } from '@/features/constructor/config/promo';
import type { GarmentType } from '@/features/constructor/model/types';
import { IProduct, ITag } from '@/app/utils/types';

/** Разделы каталога: тип вещи в API → страница категории. Порядок — как в шапке каталога и в бенто главной */
export const CATALOG_CATEGORIES = [
  { type: 'tshirt', label: 'Футболки', href: '/futbolki' },
  { type: 'hoodie', label: 'Худи', href: '/hudi' },
  { type: 'longsleeve', label: 'Лонгсливы', href: '/longslivy' },
  { type: 'sweatshirt', label: 'Свитшоты', href: '/svitshoty' },
  { type: 'totebag', label: 'Шопперы', href: '/shoppery' },
  { type: 'cap', label: 'Кепки', href: '/kepki' },
] as const;

export type CatalogCategory = (typeof CATALOG_CATEGORIES)[number];

export const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, ' ')} ₽`;

export const modelsWord = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'модель';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'модели';
  return 'моделей';
};

/** Товары витрины: с адресом и ценой, по порядку из админки */
export const sortForShop = (products: IProduct[]) =>
  products
    .filter((product) => product.slug && product.price > 0)
    .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity));

export const getTags = async (): Promise<ITag[]> => {
  try {
    const res = await fetch(`${apiBaseUrl}/api/tags`, { next: { revalidate: 3600, tags: ['tagsDataTag'] } });
    if (!res.ok) return [];
    const json: { data?: ITag[] } = await res.json();
    return json.data ?? [];
  } catch {
    return [];
  }
};

export type Badge = { label: string; tone: 'new' | 'sale' | 'default' | 'out' };

/** Метки на фото товара: «Нет в наличии» и теги из админки (NEW, SALE…) */
export const productBadges = (product: IProduct, tags: ITag[]): Badge[] => [
  ...(inStock(product) ? [] : [{ label: 'Нет в наличии', tone: 'out' as const }]),
  ...toTagArray(product.tags).flatMap((id) => {
    const tag = tags.find((item) => item._id === id);
    if (!tag) return [];
    const tone = tag.slug === 'new' ? 'new' : tag.slug === 'sale' ? 'sale' : 'default';
    return [{ label: tag.label, tone } as Badge];
  }),
];

export const inStock = (product: IProduct) => product.sizes.some((size) => size.qty > 0);

/** Тот же товар в других цветах: в API их связывает internal_id */
export const colorVariants = (product: IProduct, all: IProduct[]) =>
  product.internal_id ? all.filter((item) => item.internal_id === product.internal_id && item.slug) : [product];

export const colorHex = (product: Pick<IProduct, 'stageColor' | 'color'>) =>
  product.stageColor || resolveColorHex(product.color) || null;

/** Второе фото карточки (показывается при наведении): только если у товара оно правда есть */
export const secondPhotoUrl = (product: IProduct) =>
  product.photos?.[1] || (product.galleryPhotos?.[1] ? absoluteMediaUrl(product.galleryPhotos[1]) : null);

/**
 * Цена вещи с самым дешёвым принтом А4 на одну штуку: ниже из двух методов (DTF и DTG), по цвету ткани,
 * из тех же прайсов и по тому же цвету ткани, что конструктор и сервер. Вещь не для печати — null.
 * Во время акции конструктора изделие в этой цене — со скидкой, а full — без неё: так её и посчитает конструктор.
 */
export const priceWithPrint = (product: IProduct) => {
  if (!product.isForPrinting) return null;
  const isWhite = hexToRgb(fabricHex(product)).every((channel) => channel >= WHITE_MIN_CHANNEL);
  const prices = (['dtf', 'dtg'] as const).flatMap((method) => {
    const a4 = priceListFor(method).formats.find((format) => format.name === 'A4');
    return a4 ? [(isWhite ? a4.white : a4.colored)[0]] : [];
  });
  if (!prices.length) return null;
  const print = Math.min(...prices);
  return { now: promoPrice(product.price, product.type as GarmentType) + print, full: product.price + print };
};

const ONE_SIZE = 'ONE SIZE';

/** Возраст из детского размера: «3-4 года 92-98 см» → [3, 4], «10-12 лет …» → [10, 12] */
const kidsAge = (size: string) => {
  const match = size.match(/^(\d+)(?:-(\d+))?\s*(?:год|лет)/);
  return match ? [Number(match[1]), Number(match[2] ?? match[1])] : null;
};

/**
 * Размеры в наличии одной строкой: «S–XL» (подряд по шкале вещи), «S, XL» (с пропусками), «3–14 лет», «один размер».
 * Нет остатка — null.
 */
export const sizesInStock = (product: IProduct) => {
  const scale = [...new Set(product.sizes.map((size) => normalizeSizeKey(size.name)).filter(Boolean))].sort(compareSizeKeys);
  const available = scale.filter((key) =>
    product.sizes.some((size) => size.qty > 0 && normalizeSizeKey(size.name) === key),
  );
  if (!available.length) return null;
  if (available.length === 1 && available[0] === ONE_SIZE) return 'один размер';

  const ages = available.map(kidsAge);
  if (ages.every((age) => age)) {
    const bounds = ages.flatMap((age) => age ?? []);
    return `${Math.min(...bounds)}–${Math.max(...bounds)} лет`;
  }

  if (available.length === 1) return available[0];
  const first = scale.indexOf(available[0]);
  const isRun = scale.indexOf(available[available.length - 1]) - first === available.length - 1;
  return isRun && available.length > 2
    ? `${available[0]}–${available[available.length - 1]}`
    : available.join(', ');
};

/**
 * Товар для карточки в браузере: без описания, ссылок и мокапов редактора и только с двумя фото (их и показывает карточка).
 * Для клиентских блоков вроде «Недавно смотрели»: весь каталог целиком в странице не нужен.
 */
export const toCardProduct = (product: IProduct): IProduct => ({
  ...product,
  description: '',
  links: [],
  photos: (product.photos ?? []).slice(0, 2),
  galleryPhotos: (product.galleryPhotos ?? []).slice(0, 2),
  editor_front_view: '',
  editor_back_view: '',
  editor_lsleeve_view: '',
  editor_rsleeve_view: '',
});

export { productMainPhotoUrl };
