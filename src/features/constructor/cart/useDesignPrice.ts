'use client';
import { useEffect, useMemo, useState } from 'react';
import { fetchCatalog } from '../api/catalog';
import { calcPrice, priceVariants } from '../model/pricing';
import type { Garment } from '../model/types';
import type { CartDesign } from './types';

type Price = CartDesign['price'];

/** Каталог грузится один раз на страницу; после ошибки следующая попытка начнёт заново. */
let catalogPromise: Promise<Garment[]> | null = null;
const loadCatalog = () => {
  catalogPromise ??= fetchCatalog().catch((error) => {
    catalogPromise = null;
    throw error;
  });
  return catalogPromise;
};

function useCatalog(): Garment[] | null {
  const [catalog, setCatalog] = useState<Garment[] | null>(null);
  useEffect(() => {
    let alive = true;
    loadCatalog().then((garments) => alive && setCatalog(garments)).catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return catalog;
}

/**
 * Штук по цветам самой позиции (у каждого есть превью). В количестве позиций, добавленных до 25.11, лежат и размеры
 * других моделей — их не считаем; а цвет позиции, пропавший из каталога, считаем: пересчёт без него — неверная цена.
 */
const countOf = (design: CartDesign, quantities: CartDesign['quantities']) =>
  [...new Set(design.previews.map((p) => p.productId))].reduce(
    (sum, productId) => sum + Object.values(quantities[productId] ?? {}).reduce((s, n) => s + n, 0),
    0,
  );

/**
 * Цена позиции по свежему каталогу той же функцией, что в конструкторе и на сервере.
 * null — модели нет в каталоге или пересчёт потерял штуки (цвета или размера больше нет).
 */
function priceFor(catalog: Garment[], design: CartDesign, quantities: CartDesign['quantities']): Price | null {
  const garment = catalog.find((g) => g.id === design.garment.id);
  if (!garment) return null;
  const fresh = calcPrice({ method: design.method, bounds: design.bounds, variants: priceVariants(garment, quantities), currentId: null });
  if (fresh.qty !== countOf(design, quantities)) return null;
  const { qty, total, lines } = fresh;
  return {
    qty,
    total,
    lines: lines.map(({ productId, color, hex, sizes, qty, perItem, total }) => ({ productId, color, hex, sizes, qty, perItem, total })),
  };
}

/** Цена по свежему каталогу; без каталога или при расхождении — сохранённая на момент добавления. */
export function useDesignPrices(designs: CartDesign[]): Price[] {
  const catalog = useCatalog();
  return useMemo(
    () => designs.map((design) => (catalog && priceFor(catalog, design, design.quantities)) || design.price),
    [catalog, designs],
  );
}

/**
 * Пересчёт под новое количество (правка в корзине). null, пока каталог не загружен: без свежих цен
 * корзина показала бы сохранённую сумму для старого количества — поэтому степперы ждут каталог.
 */
export function useDesignRepricer(): ((design: CartDesign, quantities: CartDesign['quantities']) => Price | null) | null {
  const catalog = useCatalog();
  return useMemo(() => (catalog ? (design, quantities) => priceFor(catalog, design, quantities) : null), [catalog]);
}

export function useDesignPrice(design: CartDesign): Price {
  const designs = useMemo(() => [design], [design]);
  return useDesignPrices(designs)[0];
}
