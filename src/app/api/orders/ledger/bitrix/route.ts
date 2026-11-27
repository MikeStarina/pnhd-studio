import { lookup } from 'node:dns/promises';
import { NextResponse } from 'next/server';
import { authorized } from '../../_lib/basic-auth';

export const dynamic = 'force-dynamic';

/**
 * Проверка связи сервера сайта с Битрикс24 — без доступа к серверу и его логам. Закрыта тем же паролем, что журнал.
 * Показывает адрес портала и номер пользователя вебхука (без ключа), адреса из DNS и итог чтения полей сделки:
 * время или ошибку с кодом (ETIMEDOUT, ENOTFOUND, отказ Битрикса). Для сравнения — запрос к api.pnhd.ru.
 */
export async function GET(req: Request) {
  const token = process.env.ORDER_LEDGER_TOKEN;
  if (!token) return new Response('Not found', { status: 404 });
  if (!authorized(req.headers.get('authorization'), token)) {
    return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="orders", charset="UTF-8"' } });
  }
  const webhook = process.env.ORDER_BITRIX_WEBHOOK ?? '';
  const url = parseUrl(webhook.trim());
  return NextResponse.json({
    webhook: url
      ? { host: url.host, user: url.pathname.split('/')[2] ?? '', clean: webhook === webhook.trim() && /^https?:\/\/[^\s]+$/.test(webhook) }
      : { set: Boolean(webhook), valid: false },
    dns: url ? await lookup(url.hostname, { all: true }).then((a) => a.map((x) => x.address)).catch((e) => errorText(e)) : null,
    bitrix: url ? await probe(`${webhook.trim().replace(/\/+$/, '')}/crm.deal.fields.json`, true) : null,
    control: await probe(`${process.env.NEXT_PUBLIC_API_URL || 'https://api.pnhd.ru'}/api/categories/`, false),
  }, { headers: { 'cache-control': 'no-store' } });
}

const parseUrl = (s: string) => {
  try {
    return new URL(s);
  } catch {
    return null;
  }
};

/** Ошибка fetch в Node прячет причину в cause: код сети (ETIMEDOUT, ECONNREFUSED…) — там. */
const errorText = (e: unknown) => {
  const err = e as { name?: string; message?: string; cause?: { code?: string; message?: string } };
  return [err.name, err.cause?.code, err.cause?.message ?? err.message].filter(Boolean).join(': ');
};

async function probe(target: string, bitrix: boolean) {
  const started = Date.now();
  try {
    const r = await fetch(target, { method: bitrix ? 'POST' : 'GET', headers: { 'content-type': 'application/json' }, body: bitrix ? '{}' : undefined, signal: AbortSignal.timeout(30_000) });
    const json = bitrix ? ((await r.json().catch(() => ({}))) as { result?: unknown; error?: string; error_description?: string }) : {};
    return {
      ok: r.ok && (!bitrix || json.result !== undefined),
      status: r.status,
      ms: Date.now() - started,
      ...(json.error ? { error: `${json.error}: ${json.error_description ?? ''}` } : {}),
    };
  } catch (e) {
    return { ok: false, ms: Date.now() - started, error: errorText(e) };
  }
}
