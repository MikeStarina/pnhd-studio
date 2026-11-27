import { NextResponse } from 'next/server';
import { fetchCatalog } from '@/features/constructor/api/catalog';
import { retryLoopAge } from '../orders/_lib/deliver';
import { listOrders, storeFreeBytes, storeWritable } from '../orders/_lib/store';

export const dynamic = 'force-dynamic';

const MINUTE = 60_000;
const GB = 1024 ** 3;
/** Заявка, которая ждёт отправки дольше этого, — авария. */
const STUCK_AFTER_MS = 15 * MINUTE;
/** Повторная отправка идёт раз в 5 минут: два пропущенных прохода — цикл остановился. */
const RETRY_STALE_MS = 11 * MINUTE;
/** Место на диске: меньше 1 ГБ — авария (заявки и выкладка не запишутся), меньше 3 ГБ — предупреждение. */
const SPACE_CRITICAL = 1 * GB;
const SPACE_WARNING = 3 * GB;
/** Непринятый Битриксом файл — предупреждение на сутки: в сделке есть просьба запросить макет. */
const KEPT_FILES_WARN_MS = 24 * 60 * MINUTE;
/** Битрикс, бэкенд и ключевые страницы проверяются не чаще раза в минуту: страницу может дёргать кто угодно. */
const REMOTE_CACHE_MS = MINUTE;
/**
 * Ключевые страницы открываются целиком с самого сервера: внешний мониторинг из-за зарубежного фильтра трафика
 * видит только, что сервер отвечает, а собирается ли страница до конца — видно отсюда.
 */
const KEY_PAGES = ['/', '/constructor', '/shop', '/cart', '/checkout'];
const SELF_URL = process.env.HEALTH_SELF_URL || `http://127.0.0.1:${process.env.PORT || 3000}`;

/**
 * Здоровье сайта для внешнего мониторинга.
 * 503 — авария: нет связи с Битриксом или бэкендом, застряли заявки, диск не пишет или кончается место,
 * остановилась повторная отправка заявок, ключевая страница не открывается на самом сервере. 200 — работает; предупреждения — в поле warnings (слово warning
 * в ответе ловит проверка по ключевому слову). В ответе только итоги проверок и версия — без ключей и данных клиентов.
 */
export async function GET() {
  const [remote, orders, disk, free] = await Promise.all([
    remoteChecks(),
    listOrders(),
    storeWritable(),
    storeFreeBytes().catch(() => null),
  ]);
  const now = Date.now();
  const stuck = orders.filter((m) => m.status === 'pending' && now - Date.parse(m.receivedAt) > STUCK_AFTER_MS).length;
  const keptFiles = orders.filter((m) => m.filesKept?.length && now - Date.parse(m.deliveredAt ?? m.receivedAt) < KEPT_FILES_WARN_MS).length;
  const retryAge = retryLoopAge();

  const checks = {
    bitrix: remote.bitrix,
    orders: stuck ? `${stuck} stuck` : 'ok',
    disk: disk ? 'ok' : 'not_writable',
    space: free === null ? 'unknown' : free < SPACE_CRITICAL ? `low_${(free / GB).toFixed(1)}gb` : 'ok',
    backend: remote.backend,
    retry: retryAge === null ? 'not_running' : retryAge > RETRY_STALE_MS ? 'stalled' : 'ok',
    pages: remote.pages,
  };
  const warnings = [
    ...(keptFiles ? [`files_not_delivered: ${keptFiles}`] : []),
    ...(free !== null && free >= SPACE_CRITICAL && free < SPACE_WARNING ? [`space_low: ${(free / GB).toFixed(1)}gb`] : []),
  ];
  const ok = Object.values(checks).every((v) => v === 'ok');
  return NextResponse.json(
    { ok, version: process.env.GIT_SHA || 'dev', checks, ...(warnings.length ? { warnings } : {}) },
    { status: ok ? 200 : 503, headers: { 'cache-control': 'no-store' } },
  );
}

const cache = globalThis as { __remoteHealth?: { at: number; result: { bitrix: string; backend: string; pages: string } } };

async function remoteChecks() {
  const hit = cache.__remoteHealth;
  if (hit && Date.now() - hit.at < REMOTE_CACHE_MS) return hit.result;
  const [bitrix, backend, pages] = await Promise.all([probeBitrix(), probeBackend(), probePages()]);
  cache.__remoteHealth = { at: Date.now(), result: { bitrix, backend, pages } };
  return cache.__remoteHealth.result;
}

/** Каждая ключевая страница открывается целиком; итог — 'ok' или список сбоев вида «/cart:500, /checkout:timeout». */
async function probePages(): Promise<string> {
  const failed = await Promise.all(KEY_PAGES.map(async (page) => {
    try {
      const r = await fetch(`${SELF_URL}${page}`, { signal: AbortSignal.timeout(15_000), cache: 'no-store' });
      await r.arrayBuffer();
      return r.ok ? null : `${page}:${r.status}`;
    } catch (e) {
      return `${page}:${e instanceof Error && e.name === 'TimeoutError' ? 'timeout' : 'error'}`;
    }
  }));
  const list = failed.filter(Boolean);
  return list.length ? list.join(', ') : 'ok';
}

/** Чтение полей сделки — самый лёгкий вызов, для которого хватает прав вебхука. */
async function probeBitrix(): Promise<string> {
  const webhook = process.env.ORDER_BITRIX_WEBHOOK?.trim();
  if (!webhook) return 'not_configured';
  try {
    const r = await fetch(`${webhook.replace(/\/+$/, '')}/crm.deal.fields.json`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(15_000),
    });
    const json = (await r.json().catch(() => ({}))) as { result?: unknown };
    return r.ok && json.result !== undefined ? 'ok' : `rejected_${r.status}`;
  } catch {
    return 'unreachable';
  }
}

/** Каталог бэкенда: без него не открываются товары и не считается цена в конструкторе. */
async function probeBackend(): Promise<string> {
  try {
    const garments = await fetchCatalog(AbortSignal.timeout(15_000));
    return garments.length ? 'ok' : 'empty_catalog';
  } catch {
    return 'unreachable';
  }
}
