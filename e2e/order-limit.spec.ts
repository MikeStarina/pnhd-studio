import { expect, test } from '@playwright/test';

/**
 * Защита приёма заявок от потока запросов: с одного адреса — не больше 20 заявок за 10 минут,
 * дальше 429. Адрес клиента сервер берёт из X-Forwarded-For (его ставит Caddy); у каждого прогона свой адрес.
 */
test('с одного адреса после 20 заявок за 10 минут приём отвечает 429', async ({ request }) => {
  const ip = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
  const post = () => request.post('/api/orders', {
    headers: { 'x-forwarded-for': ip, 'content-type': 'multipart/form-data; boundary=x' },
    data: '--x--\r\n',
  });
  for (let i = 0; i < 20; i++) expect((await post()).status()).not.toBe(429);
  const blocked = await post();
  expect(blocked.status()).toBe(429);
  expect(blocked.headers()['retry-after']).toBeTruthy();
  // Другой адрес не задет.
  const other = await request.post('/api/orders', {
    headers: { 'x-forwarded-for': '198.51.100.9', 'content-type': 'multipart/form-data; boundary=x' },
    data: '--x--\r\n',
  });
  expect(other.status()).not.toBe(429);
});
