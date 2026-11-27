'use client';
import { getClientId, readEntry } from '@/components/site/analytics';
import { getUtm } from '../analytics/utm';
import { fetchCatalog } from '../api/catalog';
import { calcPrice, priceVariants } from '../model/pricing';
import { visibleLayers } from '../model/visibility';
import type { OrderContacts, Side } from '../model/types';
import { buildOrderPdf } from '../pdf/orderPdf';
import { getAsset } from './assets';
import type { CartDesign } from './types';

const ENDPOINT = '/api/orders';

/**
 * Заявка на позицию «свой принт» из оформления (adr/0001): тот же пакет, что у формы в конструкторе, —
 * файлы печати, превью по цветам, исходники клиента, PDF и design.json. Картинки берутся из IndexedDB:
 * на оформлении холста нет. Цену сервер считает сам, от клиента — только что и сколько печатать.
 * `number` — номер, выданный при прошлой попытке: с ним сервер узнаёт повтор той же заявки.
 * `printFiles` — файлы для печати, которые клиент приложил на оформлении.
 */
export async function buildDesignOrder(
  design: CartDesign, contacts: OrderContacts, number?: string, printFiles: File[] = [],
): Promise<{ number: string; form: FormData }> {
  const garment = (await fetchCatalog()).find((g) => g.id === design.garment.id);
  if (!garment) throw new Error('garment_missing');
  const price = calcPrice({ method: design.method, bounds: design.bounds, variants: priceVariants(garment, design.quantities), currentId: null });
  if (!price.lines.length) throw new Error('no_sizes');
  // Размер или цвет пропал из каталога: расчёт молча отбросил бы его, и в заявку ушло бы меньше, чем видит покупатель.
  const wanted = Object.values(design.quantities).flatMap((sizes) => Object.values(sizes)).reduce((sum, n) => sum + n, 0);
  if (price.qty !== wanted) throw new Error('catalog_changed');
  const issued = number ?? (await issueNumber());

  const form = new FormData();
  const previews: Array<{ color: string; side: Side; dataUrl: string }> = [];
  const urls: string[] = [];
  try {
    // Превью нумеруются по строкам заявки: по номеру сервер подписывает цвет.
    for (const [i, line] of price.lines.entries()) {
      for (const side of design.sides) {
        const preview = design.previews.find((p) => p.productId === line.productId && p.side === side);
        const blob = preview && (await getAsset(preview.asset));
        if (!blob) continue;
        form.append(`preview_${i}_${side}`, blob, `preview_${i}_${side}.png`);
        const url = URL.createObjectURL(blob);
        urls.push(url);
        previews.push({ color: line.color, side, dataUrl: url });
      }
    }
    for (const print of design.prints) {
      form.append(`print_${print.side}`, await required(print.asset), `print_${print.side}_${print.dpi}dpi.png`);
      if (print.vector) form.append(`print_vector_${print.side}`, await required(print.vector), `print_${print.side}_vector.pdf`);
    }
    for (const [i, original] of design.originals.entries()) {
      form.append(`original_${i}`, await required(original.asset), original.name);
    }
    printFiles.forEach((file, i) => form.append(`attachment_${i}`, file, file.name));
    const pdf = await buildOrderPdf({
      number: issued, createdAt: new Date(), garment: garment.name, method: design.method, price, contacts, previews,
      fileNames: design.originals.map((o) => o.name),
    });
    form.append('order_pdf', pdf, `order_${issued}.pdf`);
  } finally {
    urls.forEach((url) => URL.revokeObjectURL(url));
  }

  // Слои с положением, размером и шрифтами; картинки — файлами заявки, в JSON вместо них имя файла.
  const assetKey = `${design.id}/`;
  form.append('design_json', new Blob([JSON.stringify({
    version: 1,
    garment: { id: garment.id, name: garment.name, shapeId: garment.shapeId },
    method: design.method,
    layers: visibleLayers(design.layers).filter((l) => design.sides.includes(l.side)).map((l) =>
      l.kind === 'image' ? { ...l, src: l.src.startsWith(assetKey) ? undefined : l.src, file: l.fileName } : l),
  })], { type: 'application/json' }), 'design.json');

  form.append('order', JSON.stringify({
    number: issued,
    garment: { id: garment.id, name: garment.name },
    method: design.method,
    lines: price.lines.map((l) => ({ productId: l.productId, color: l.color, sizes: Object.fromEntries(l.sizes) })),
    printSizes: (price.lines[0]?.sides ?? []).map(({ side, wCm, hCm }) => ({ side, wCm, hCm })),
    contacts,
    utm: getUtm(),
    clientId: await getClientId(),
    source: readEntry().source,
    page: window.location.href.split('?')[0],
  }));
  return { number: issued, form };
}

/** Отправляет собранную заявку; возвращает номер, под которым сервер её принял. */
export async function sendDesignOrder(order: { number: string; form: FormData }): Promise<string> {
  const res = await fetch(ENDPOINT, { method: 'POST', body: order.form });
  if (!res.ok) throw new Error(`order_${res.status}`);
  return String((await res.json().catch(() => ({}))).number ?? order.number);
}

async function issueNumber(): Promise<string> {
  const res = await fetch(`${ENDPOINT}/number`, { method: 'POST' });
  const number = res.ok ? String((await res.json()).number ?? '') : '';
  if (!number) throw new Error(`number_${res.status}`);
  return number;
}

/** Файл печати или исходник пропал из хранилища браузера — заявку без него не отправляем. */
async function required(key: string): Promise<Blob> {
  const blob = await getAsset(key);
  if (!blob) throw new Error('asset_missing');
  return blob;
}
