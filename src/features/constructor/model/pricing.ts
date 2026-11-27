import { priceListFor, WHITE_MIN_CHANNEL, type FormatPrice, type PriceList, type PrintFormat } from '../config/pricing';
import { promoPrice } from '../config/promo';
import { hexToRgb } from './color';
import { sideMethod, type Garment, type PrintMethod, type Side, type SizeQuantities } from './types';

/** Габарит принта на стороне в сантиметрах (считается из слоёв, см. bounds.ts). */
export type SideBounds = Partial<Record<Side, { wCm: number; hCm: number } | null>>;

/** Запас на округление: принт 20,3 см считается влезающим в формат 20 см. */
const FIT_TOLERANCE_CM = 0.5;

/**
 * Самый маленький формат, в который помещается принт (можно повернуть).
 * Если не помещается ни в один — самый крупный с пометкой oversize: цену подтверждает менеджер.
 */
export function formatFor(wCm: number, hCm: number, list: PriceList): { format: FormatPrice; oversize: boolean } {
  const s = Math.min(wCm, hCm) - FIT_TOLERANCE_CM;
  const l = Math.max(wCm, hCm) - FIT_TOLERANCE_CM;
  const fit = list.formats.find((f) => s <= Math.min(f.w, f.h) && l <= Math.max(f.w, f.h));
  return fit ? { format: fit, oversize: false } : { format: list.formats[list.formats.length - 1], oversize: true };
}

/** Ступень прайса по количеству: 1–9 шт → 0, от 10 → 1, от 20 → 2… */
export function tierIndex(qty: number, tiers: number[]): number {
  let i = 0;
  while (i + 1 < tiers.length && qty >= tiers[i + 1]) i++;
  return i;
}

/** Печать одной стороны: формат и цена за принт на текущей ступени тиража. */
export interface SidePrice { side: Side; method: PrintMethod; format: PrintFormat; price: number; oversize: boolean; wCm: number; hCm: number }

/** Один цвет заявки: изделие, количество по размерам и его цена. */
export interface PriceLine {
  productId: string;
  color: string;
  hex: string;
  /** Размеры с количеством больше нуля, по шкале. */
  sizes: Array<[size: string, qty: number]>;
  qty: number;
  /** Цена изделия за штуку — с учётом акции. */
  garment: number;
  /** Цена изделия без акции; больше `garment`, когда скидка действует. */
  garmentFull: number;
  /** Печать по сторонам: у белой ткани она дешевле, поэтому у каждого цвета своя. */
  sides: SidePrice[];
  perItem: number;
  total: number;
}

export interface PriceBreakdown {
  /** Цвета, по которым есть количество, — в порядке каталога. */
  lines: PriceLine[];
  /** Выбранный цвет — даже если по нему пока 0 шт: панель показывает его разбивку. */
  current: PriceLine | null;
  /** Всего штук по всем цветам. */
  qty: number;
  total: number;
  /** От скольких штук действует текущая ступень цены (1 — базовая). */
  tierFrom: number;
  /** Следующая ступень: от скольких штук и сколько тогда будет стоить штука выбранного цвета. null — дешевле уже не будет. */
  next: { qty: number; perItem: number } | null;
}

/** Цвет модели, как его видит расчёт. */
export interface PriceVariant {
  productId: string;
  color: string;
  hex: string;
  /** Цена изделия с учётом акции и без неё. */
  garmentPrice: number;
  garmentFull: number;
  isWhite: boolean;
  /** Все размеры цвета по шкале — порядок строк размеров в заявке. */
  sizeNames: string[];
  sizes: SizeQuantities;
}

/** Цвета модели для расчёта из каталога и количеств — одинаково в конструкторе и при приёме заявки. */
export function priceVariants(garment: Garment, quantities: Record<string, SizeQuantities>, now = Date.now()): PriceVariant[] {
  return garment.variants.map((v) => ({
    productId: v.productId, color: v.colorName, hex: v.hex,
    garmentPrice: promoPrice(v.price, garment.type, now), garmentFull: v.price,
    isWhite: hexToRgb(v.hex).every((c) => c >= WHITE_MIN_CHANNEL),
    sizeNames: v.sizes, sizes: quantities[v.productId] ?? {},
  }));
}

export function calcPrice(args: {
  method: PrintMethod;
  bounds: SideBounds;
  /** Все цвета модели в порядке каталога (с количеством и без). */
  variants: PriceVariant[];
  currentId: string | null;
}): PriceBreakdown {
  const count = (v: PriceVariant) => v.sizeNames.reduce((s, k) => s + (v.sizes[k] ?? 0), 0);
  // Ступень — по общему количеству заявки: принт один, тираж общий для всех цветов и размеров.
  const qty = args.variants.reduce((s, v) => s + count(v), 0);

  // У каждой стороны свой прайс: рукава — DTF, остальное — выбранный метод.
  const printed = (Object.entries(args.bounds) as Array<[Side, { wCm: number; hCm: number } | null]>)
    .filter((e): e is [Side, { wCm: number; hCm: number }] => !!e[1] && e[1].wCm > 0)
    .map(([side, b]) => {
      const method = sideMethod(args.method, side);
      const list = priceListFor(method);
      return { side, method, b, list, tier: tierIndex(qty, list.tiers), ...formatFor(b.wCm, b.hCm, list) };
    });
  const priceAt = (f: FormatPrice, white: boolean, t: number) => (white ? f.white : f.colored)[t];

  const lineFor = (v: PriceVariant): PriceLine => {
    const sides = printed.map(({ side, method, b, tier, format, oversize }) => ({
      side, method, format: format.name, price: priceAt(format, v.isWhite, tier), oversize, wCm: b.wCm, hCm: b.hCm,
    }));
    const perItem = v.garmentPrice + sides.reduce((s, x) => s + x.price, 0);
    const sizes = v.sizeNames.map((k): [string, number] => [k, v.sizes[k] ?? 0]).filter(([, n]) => n > 0);
    const n = count(v);
    return { productId: v.productId, color: v.color, hex: v.hex, sizes, qty: n, garment: v.garmentPrice, garmentFull: v.garmentFull, sides, perItem, total: perItem * n };
  };

  const lines = args.variants.filter((v) => count(v) > 0).map(lineFor);
  const cur = args.variants.find((v) => v.productId === args.currentId);
  const current = cur ? lineFor(cur) : null;

  // Следующая ступень — ближайшая из прайсов сторон; на ней каждая сторона берёт свою ступень.
  const nextQty = Math.min(...printed.map((x) => x.list.tiers[x.tier + 1] ?? Infinity));
  const next = cur && Number.isFinite(nextQty)
    ? { qty: nextQty, perItem: cur.garmentPrice + printed.reduce((s, x) => s + priceAt(x.format, cur.isWhite, tierIndex(nextQty, x.list.tiers)), 0) }
    : null;
  const tierFrom = Math.max(1, ...printed.map((x) => x.list.tiers[x.tier]));

  return { lines, current, qty, total: lines.reduce((s, l) => s + l.total, 0), tierFrom, next };
}
