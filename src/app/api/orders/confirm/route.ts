import { createHash } from 'node:crypto';
import { NextResponse } from 'next/server';
import { PNHD_API_URL } from '@/features/constructor/api/catalog';
import { retryAfter } from '../_lib/limit';
import { confirmationMail } from '../_lib/mail/confirmation';
import { dropDrafts, markSent, readDrafts, wasSent } from '../_lib/mail/drafts';
import { sendMail } from '../_lib/mail/send';
import type { ConfirmationMail, MailItem } from '../_lib/mail/types';

/**
 * Письмо покупателю после оформления корзины — одно на всё оформление.
 * Изделия с принтом — из черновиков, которые сервер отложил при приёме заявок (mail/drafts.ts): от клиента только номера.
 * Позиции каталога уходят на бэкенд api.pnhd.ru, прочитать их оттуда нельзя: названия и фото берём из публичного каталога
 * по id, от клиента — только размеры, количество и суммы. Получатель — почта из заявки с принтом, если она есть.
 */
export async function POST(req: Request) {
  const wait = retryAfter(req);
  if (wait !== null) {
    return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429, headers: { 'Retry-After': String(wait) } });
  }
  const body = parseBody(await req.json().catch(() => null));
  if (!body) return NextResponse.json({ ok: false, error: 'bad_request' }, { status: 400 });

  const key = createHash('sha256').update([body.catalog?.id ?? '', ...[...body.designs].sort()].join('|')).digest('hex').slice(0, 32);
  if (sending.has(key) || (await wasSent(key))) return NextResponse.json({ ok: true, sent: false, duplicate: true });
  sending.add(key);
  try {
    return await confirm(body, key);
  } finally {
    sending.delete(key);
  }
}

/** Оформления, по которым письмо отправляется прямо сейчас: второй такой же запрос не шлёт второе письмо. */
const sending = new Set<string>();

async function confirm(body: Body, key: string) {
  const drafts = await readDrafts(body.designs);
  let catalogItems: MailItem[] | null;
  try {
    catalogItems = body.catalog ? await catalogMailItems(body.catalog.items) : [];
  } catch (e) {
    console.error('[mail]', body.catalog?.id, 'catalog unavailable:', e);
    return NextResponse.json({ ok: false, error: 'catalog_unavailable' }, { status: 503 });
  }
  if (!catalogItems) return NextResponse.json({ ok: false, error: 'bad_product' }, { status: 400 });
  if (!drafts.length && !catalogItems.length) return NextResponse.json({ ok: true, sent: false });

  const designItems: MailItem[] = drafts.map(({ number, draft }) => ({
    ...draft.item,
    image: draft.preview ? { cid: `${number}@studio.pnhd.ru`, content: Buffer.from(draft.preview, 'base64'), contentType: 'image/png' } : undefined,
  }));
  const first = drafts[0]?.draft;
  const delivery: ConfirmationMail['delivery'] = body.catalog || !first
    ? body.delivery
    : { ...first.delivery, price: first.delivery.kind === 'pickup' ? 0 : null };
  const items = [...designItems, ...catalogItems];
  const data: ConfirmationMail = {
    to: first?.email ?? body.email,
    numbers: drafts.map((d) => d.number),
    items,
    delivery,
    total: items.reduce((sum, x) => sum + x.total, 0) + (delivery.price ?? 0),
  };

  let sent: boolean;
  try {
    sent = await sendMail(data.to, await confirmationMail(data));
  } catch (e) {
    console.error('[mail]', data.numbers.join(',') || body.catalog?.id, 'not sent:', e);
    return NextResponse.json({ ok: false, error: 'mail_failed' }, { status: 502 });
  }
  if (sent) await markSent(key).catch((e) => console.error('[mail] sent mark:', e));
  await dropDrafts(drafts.map((d) => d.number)).catch(() => undefined);
  return NextResponse.json({ ok: true, sent });
}

