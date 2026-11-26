import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

/** Номер заявки: ST и порядковый номер, не короче четырёх цифр — ST-0001, ST-0002… */
export const ORDER_NUMBER = /^ST-\d{4,}$/;

/** Последний выданный номер лежит рядом с заявками: папка на постоянном диске переживает перезапуск сервера. */
const COUNTER = path.join(path.resolve(process.env.ORDER_STORE_DIR || 'data/orders'), 'counter.txt');

/** Номера выдаются строго по очереди: два одновременных запроса не получат один номер. */
let queue: Promise<unknown> = Promise.resolve();

/**
 * Следующий номер заявки. Номер выдаётся до отправки (он нужен в PDF заказа), поэтому брошенные
 * клиентом заявки оставляют пропуски в нумерации.
 */
export function newOrderNumber(): Promise<string> {
  const next = queue.then(async () => {
    const last = Number((await readFile(COUNTER, 'utf8').catch(() => '0')).trim()) || 0;
    await mkdir(path.dirname(COUNTER), { recursive: true });
    await writeFile(COUNTER, String(last + 1));
    return `ST-${String(last + 1).padStart(4, '0')}`;
  });
  queue = next.catch(() => undefined);
  return next;
}
