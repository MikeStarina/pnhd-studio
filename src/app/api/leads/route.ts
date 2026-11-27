import { NextResponse } from 'next/server';
import { addContact, bitrixCall, dealComments, siteDealFields } from '../orders/_lib/bitrix';
import { retryAfter } from '../orders/_lib/limit';
import { foreignOrigin, obj, requestAnalytics, str } from '../orders/_lib/parse';

const FORMS: Record<string, string> = {
  price: 'Посчитаем твой заказ (главная)',
  methods: 'Консультация (методы нанесения)',
  popup: 'Окно «Заполни форму»',
};

/**
 * Заявка на звонок с форм сайта → контакт и сделка «Заявка на звонок» в воронке «Студия» через ORDER_BITRIX_WEBHOOK.
 * Бэкенд каталога заявки больше не получает: его вебхук Битрикса сделок не создаёт, а ошибку он не возвращает.
 * Битрикс не принял — клиент видит ошибку и может повторить или позвонить.
 */
export async function POST(req: Request) {
  const wait = retryAfter(req);
  if (wait !== null) {
    return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429, headers: { 'Retry-After': String(wait) } });
  }
  if (foreignOrigin(req)) return NextResponse.json({ ok: false, error: 'bad_origin' }, { status: 403 });
  const raw = obj(await req.json().catch(() => null));
  const name = str(raw.name, 60);
  const phone = russianPhone(str(raw.phone, 30));
  if (name.length < 2 || !phone) return NextResponse.json({ ok: false, error: 'bad_lead' }, { status: 400 });
  const analytics = requestAnalytics(raw, req);
  const form = FORMS[str(raw.form, 20)] ?? '';
  const utm = Object.entries(analytics.utm).map(([k, v]) => `${k}=${v}`).join(', ');
  const text = [
    `Имя: ${name}`,
    `Телефон: ${phone}`,
    form && `Форма: ${form}`,
    analytics.page && `Страница: ${analytics.page}`,
    utm && `UTM: ${utm}`,
    analytics.roistat && `Визит Roistat: ${analytics.roistat}`,
  ].filter(Boolean).join('\n');

  const webhook = process.env.ORDER_BITRIX_WEBHOOK;
  if (!webhook) {
    console.log('[lead]', text.replace(/\n/g, ' | '));
    return NextResponse.json({ ok: true, delivered: 'log' });
  }
  const call = bitrixCall(webhook);
  try {
    const contactId = await addContact(call, { name, phone }, 'lead');
    await call<number>('crm.deal.add', {
      fields: {
        TITLE: 'Заявка на звонок',
        ...siteDealFields(analytics),
        ...(contactId ? { CONTACT_ID: contactId } : {}),
        COMMENTS: dealComments(text),
      },
      params: { REGISTER_SONET_EVENT: 'Y' },
    });
  } catch (e) {
    console.error('[lead] bitrix failed:', e, text.replace(/\n/g, ' | '));
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
  return NextResponse.json({ ok: true, delivered: 'bitrix' });
}

/** Российский номер в виде +7XXXXXXXXXX; null — не номер. */
function russianPhone(value: string): string | null {
  const digits = value.replace(/\D/g, '');
  if (digits.length === 10) return `+7${digits}`;
  if (digits.length === 11 && /^[78]/.test(digits)) return `+7${digits.slice(1)}`;
  return null;
}
