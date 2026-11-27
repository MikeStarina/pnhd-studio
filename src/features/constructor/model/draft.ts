import { createStore, delMany, get, keys, setMany } from 'idb-keyval';
import { DEFAULT_FONT } from '../config/fonts';
import type { DesignLayer, PrintMethod, Side, SizeQuantities } from './types';

/**
 * Черновик дизайна в браузере. Изделие, цвет, слои всех сторон и размеры — в localStorage.
 * Картинки — в IndexedDB: в localStorage (≈5 МБ на весь сайт, вместе с корзиной) фото с телефона не помещается.
 * В сохранённом слое вместо адреса картинки стоит ссылка `idb:<ключ>`.
 */
const KEY = 'pnhd-constructor-draft:1';
/** Свой черновик у правки позиции корзины и у принта на товар из корзины: общий они не трогают. */
const keyOf = (scope?: string) => (scope ? `${KEY}:${scope}` : KEY);

const images = () => createStore('pnhd-constructor-draft', 'images');
const REF = 'idb:';
/** Байты и тип, а не Blob: WebKit (Safari в части режимов) не кладёт Blob в IndexedDB — запись падает. */
interface StoredImage { type: string; data: ArrayBuffer }
/** Картинка на странице (ключ черновика + её адрес) → ключ в IndexedDB: при каждой правке файл заново не пишем. */
const stored = new Map<string, string>();

export interface Draft {
  garmentId: string | null;
  variantId: string | null;
  side: Side;
  method: PrintMethod;
  /** Количество по размерам для каждого цвета (ключ — productId). */
  quantities: Record<string, SizeQuantities>;
  layers: DesignLayer[];
  savedAt: number;
  /** Картинки не сохранились или не нашлись — их придётся загрузить заново. */
  imagesDropped: boolean;
}

export type DraftState = Omit<Draft, 'savedAt' | 'imagesDropped'>;
export type SaveResult = 'saved' | 'no-images' | 'failed' | 'cleared';

const anyQty = (q: Record<string, SizeQuantities> | undefined) =>
  Object.values(q ?? {}).some((sizes) => Object.values(sizes).some((n) => n > 0));
const isEmpty = (s: DraftState) => !s.layers.length && !anyQty(s.quantities);

export async function saveDraft(s: DraftState, scope?: string): Promise<SaveResult> {
  if (isEmpty(s)) {
    // Пустой холст сохраняется после каждой смены изделия: в IndexedDB идём, только если черновик был.
    if (loadDraft(scope)) clearDraft(scope);
    return 'cleared';
  }
  // IndexedDB недоступна или переполнена: текст, размеры и изделие сохраняем, картинки — нет.
  const layers = await storeImages(s.layers, scope).catch(() => s.layers.filter((l) => l.kind !== 'image'));
  const imagesDropped = layers.length < s.layers.length;
  if (!write({ ...s, layers, savedAt: Date.now(), imagesDropped }, scope)) return 'failed';
  return imagesDropped ? 'no-images' : 'saved';
}

export function loadDraft(scope?: string): Draft | null {
  try {
    const raw = localStorage.getItem(keyOf(scope));
    if (!raw) return null;
    const d = JSON.parse(raw) as Draft & { sizes?: SizeQuantities };
    if (!d || !Array.isArray(d.layers)) return null;
    // Старые черновики: размеры были общими — относим их к сохранённому цвету.
    if (!d.quantities) d.quantities = d.sizes && d.variantId ? { [d.variantId]: d.sizes } : {};
    delete d.sizes;
    // Поля текста, которых не было в старых черновиках, добираем значениями по умолчанию.
    d.layers = d.layers.map((l) => (l.kind === 'text'
      ? Object.assign({ fontFamily: DEFAULT_FONT, bold: false, italic: false, lineHeight: 1.1, strokeWidth: 0, strokeColor: '#ffffff', arc: 0 }, l)
      : l));
    return d;
  } catch {
    return null;
  }
}

/**
 * Возвращает слоям черновика картинки из IndexedDB (как blob:-адреса) и удаляет те, на которые он уже не ссылается.
 * Слой, картинка которого не нашлась, пропадает — тогда imagesDropped. Вызывать перед тем, как показывать черновик на холсте.
 */
export async function restoreImages(d: Draft, scope?: string): Promise<Draft> {
  const refs = d.layers.flatMap((l) => (l.kind === 'image' && l.src.startsWith(REF) ? [l.src.slice(REF.length)] : []));
  const layers = (await Promise.all(d.layers.map(async (l) => {
    if (l.kind !== 'image' || !l.src.startsWith(REF)) return [l];
    const key = l.src.slice(REF.length);
    const hit = await get<StoredImage>(key, images()).catch(() => undefined);
    if (!hit) return [];
    const src = URL.createObjectURL(new Blob([hit.data], { type: hit.type }));
    stored.set(`${keyOf(scope)}/${src}`, key);
    return [{ ...l, src }];
  }))).flat();
  dropImages(scope, refs).catch(() => { /* хранилище недоступно */ });
  return { ...d, layers, imagesDropped: d.imagesDropped || layers.length < d.layers.length };
}

export function clearDraft(scope?: string) {
  try { localStorage.removeItem(keyOf(scope)); } catch { /* хранилище недоступно */ }
  Array.from(stored.keys()).filter((src) => src.startsWith(`${keyOf(scope)}/`)).forEach((src) => stored.delete(src));
  dropImages(scope).catch(() => { /* хранилище недоступно */ });
}

/** В черновике есть что продолжать. */
export const hasContent = (d: Draft) => !!d.layers.length || anyQty(d.quantities) || d.imagesDropped;

function write(d: Draft, scope?: string): boolean {
  try {
    localStorage.setItem(keyOf(scope), JSON.stringify(d));
    return true;
  } catch {
    return false;
  }
}

/** Кладёт в IndexedDB картинки, которых там ещё нет, и возвращает слои со ссылками на них. */
async function storeImages(layers: DesignLayer[], scope?: string): Promise<DesignLayer[]> {
  const prefix = `${keyOf(scope)}/`;
  const fresh = Array.from(new Set(layers.flatMap((l) => (l.kind === 'image' && !stored.has(prefix + l.src) ? [l.src] : []))));
  const entries = await Promise.all(fresh.map(async (src): Promise<[string, StoredImage]> => {
    const blob = await (await fetch(src)).blob();
    return [`${prefix}${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, { type: blob.type, data: await blob.arrayBuffer() }];
  }));
  if (entries.length) await setMany(entries, images());
  fresh.forEach((src, i) => stored.set(prefix + src, entries[i][0]));
  return layers.map((l) => (l.kind === 'image' ? { ...l, src: REF + stored.get(prefix + l.src) } : l));
}

/** Удаляет картинки черновика, кроме перечисленных. */
async function dropImages(scope?: string, keep: string[] = []) {
  const stale = (await keys<string>(images())).filter((k) => k.startsWith(`${keyOf(scope)}/`) && !keep.includes(k));
  if (stale.length) await delMany(stale, images());
}
