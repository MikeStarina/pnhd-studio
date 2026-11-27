import { sendToBitrix } from './bitrix';
import { dropStaleDrafts } from './mail/drafts';
import { orderText, type Order } from './parse';
import { findOrder, listOrders, loadOrder, markAttempt, markDelivered } from './store';
import { sendToTelegram } from './telegram';

/**
 * Доставка заявки в канал. Канал выбирается переменными окружения:
 *   ORDER_BITRIX_WEBHOOK                — сделка в Битрикс24 с файлами;
 *   ORDER_TELEGRAM_BOT_TOKEN + CHAT_ID  — сообщение и файлы в чат Telegram.
 * Если Битрикс недоступен, заявка уходит в Telegram.
 */
export interface Delivered { channel: 'bitrix' | 'telegram'; filesFailed: string[] }

export const hasChannel = () =>
  Boolean(process.env.ORDER_BITRIX_WEBHOOK || (process.env.ORDER_TELEGRAM_BOT_TOKEN && process.env.ORDER_TELEGRAM_CHAT_ID));

/** @returns куда ушла заявка; бросает ошибку, если не принял ни один настроенный канал. */
export async function deliver(order: Order): Promise<Delivered> {
  const webhook = process.env.ORDER_BITRIX_WEBHOOK;
  if (webhook) {
    try {
      return { channel: 'bitrix', filesFailed: await sendToBitrix(order, webhook) };
    } catch (e) {
      console.error('[order]', order.number, 'bitrix failed:', e);
    }
  }
  const token = process.env.ORDER_TELEGRAM_BOT_TOKEN;
  const chat = process.env.ORDER_TELEGRAM_CHAT_ID;
  if (token && chat) return { channel: 'telegram', filesFailed: await sendToTelegram(order, token, chat) };
  throw new Error('no_channel_accepted');
}

/** Номера заявок, которые отправляются прямо сейчас: одну заявку не отправляем дважды одновременно. */
const busy = new Set<string>();
export const isBusy = (number: string) => busy.has(number);

/** Отправляет заявку и отмечает результат в хранилище. */
export async function deliverAndMark(order: Order): Promise<Delivered> {
  busy.add(order.number);
  try {
    const res = await deliver(order);
    if (res.filesFailed.length) console.error('[order]', order.number, 'files not delivered:', res.filesFailed);
    await markDelivered(order.number, res.channel, res.filesFailed).catch((e) => console.error('[order]', order.number, 'store:', e));
    return res;
  } catch (e) {
    await markAttempt(order.number).catch(() => undefined);
    throw e;
  } finally {
    busy.delete(order.number);
  }
}

/** Пауза перед следующей попыткой: 1, 2, 4… минут, не больше часа. */
const backoffMs = (attempts: number) => Math.min(2 ** Math.max(attempts - 1, 0), 60) * 60_000;
/** После стольких неудач заявка остаётся в хранилище, но сама больше не отправляется. */
const MAX_ATTEMPTS = 60;

/** Идёт ли проход повторной отправки: следующий тик таймера не начинает второй поверх него. */
let retrying = false;

/** Повторная отправка заявок, которые не дошли до канала. */
export async function retryPending(): Promise<void> {
  if (!hasChannel() || retrying) return;
  retrying = true;
  try {
    for (const listed of await listOrders()) {
      // Список прочитан в начале прохода: пока шли другие заявки, эту мог отправить приём новой заявки.
      const m = await findOrder(listed.number);
      if (!m || m.status !== 'pending' || busy.has(m.number) || m.attempts >= MAX_ATTEMPTS) continue;
      if (m.lastAttemptAt && Date.now() - Date.parse(m.lastAttemptAt) < backoffMs(m.attempts)) continue;
      const order = await loadOrder(m);
      if (!order || busy.has(m.number)) continue;
      try {
        const res = await deliverAndMark(order);
        console.log('[order]', m.number, 'delivered on retry via', res.channel);
      } catch (e) {
        console.error('[order]', m.number, `retry ${m.attempts + 1} failed:`, e);
      }
    }
  } finally {
    retrying = false;
  }
}

const RETRY_EVERY_MS = 5 * 60_000;
const loop = globalThis as { __orderRetryLoop?: ReturnType<typeof setInterval>; __orderRetryTick?: number };

/** Сколько миллисекунд назад был последний проход повторной отправки; null — цикл не запущен. */
export const retryLoopAge = () => (loop.__orderRetryTick ? Date.now() - loop.__orderRetryTick : null);

/** Запускает фоновую повторную отправку — один раз на процесс сервера. */
export function ensureRetryLoop(): void {
  if (loop.__orderRetryLoop) return;
  loop.__orderRetryTick = Date.now();
  loop.__orderRetryLoop = setInterval(() => {
    loop.__orderRetryTick = Date.now();
    void retryPending().catch((e) => console.error('[order] retry loop:', e));
    void dropStaleDrafts().catch((e) => console.error('[mail] stale drafts:', e));
  }, RETRY_EVERY_MS);
  loop.__orderRetryLoop.unref?.();
  void retryPending().catch(() => undefined);
}

/** Заявка для лога сервера — когда каналы не настроены. */
export const logOrder = (order: Order) =>
  console.log('[order]', orderText(order), order.files.map((f) => `${f.name}: ${f.file.size}b`));
