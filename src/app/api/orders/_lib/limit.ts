/**
 * Ограничение частоты заявок с одного адреса: заявка до 300 МБ пишется на диск, поток таких запросов забил бы его.
 * 20 за 10 минут хватает живому клиенту: корзина из нескольких изделий шлёт по заявке на каждое, плюс повторы.
 * Счётчики — в памяти процесса: сервер один, после перезапуска счёт начинается заново.
 * Адрес — из X-Forwarded-For: Caddy ставит туда адрес клиента и не пропускает подделанный.
 * Без заголовка запрос пришёл в обход Caddy — с самой машины (порт открыт только на 127.0.0.1): его не ограничиваем.
 */
const LIMIT = 20;
const WINDOW_MS = 10 * 60_000;
const hits = new Map<string, number[]>();

/** null — можно принимать; иначе через сколько секунд освободится место. */
export function retryAfter(req: Request): number | null {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0].trim();
  if (!ip) return null;
  const now = Date.now();
  if (hits.size > 10_000) forgetOld(now);
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    hits.set(ip, recent);
    return Math.ceil((recent[0] + WINDOW_MS - now) / 1000);
  }
  hits.set(ip, [...recent, now]);
  return null;
}

function forgetOld(now: number) {
  for (const [ip, times] of hits) if (times.every((t) => now - t >= WINDOW_MS)) hits.delete(ip);
}
