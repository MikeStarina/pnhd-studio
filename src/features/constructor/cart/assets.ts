'use client';
import { useEffect, useState } from 'react';
import { createStore, delMany, get, keys, setMany } from 'idb-keyval';

/**
 * Картинки позиций «свой принт» в IndexedDB: превью, файлы печати и исходники весят мегабайты —
 * в localStorage (≈5 МБ на всё) они не помещаются. Ключ — `<id позиции>/<имя>`.
 */
const store = () => createStore('pnhd-cart-designs', 'assets');

/**
 * Храним байты и тип, а не Blob: WebKit (Safari в части режимов) не кладёт Blob в IndexedDB — запись падает.
 * ArrayBuffer принимают все браузеры.
 */
interface Stored { type: string; data: ArrayBuffer }

/** Свежая позиция могла записать картинки, но ещё не попасть в корзину (или в соседнюю вкладку): её не трогаем. */
const GRACE_MS = 10 * 60_000;

export const newDesignId = () => `d-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export async function putAssets(designId: string, entries: Array<[name: string, blob: Blob]>): Promise<string[]> {
  const pairs = await Promise.all(entries.map(async ([name, blob]): Promise<[string, Stored]> =>
    [`${designId}/${name}`, { type: blob.type, data: await blob.arrayBuffer() }]));
  await setMany(pairs, store());
  return pairs.map(([key]) => key);
}

export async function getAsset(key: string): Promise<Blob | undefined> {
  const hit = await get<Stored>(key, store());
  return hit && new Blob([hit.data], { type: hit.type });
}

export async function deleteDesignAssets(designId: string): Promise<void> {
  const all = (await keys<string>(store())).filter((k) => k.startsWith(`${designId}/`));
  if (all.length) await delMany(all, store());
}

/** Удаляет картинки позиций, которых нет в корзине (удалены в другой вкладке, брошено добавление). */
export async function collectGarbage(keepIds: string[]): Promise<void> {
  const keep = new Set(keepIds);
  const now = Date.now();
  const stale = (await keys<string>(store())).filter((k) => {
    const id = k.split('/')[0];
    const born = Number(id.split('-')[1]);
    return !keep.has(id) && !(now - born < GRACE_MS);
  });
  if (stale.length) await delMany(stale, store());
}

/** Адрес картинки из IndexedDB для <img>; null — пока читается или картинки нет. */
export function useAssetUrl(key: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!key) return setUrl(null);
    let made: string | null = null;
    let alive = true;
    getAsset(key).then((blob) => {
      if (!alive || !blob) return;
      made = URL.createObjectURL(blob);
      setUrl(made);
    }).catch(() => setUrl(null));
    return () => {
      alive = false;
      if (made) URL.revokeObjectURL(made);
    };
  }, [key]);
  return url;
}

/** Адреса нескольких картинок сразу (просмотр позиции крупно). Пустой список — ничего не грузим. */
export function useAssetUrls(keys: string[]): Array<string | null> {
  const [urls, setUrls] = useState<Array<string | null>>([]);
  // JSON, а не склейка разделителем: в ключе — имя файла клиента, в нём может быть любой символ
  const joined = JSON.stringify(keys);
  useEffect(() => {
    const list: string[] = JSON.parse(joined);
    const made: string[] = [];
    let alive = true;
    setUrls(list.map(() => null));
    Promise.all(list.map((key) => getAsset(key).catch(() => undefined))).then((blobs) => {
      const next = blobs.map((blob) => {
        if (!blob) return null;
        const url = URL.createObjectURL(blob);
        made.push(url);
        return url;
      });
      if (alive) setUrls(next);
      else made.forEach((url) => URL.revokeObjectURL(url));
    });
    return () => {
      alive = false;
      made.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [joined]);
  return urls;
}
