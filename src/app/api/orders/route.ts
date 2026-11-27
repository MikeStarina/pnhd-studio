import { NextResponse } from 'next/server';
import { deliverAndMark, ensureRetryLoop, hasChannel, logOrder } from './_lib/deliver';
import { BadOrder, DuplicateOrder, parseOrder, type Order } from './_lib/parse';
import { recordOrder } from './_lib/ledger';
import { saveDraft } from './_lib/mail/drafts';
import { retryAfter } from './_lib/limit';
import { markLogged, saveOrder } from './_lib/store';

/**
 * Приём заявки из конструктора.
 * 0. С одного адреса — не больше 20 заявок за 10 минут (_lib/limit.ts), иначе 429.
 * 1. Заявка проверяется; повторная отправка той же заявки (тот же номер и содержимое) второй сделки не создаёт.
 * 2. Заявка записывается в журнал (_lib/ledger.ts) и с файлами сохраняется на диск (ORDER_STORE_DIR).
 * 3. Отправляется в канал: Битрикс24, иначе Telegram (см. _lib/deliver.ts).
 * Если канал не ответил, клиент всё равно получает номер: заявка лежит на диске и уходит при повторных
 * попытках. Без настроенных каналов (локальная разработка) заявка остаётся на диске и в логе сервера.
 */
export async function POST(req: Request) {
  ensureRetryLoop();
  const wait = retryAfter(req);
  if (wait !== null) {
    return NextResponse.json({ ok: false, error: 'too_many_requests' }, { status: 429, headers: { 'Retry-After': String(wait) } });
  }
  let order: Order;
  try {
    order = await parseOrder(req);
  } catch (e) {
    if (e instanceof DuplicateOrder) return NextResponse.json({ ok: true, number: e.number, duplicate: true });
    if (e instanceof BadOrder) return NextResponse.json({ ok: false, error: e.code }, { status: e.status });
    throw e;
  }
  const done = (delivered: string, filesFailed = 0) =>
    NextResponse.json({ ok: true, number: order.number, delivered, filesFailed });

  // Журнал — не условие приёма: если запись не удалась, заявка всё равно уходит менеджеру.
  await recordOrder(order).catch((e) => console.error('[order]', order.number, 'not in ledger:', e));
  // Черновик письма покупателю (mail/drafts.ts): без него письмо просто не упомянет это изделие.
  await saveDraft(order).catch((e) => console.error('[mail]', order.number, 'draft not saved:', e));

  let stored = true;
  try {
    await saveOrder(order);
  } catch (e) {
    // Диск недоступен — работаем как без хранилища: заявка считается принятой, только если дошла до канала.
    stored = false;
    console.error('[order]', order.number, 'not stored:', e);
  }

  if (!hasChannel()) {
    logOrder(order);
    if (stored) await markLogged(order.number).catch(() => undefined);
    return done('log');
  }
  try {
    const res = await deliverAndMark(order);
    return done(res.channel, res.filesFailed.length);
  } catch (e) {
    console.error('[order]', order.number, 'delivery failed:', e);
    if (stored) return done('stored');
    logOrder(order);
    return NextResponse.json({ ok: false, error: 'delivery_failed' }, { status: 502 });
  }
}
