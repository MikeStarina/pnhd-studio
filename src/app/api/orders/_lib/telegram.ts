import { orderText, type Order } from './parse';

/** Предел длины сообщения Telegram — 4096 символов. */
const MAX_TEXT = 4000;
/** Предел ожидания одного вызова: зависший Telegram не держит заявку клиента и повторную отправку. */
const CALL_TIMEOUT_MS = 120_000;

/**
 * Заявка в чат Telegram: сообщение и файлы документами.
 * @returns имена недоставленных файлов; бросает ошибку, если не ушло само сообщение.
 */
export async function sendToTelegram(o: Order, token: string, chat: string): Promise<string[]> {
  /** Вызов Bot API; false — не доставлено (сеть или отказ Telegram). */
  const tg = async (method: string, body: FormData | string) => {
    try {
      const r = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
        method: 'POST',
        body,
        signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
        headers: typeof body === 'string' ? { 'content-type': 'application/json' } : undefined,
      });
      return r.ok;
    } catch {
      return false;
    }
  };

  const text = orderText(o).slice(0, MAX_TEXT);
  if (!(await tg('sendMessage', JSON.stringify({ chat_id: chat, text })))) throw new Error('telegram_message');

  // Сообщение уже у менеджера: если файл не дошёл, заявку не отклоняем (повтор дал бы дубль),
  // а пишем об этом в тот же чат.
  const failed: string[] = [];
  for (const f of o.files) {
    const fd = new FormData();
    fd.append('chat_id', chat);
    fd.append('caption', f.title);
    fd.append('document', f.file, f.name);
    if (!(await tg('sendDocument', fd))) failed.push(f.name);
  }
  if (failed.length) {
    await tg('sendMessage', JSON.stringify({
      chat_id: chat,
      text: `⚠️ К заявке № ${o.number} не доставлены файлы: ${failed.join(', ')}. Запросите макет у клиента. Копии 30 дней лежат на сервере сайта.`,
    }));
  }
  return failed;
}
