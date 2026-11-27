import { NextResponse } from 'next/server';
import { telegramNick } from '@/app/utils/telegram';
import { addContact, bitrixCall, CRM, dealComments, siteDealFields } from '../_lib/bitrix';
import { retryAfter } from '../_lib/limit';
import { foreignOrigin, obj, requestAnalytics, str } from '../_lib/parse';

/**
 * Сделка «Новый заказ с сайта» для заказа каталога, который уже принял бэкенд api.pnhd.ru (его номер — id).
 * Бэкенд сам создаёт сделку старым вебхуком, но тот сделок не создаёт, а ошибку бэкенд не возвращает —
 * поэтому сделку создаёт сервер сайта через ORDER_BITRIX_WEBHOOK. Заказ к этому моменту уже сохранён:
 * сбой Битрикса покупателю не показываем, состав заказа остаётся в логе сервера.
 */
export async function POST(req: Request) {
  const wait = retryAfter(req);
  if (wait !== null) {
    return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429, headers: { 'Retry-After': String(wait) } });
  }
  if (foreignOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  const raw = obj(await req.json().catch(() => null));
  const order = parseCatalogOrder(raw);
  if (!order) return NextResponse.json({ ok: false, error: 'bad_order' }, { status: 400 });
  if (sent.has(order.id)) return NextResponse.json({ ok: true, duplicate: true });
  const analytics = requestAnalytics(raw, req);
  const text = catalogOrderText(order, analytics.roistat);

  const webhook = process.env.ORDER_BITRIX_WEBHOOK;
  if (!webhook) {
    console.log('[catalog]', text.replace(/\n/g, ' | '));
    return NextResponse.json({ ok: true, delivered: 'log' });
  }
  sent.add(order.id);
  const call = bitrixCall(webhook);
  try {
    const contactId = await addContact(call, order.contacts, order.id);
    await call<number>('crm.deal.add', {
      fields: {
        TITLE: `Новый заказ с сайта № ${order.id}`,
        ...siteDealFields(analytics),
        ...(contactId ? { CONTACT_ID: contactId } : {}),
        OPPORTUNITY: order.sum,
        CURRENCY_ID: 'RUB',
        COMMENTS: dealComments(text),
        [CRM.orderNumber]: order.id,
        [CRM.page.field]: CRM.page.cart,
      },
      params: { REGISTER_SONET_EVENT: 'Y' },
    });
  } catch (e) {
    sent.delete(order.id);
    console.error('[catalog]', order.id, 'bitrix failed:', e, text.replace(/\n/g, ' | '));
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: 'bitrix' });
}

/** Номера заказов, по которым сделка уже создана или создаётся: повтор запроса второй сделки не даёт. */
const sent = new Set<string>();

interface CatalogItem {
  name: string;
  color: string;
  sizes: Array<[string, number]>;
  total: number;
  prints: Array<{ name: string; size: string; price: number; file: string }>;
}
interface CatalogOrder {
  id: string;
  contacts: { name: string; phone: string; email: string; telegram: string };
  items: CatalogItem[];
  promo: string;
  delivery: string;
  shipping: number;
  sum: number;
}

const money = (v: unknown) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 && v < 10_000_000 ? Math.round(v) : null);
const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

function parseCatalogOrder(raw: Record<string, unknown>): CatalogOrder | null {
  const id = str(raw.id, 40);
  const c = obj(raw.contacts);
  const sum = money(raw.sum);
  const shipping = money(raw.shipping);
  const items = Array.isArray(raw.items) ? raw.items.slice(0, 50).map(parseItem) : [];
  if (!/^[\w-]{1,40}$/.test(id) || sum === null || shipping === null || !items.length || items.some((x) => !x)) return null;
  const phone = str(c.phone, 30).replace(/\D/g, '');
  return {
    id,
    contacts: {
      name: str(c.name, 80),
      phone: phone.length === 11 ? `+7${phone.slice(1)}` : phone.length === 10 ? `+7${phone}` : str(c.phone, 30),
      email: str(c.email, 120),
      telegram: telegramNick(str(c.telegram, 100)) ?? '',
    },
    items: items as CatalogItem[],
    promo: str(raw.promo, 60),
    delivery: str(raw.delivery, 300),
    shipping,
    sum,
  };
}

function parseItem(v: unknown): CatalogItem | null {
  const x = obj(v);
  const total = money(x.total);
  const sizes = Array.isArray(x.sizes)
    ? x.sizes.slice(0, 20).map((s): [string, number] => [str(obj(s).name, 20), money(obj(s).qty) ?? 0]).filter(([n, q]) => n && q > 0)
    : [];
  const prints = Array.isArray(x.prints)
    ? x.prints.slice(0, 10).map((p) => ({
      name: str(obj(p).name, 120), size: str(obj(p).size, 40), price: money(obj(p).price) ?? 0, file: str(obj(p).file, 500),
    }))
    : [];
  const name = str(x.name, 200);
  return name && total !== null && sizes.length ? { name, color: str(x.color, 60), sizes, total, prints } : null;
}

function catalogOrderText(o: CatalogOrder, roistat: string): string {
  const c = o.contacts;
  return [
    `Заказ из каталога № ${o.id}`,
    '',
    ...o.items.flatMap((x) => [
      `${x.name}${x.color ? `, ${x.color}` : ''}: ${x.sizes.map(([n, q]) => `${n} — ${q}`).join(', ')} — ${rub(x.total)}`,
      ...x.prints.map((p) => `  Принт: ${[p.name, p.size].filter(Boolean).join(', ')}${p.price ? ` — ${rub(p.price)}` : ''}${/^https?:\/\//.test(p.file) ? ` ${p.file}` : ''}`),
    ]),
    '',
    o.promo ? `Промокод: ${o.promo}` : null,
    `Получение: ${o.delivery || '—'}${o.shipping ? ` — ${rub(o.shipping)}` : ''}`,
    `Итого: ${rub(o.sum)}`,
    '',
    `Имя: ${c.name}`,
    `Телефон: ${c.phone}`,
    c.email ? `Почта: ${c.email}` : null,
    c.telegram ? `Telegram: ${c.telegram}` : null,
    roistat ? `Визит Roistat: ${roistat}` : null,
  ].filter((line) => line !== null).join('\n');
}