interface CatalogLine { productId: string; sizes: Array<[string, number]>; prints: number; total: number; fullTotal: number }
interface Body {
  email: string;
  designs: string[];
  catalog: { id: string; items: CatalogLine[] } | null;
  delivery: ConfirmationMail['delivery'];
}

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const money = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 10_000_000 ? Math.round(v) : null);
/** Убирает из текста клиента управляющие символы и ограничивает длину. */
const clean = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, ' ').trim().slice(0, max) : '');

function parseBody(raw: unknown): Body | null {
  if (!isObj(raw)) return null;
  const email = clean(raw.email, 100);
  const designs = Array.isArray(raw.designs) ? raw.designs.filter((n): n is string => typeof n === 'string').slice(0, 20) : [];
  const d = isObj(raw.delivery) ? raw.delivery : {};
  const kind = d.kind === 'delivery' ? 'delivery' : 'pickup';
  const price = d.price === null ? null : money(d.price);
  if (!EMAIL.test(email) || (d.price !== null && price === null)) return null;
  const catalog = raw.catalog === undefined || raw.catalog === null ? null : parseCatalog(raw.catalog);
  if (catalog === undefined) return null;
  return { email, designs, catalog, delivery: { kind, text: clean(d.text, 200), price } };
}

/** undefined — каталог прислан, но не прошёл проверку. */
function parseCatalog(raw: unknown): Body['catalog'] | undefined {
  if (!isObj(raw) || !Array.isArray(raw.items) || !raw.items.length || raw.items.length > 50) return undefined;
  const id = clean(raw.id, 64);
  if (!/^[\w-]{1,64}$/.test(id)) return undefined;
  const items = raw.items.map((x): CatalogLine | null => {
    if (!isObj(x) || typeof x.productId !== 'string' || !/^[a-f0-9]{24}$/.test(x.productId) || !isObj(x.sizes)) return null;
    const sizes = Object.entries(x.sizes)
      .filter((e): e is [string, number] => Number.isInteger(e[1]) && (e[1] as number) > 0 && (e[1] as number) <= 10_000)
      .map(([size, n]): [string, number] => [clean(size, 12), n]);
    const total = money(x.total);
    const fullTotal = money(x.fullTotal);
    const prints = Number.isInteger(x.prints) ? Math.min(Math.max(x.prints as number, 0), 4) : 0;
    return sizes.length && total !== null && fullTotal !== null ? { productId: x.productId, sizes, prints, total, fullTotal } : null;
  });
  return items.every((x) => x !== null) ? { id, items: items as CatalogLine[] } : undefined;
}

interface ApiProduct { _id: string; name: string; color?: string; photos?: string[]; image_url?: string }

/** Позиции каталога для письма; null — в каталоге нет такого товара. */
async function catalogMailItems(lines: CatalogLine[]): Promise<MailItem[] | null> {
  const res = await fetch(`${PNHD_API_URL}/api/products`, { next: { revalidate: 300 } });
  if (!res.ok) throw new Error(`catalog ${res.status}`);
  const products = new Map(((await res.json()) as { data: ApiProduct[] }).data.map((p) => [p._id, p]));
  const items = lines.map((l): MailItem | null => {
    const p = products.get(l.productId);
    if (!p) return null;
    const photo = p.photos?.find((u) => /^https:\/\//.test(u)) ?? (/^https:\/\//.test(p.image_url ?? '') ? p.image_url : undefined);
    const sizes = l.sizes.map(([size, n]) => `${size}×${n}`).join(', ');
    return {
      name: p.name,
      details: [
        p.color ? `${p.color}: ${sizes}` : sizes,
        ...(l.prints ? [`Печать: ${l.prints} ${l.prints === 1 ? 'место' : 'места'}`] : []),
      ],
      qty: l.sizes.reduce((sum, [, n]) => sum + n, 0),
      total: l.total,
      fullTotal: l.fullTotal > l.total ? l.fullTotal : undefined,
      image: photo ? { url: photo } : undefined,
    };
  });
  return items.every((x) => x !== null) ? (items as MailItem[]) : null;
}
