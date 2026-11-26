import { calcPrice, priceVariants, type SidePrice, type SideBounds } from '@/features/constructor/model/pricing';
import type { Garment, PrintMethod, Side, SizeQuantities } from '@/features/constructor/model/types';
import type { OrderLine } from './parse';

/** Файл печати выгружается в 300 dpi; если холст не потянул — в меньшем, и тогда принт на деле крупнее. */
const PRINT_DPI = 300;

export interface RequestedLine { productId: string; sizes: SizeQuantities }

export interface PricedOrder {
  garmentName: string;
  lines: OrderLine[];
  qty: number;
  total: number;
  /** Печать по сторонам (формат, габарит) — по первому цвету, у всех цветов она одна. */
  sides: SidePrice[];
  /** Хотя бы у одного цвета цена изделия снижена по акции */
  promo: boolean;
}

/**
 * Цена заявки на сервере: изделия и цены — из каталога, прайс и расчёт — те же, что в конструкторе.
 * Цене от клиента не верим. Габарит принта — больший из присланного конструктором и посчитанного
 * по пикселям файла печати при 300 dpi: занизить его нельзя, файл печати и есть то, что напечатают.
 * @returns null — изделия нет в каталоге или цвета из разных моделей.
 */
export function priceOrder(
  catalog: Garment[],
  method: PrintMethod,
  requested: RequestedLine[],
  printPx: Partial<Record<Side, { w: number; h: number }>>,
  claimed: SideBounds,
): PricedOrder | null {
  const garment = catalog.find((g) => g.variants.some((v) => v.productId === requested[0]?.productId));
  if (!garment) return null;
  const quantities: Record<string, SizeQuantities> = {};
  for (const l of requested) {
    if (!garment.variants.some((v) => v.productId === l.productId) || quantities[l.productId]) return null;
    quantities[l.productId] = l.sizes;
  }

  const bounds: SideBounds = {};
  for (const [side, px] of Object.entries(printPx) as Array<[Side, { w: number; h: number }]>) {
    const c = claimed[side];
    const cm = (n: number) => (n * 2.54) / PRINT_DPI;
    bounds[side] = { wCm: Math.max(cm(px.w), c?.wCm ?? 0), hCm: Math.max(cm(px.h), c?.hCm ?? 0) };
  }

  const price = calcPrice({ method, bounds, variants: priceVariants(garment, quantities), currentId: null });
  if (!price.qty || !Number.isFinite(price.total)) return null;
  return {
    garmentName: garment.name,
    lines: price.lines.map((l) => ({ color: l.color, sizes: l.sizes, qty: l.qty, perItem: l.perItem, total: l.total })),
    qty: price.qty,
    total: price.total,
    sides: price.lines[0]?.sides ?? [],
    promo: price.lines.some((l) => l.garment < l.garmentFull),
  };
}
