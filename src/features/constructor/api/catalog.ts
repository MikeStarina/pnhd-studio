import { shapeFor } from '../config/garment-shapes';
import { sortSizes } from '../model/sizes';
import type { ApiProduct, Garment, GarmentType, GarmentVariant } from '../model/types';

export const PNHD_API_URL = process.env.NEXT_PUBLIC_PNHD_API_URL || 'https://api.pnhd.ru';

const SUPPORTED: GarmentType[] = ['tshirt', 'longsleeve', 'sweatshirt', 'hoodie', 'totebag', 'cap'];

/** Цвета без stageColor в API — запасная палитра по названию. */
const COLOR_FALLBACK: Record<string, string> = {
  белый: '#ffffff', черный: '#2b2b2b', розовый: '#f4c2c9', молочный: '#f8f4ea', серый: '#9a9a9a',
};

/** Состав ткани в конце названия: «92/8», «70/30» */
const FABRIC = /^\d+\/\d+$/;

/**
 * «Футболка OVERSIZE черная» → «Футболка OVERSIZE». В API цвета — отдельные товары без общего id модели.
 * Состав ткани после цвета — часть модели: «Футболка REGULAR Бежевая 92/8» → «Футболка REGULAR 92/8».
 */
export function modelNameOf(p: ApiProduct): string {
  const words = p.name.trim().split(/\s+/);
  const fabric = words.length > 3 && FABRIC.test(words[words.length - 1]) ? words.pop() : undefined;
  const model = words.length > 2 ? words.slice(0, -1) : words;
  return [...model, ...(fabric ? [fabric] : [])].join(' ');
}

/**
 * Цвета, у которых stageColor из API не похож на ткань на плоском мокапе
 * (подобран под освещение 3D-сцены): чёрный там #424242 и выглядит тёмно-серым.
 */
const COLOR_OVERRIDE: Record<string, string> = {
  черный: '#1c1c1c',
};

/** Чистит описание из API: двойные пробелы, «bag.35x40» без пробела после точки. */
const tidy = (s = '') => s.replace(/([a-zа-яё])\.(?=[A-ZА-ЯЁ0-9])/gi, '$1. ').replace(/\s+/g, ' ').trim();

/** Все фото модели из каталога: по цветам, без повторов. */
export const photosOf = (g: Garment): string[] => [...new Set(g.variants.flatMap((v) => v.photos))];

/**
 * Цвет ткани для холста и расчёта цены (белая или цветная). Им же считает «цену с принтом» карточка каталога —
 * у сайта и конструктора одна таблица цветов, иначе цены разойдутся.
 */
export function fabricHex(p: Pick<ApiProduct, 'color' | 'stageColor'>): string {
  const name = p.color.toLowerCase().replace('ё', 'е');
  return COLOR_OVERRIDE[name] || p.stageColor || COLOR_FALLBACK[name] || '#d9d9d9';
}

function toVariant(p: ApiProduct): GarmentVariant {
  const hex = fabricHex(p);
  // editor_*_view в API — относительные пути, которые сейчас отдают 404; берём только абсолютные URL.
  const abs = (u: string) => (u?.startsWith('http') ? u : undefined);
  return {
    productId: p._id,
    slug: p.slug,
    colorName: p.color,
    hex,
    price: p.price,
    sizes: sortSizes(p.sizes.map((s) => s.name)),
    stock: Object.fromEntries(p.sizes.filter((s) => Number.isFinite(s.qty)).map((s) => [s.name, Math.max(0, Math.floor(s.qty))])),
    description: tidy(p.description),
    photos: (p.photos ?? []).filter((u) => u.startsWith('http')),
    mockups: { front: abs(p.editor_front_view), back: abs(p.editor_back_view) },
  };
}

/** Порядок внутри типа: Regular, Oversize, Super oversize, прочее взрослое, детские. */
function cutRank(g: Garment): number {
  const name = g.name.toLowerCase();
  if (/\bkids\b|дет/.test(name) || g.variants.some((v) => v.sizes.some((z) => /\d\s*(лет|года?)\b/.test(z)))) return 4;
  if (/super\s*-?\s*oversize|супер\s*-?\s*оверсайз/.test(name)) return 2;
  if (/oversize|оверсайз/.test(name)) return 1;
  if (/\bregular\b/.test(name)) return 0;
  return 3;
}

const hasFabric = (g: Garment) => FABRIC.test(g.name.split(/\s+/).pop() ?? '');

/** Группирует товары API в модели с цветами. Только isForPrinting. */
export function groupProducts(products: ApiProduct[]): Garment[] {
  const map = new Map<string, Garment>();
  for (const p of products) {
    if (!p.isForPrinting || !SUPPORTED.includes(p.type)) continue;
    const name = modelNameOf(p);
    const id = `${p.type}:${name.toLowerCase()}`;
    const g = map.get(id) ?? { id, type: p.type, name, shapeId: shapeFor(p.type, name), basePrice: p.price, variants: [] };
    g.variants.push(toVariant(p));
    g.basePrice = Math.min(g.basePrice, p.price);
    map.set(id, g);
  }
  return [...map.values()].sort(
    (a, b) =>
      SUPPORTED.indexOf(a.type) - SUPPORTED.indexOf(b.type) || cutRank(a) - cutRank(b) ||
      // Тот же крой из другой ткани («REGULAR 92/8») — после базового
      Number(hasFabric(a)) - Number(hasFabric(b)) || a.basePrice - b.basePrice,
  );
}

/** Модель и цвет по адресу товара; нет такого товара в каталоге конструктора — null. */
export function findBySlug(garments: Garment[], slug: string) {
  for (const garment of garments) {
    const variant = garment.variants.find((v) => v.slug === slug);
    if (variant) return { garment, variant };
  }
  return null;
}

export async function fetchCatalog(signal?: AbortSignal): Promise<Garment[]> {
  const res = await fetch(`${PNHD_API_URL}/api/products`, { signal });
  if (!res.ok) throw new Error(`Каталог недоступен: ${res.status}`);
  const json = (await res.json()) as { data: ApiProduct[] };
  return groupProducts(json.data);
}
