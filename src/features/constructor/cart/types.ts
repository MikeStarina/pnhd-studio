import type { SideBounds } from '../model/pricing';
import type { DesignLayer, Garment, PrintMethod, Side, SizeQuantities } from '../model/types';

/**
 * Изделие из конструктора в корзине (adr/0001). Описание лежит в localStorage вместе с корзиной,
 * картинки — в IndexedDB (cart/assets.ts), здесь только их ключи.
 */
export interface CartDesign {
  /** `d-<время добавления>-<случайное>`: по времени сборщик мусора не трогает только что добавленное. */
  id: string;
  addedAt: number;
  garment: Pick<Garment, 'id' | 'name' | 'type' | 'shapeId'>;
  method: PrintMethod;
  /** Габарит принта по сторонам — по нему считается цена печати. */
  bounds: SideBounds;
  /** Количество по размерам для каждого цвета (ключ — productId). */
  quantities: Record<string, SizeQuantities>;
  /** Стороны с принтом, перед — первым. */
  sides: Side[];
  /** Слои макета для правки из корзины. У картинок `src` — ключ ассета в IndexedDB. */
  layers: DesignLayer[];
  /** Превью изделия с принтом: каждый цвет × каждая сторона. */
  previews: Array<{ productId: string; color: string; hex: string; side: Side; asset: string }>;
  /** Файл печати на сторону: от цвета ткани не зависит. */
  prints: Array<{ side: Side; asset: string; dpi: number; /** DTF с надписями: PDF, где текст — кривые. */ vector?: string }>;
  /** Исходные файлы клиента, как загружены. */
  originals: Array<{ asset: string; name: string }>;
  /** Расчёт на момент добавления. Корзина показывает его, пока не пересчитает по свежему каталогу. */
  price: {
    qty: number;
    total: number;
    lines: Array<{ productId: string; color: string; hex: string; sizes: Array<[size: string, qty: number]>; qty: number; perItem: number; total: number }>;
  };
}
