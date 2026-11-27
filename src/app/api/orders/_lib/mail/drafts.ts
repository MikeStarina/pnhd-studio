import { mkdir, readFile, readdir, rm, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pickupLine } from '@/features/constructor/config/pickup';
import { ORDER_NUMBER } from '../number';
import type { Order } from '../parse';
import { mailConfigured } from './send';
import type { MailItem } from './types';

/**
 * Черновики письма покупателю. Доставленная заявка теряет контакты и файлы (store.ts), а письмо собирается
 * после оформления всей корзины — поэтому позиция, превью и почта откладываются здесь при приёме заявки.
 * Черновик удаляется, когда письмо ушло; неотправленный — через сутки (dropStaleDrafts: по таймеру
 * повторной отправки заявок и при каждом новом черновике). Без настроенной почты черновики не пишутся.
 */
const DIR = path.join(path.resolve(process.env.ORDER_STORE_DIR || 'data/orders'), '_mail');
const KEEP_MS = 24 * 3600_000;

export interface Draft {
  email: string;
  item: Omit<MailItem, 'image'>;
  /** Превью изделия с принтом, PNG 192 px, base64. */
  preview: string | null;
  delivery: { kind: 'pickup' | 'delivery'; text: string };
}

const draftFile = (number: string) => path.join(DIR, `${number}.json`);

export async function saveDraft(o: Order): Promise<void> {
  if (!mailConfigured()) return;
  await dropStaleDrafts();
  // Превью передней стороны, если она есть: на ней обычно главный принт.
  const previews = o.files.filter((f) => f.title.startsWith('Макет на изделии'));
  const front = previews.find((f) => f.title.endsWith('перед')) ?? previews[0];
  const preview = front ? await thumbnail(Buffer.from(await front.file.arrayBuffer())) : null;
  const c = o.contacts;
  const draft: Draft = {
    email: c.email,
    item: {
      name: `${o.garment.name} — свой принт`,
      details: [
        ...o.lines.map((l) => `${l.color}: ${l.sizes.map(([size, n]) => `${size}×${n}`).join(', ')}`),
        `Печать ${o.method.toUpperCase()}: ${o.sides.map((s) => s.replace(/ ≈.*$/, '')).join(', ')}`,
      ],
      qty: o.qty,
      total: o.total,
    },
    preview,
    delivery: c.delivery === 'delivery'
      ? { kind: 'delivery', text: [c.city, c.address].filter(Boolean).join(', ') }
      : { kind: 'pickup', text: pickupLine() },
  };
  await mkdir(DIR, { recursive: true });
  await writeFile(draftFile(o.number), JSON.stringify(draft));
}

async function thumbnail(png: Buffer): Promise<string | null> {
  const { default: sharp } = await import('sharp');
  const out = await sharp(png).resize(192, 192, { fit: 'contain', background: '#f2f2f2' }).flatten({ background: '#f2f2f2' }).png().toBuffer();
  return out.toString('base64');
}

/** Черновики по номерам заявок; номер без черновика пропускается. */
export async function readDrafts(numbers: string[]): Promise<Array<{ number: string; draft: Draft }>> {
  await dropStaleDrafts();
  const found = await Promise.all(numbers.filter((n) => ORDER_NUMBER.test(n)).map(async (number) => {
    // Недописанный файл (перезапуск посреди записи) — как будто черновика нет: письмо уйдёт по остальным позициям.
    const draft = await readFile(draftFile(number), 'utf8').then((text) => JSON.parse(text) as Draft).catch(() => null);
    return draft ? { number, draft } : null;
  }));
  return found.filter((x) => x !== null);
}

export const dropDrafts = (numbers: string[]) =>
  Promise.all(numbers.map((n) => rm(draftFile(n), { force: true })));

/** Метка «письмо по этому оформлению ушло»: повторный запрос второго письма не шлёт. */
const sentFile = (key: string) => path.join(DIR, `sent-${key}`);
export const wasSent = (key: string) => stat(sentFile(key)).then(() => true, () => false);
export async function markSent(key: string): Promise<void> {
  await mkdir(DIR, { recursive: true });
  await writeFile(sentFile(key), new Date().toISOString());
}

/** Стирает черновики и метки отправки старше суток. */
export async function dropStaleDrafts(): Promise<void> {
  const names = await readdir(DIR).catch(() => []);
  const old = Date.now() - KEEP_MS;
  await Promise.all(names.map(async (name) => {
    const file = path.join(DIR, name);
    if (((await stat(file).catch(() => null))?.mtimeMs ?? Infinity) < old) await rm(file, { force: true });
  }));
}
