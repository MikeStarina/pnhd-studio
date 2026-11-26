import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { ORDER_NUMBER } from './number';
import type { Order, OrderFile } from './parse';

/**
 * Хранилище заявок на диске: заявка сначала сохраняется, потом отправляется в канал.
 * Если канал недоступен, она остаётся здесь и уходит при повторной попытке (см. deliver.ts).
 *
 *   <папка>/<номер>/meta.json   — состояние и, пока заявка не доставлена, её данные
 *   <папка>/<номер>/files/*     — файлы заявки; после доставки удаляются, кроме тех, что канал не принял
 *
 * После доставки от заявки остаётся короткая запись без контактов клиента: по ней сервер узнаёт
 * повторную отправку той же заявки и не создаёт вторую сделку.
 */
const DIR = path.resolve(process.env.ORDER_STORE_DIR || 'data/orders');

/** Сколько хранить записи о доставленных заявках и заявки, принятые без каналов. */
const KEEP_DELIVERED_DAYS = 30;

export interface StoredFile { title: string; name: string; type: string }

export interface StoredOrder {
  number: string;
  /** Отпечаток содержимого заявки: тот же номер с другим содержимым — другая заявка. */
  fingerprint: string;
  /** pending — ждёт отправки в канал; delivered — доставлена; logged — принята без каналов (разработка), сама не отправляется. */
  status: 'pending' | 'delivered' | 'logged';
  receivedAt: string;
  attempts: number;
  lastAttemptAt?: string;
  deliveredAt?: string;
  channel?: string;
  total: number;
  /** Данные заявки без файлов — только пока она не доставлена. */
  order?: Omit<Order, 'files'>;
  files?: StoredFile[];
  /** Файлы, которые канал не принял: лежат в files/, пока запись не удалится по сроку. */
  filesKept?: string[];
}

const dirOf = (number: string) => path.join(DIR, number);
const metaOf = (number: string) => path.join(dirOf(number), 'meta.json');

export async function findOrder(number: string): Promise<StoredOrder | null> {
  if (!ORDER_NUMBER.test(number)) return null;
  try {
    return JSON.parse(await readFile(metaOf(number), 'utf8')) as StoredOrder;
  } catch {
    return null;
  }
}

const writeMeta = (m: StoredOrder) => writeFile(metaOf(m.number), JSON.stringify(m, null, 2));

/** Сохраняет принятую заявку с файлами. Бросает ошибку, если диск недоступен. */
export async function saveOrder(o: Order): Promise<void> {
  const filesDir = path.join(dirOf(o.number), 'files');
  await mkdir(filesDir, { recursive: true });
  for (const f of o.files) await writeFile(path.join(filesDir, f.name), Buffer.from(await f.file.arrayBuffer()));
  const { files, ...order } = o;
  await writeMeta({
    number: o.number, fingerprint: o.fingerprint, status: 'pending', receivedAt: new Date().toISOString(), attempts: 0,
    total: o.total, order, files: files.map((f) => ({ title: f.title, name: f.name, type: f.file.type })),
  });
}

/**
 * Заявка доставлена: файлы и контакты клиента удаляются, остаётся короткая запись.
 * Файлы, которые канал не принял (`kept`), остаются: это может быть сам файл печати, а второй копии нет.
 */
export async function markDelivered(number: string, channel: string, kept: string[] = []): Promise<void> {
  const m = await findOrder(number);
  if (!m) return;
  const filesDir = path.join(dirOf(number), 'files');
  if (kept.length) {
    for (const name of await readdir(filesDir)) if (!kept.includes(name)) await rm(path.join(filesDir, name), { force: true });
  } else {
    await rm(filesDir, { recursive: true, force: true });
  }
  await writeMeta({
    number, fingerprint: m.fingerprint, status: 'delivered', receivedAt: m.receivedAt, attempts: m.attempts,
    deliveredAt: new Date().toISOString(), channel, total: m.total,
    ...(kept.length ? { filesKept: kept } : {}),
  });
}

/** Каналов нет (локальная разработка): заявка остаётся на диске целиком, но в канал потом сама не уйдёт. */
export async function markLogged(number: string): Promise<void> {
  const m = await findOrder(number);
  if (m) await writeMeta({ ...m, status: 'logged' });
}

/** Отмечает неудачную попытку доставки. */
export async function markAttempt(number: string): Promise<void> {
  const m = await findOrder(number);
  if (!m || m.status !== 'pending') return;
  await writeMeta({ ...m, attempts: m.attempts + 1, lastAttemptAt: new Date().toISOString() });
}

/** Собирает заявку обратно из сохранённого — для повторной отправки. */
export async function loadOrder(m: StoredOrder): Promise<Order | null> {
  if (!m.order || !m.files) return null;
  const files: OrderFile[] = [];
  for (const f of m.files) {
    try {
      const buf = await readFile(path.join(dirOf(m.number), 'files', f.name));
      files.push({ title: f.title, name: f.name, file: new File([buf], f.name, { type: f.type }) });
    } catch {
      // Файл пропал с диска — заявка уйдёт без него, менеджер запросит макет у клиента.
    }
  }
  // Заявки, сохранённые до поля rejectedFiles, его не содержат.
  return { ...m.order, rejectedFiles: m.order.rejectedFiles ?? [], files };
}

/** Все записи хранилища; заодно удаляет старые записи о доставленных заявках. */
export async function listOrders(): Promise<StoredOrder[]> {
  let names: string[];
  try {
    names = await readdir(DIR);
  } catch {
    return [];
  }
  const out: StoredOrder[] = [];
  const tooOld = Date.now() - KEEP_DELIVERED_DAYS * 24 * 3600 * 1000;
  for (const name of names) {
    const m = await findOrder(name);
    if (!m) continue;
    if (m.status !== 'pending' && Date.parse(m.deliveredAt ?? m.receivedAt) < tooOld) {
      await rm(dirOf(name), { recursive: true, force: true }).catch(() => undefined);
      continue;
    }
    out.push(m);
  }
  return out;
}
