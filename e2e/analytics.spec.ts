import { expect, test } from '@playwright/test';
import { openConstructor, orderAndSubmit, readStored, solidPng, uploadImage } from './helpers';

/** Запуск: E2E_PORT=3112 npx playwright test e2e/analytics.spec.ts --project=desktop-1440 (поднимает свой сервер, рабочий не трогает). */
test('цели воронки уходят по порядку, order_submit — один раз, ClientID и покупка попадают в заявку и dataLayer', async ({ page }) => {
  // Подменяем счётчик до загрузки страницы; свойство защищено, чтобы загрузчик Метрики его не затёр.
  // Путь идёт через три страницы (конструктор → оформление → «Спасибо»): цели и dataLayer копим в sessionStorage.
  await page.addInitScript(() => {
    const save = (key: string, item: unknown) =>
      sessionStorage.setItem(key, JSON.stringify([...JSON.parse(sessionStorage.getItem(key) ?? '[]'), item]));
    const ym = (...args: unknown[]) => {
      if (args[1] === 'getClientID') (args[2] as (id: string) => void)('1700000000123456789');
      else save('__ym', args);
    };
    Object.defineProperty(window, 'ym', { get: () => ym, set: () => undefined, configurable: true });
    const layer: unknown[] = [];
    layer.push = (...items: unknown[]) => { items.forEach((x) => save('__dl', x)); return Array.prototype.push.apply(layer, items); };
    Object.defineProperty(window, 'dataLayer', { get: () => layer, set: () => undefined, configurable: true });
  });
  await page.route('https://mc.yandex.ru/**', (route) => route.abort());

  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  const number = await orderAndSubmit(page, { M: 2, L: 1 });

  const saved = (key: string) => page.evaluate((k) => JSON.parse(sessionStorage.getItem(k) ?? '[]') as unknown[], key);
  const goals = ((await saved('__ym')) as unknown[][])
    .filter((c) => c[1] === 'reachGoal').map((c) => ({ id: c[2] as string, params: c[3] as Record<string, unknown> }));
  const funnel = ['constructor_open', 'design_upload', 'cart_add', 'order_form_open', 'order_send', 'order_submit', 'order_send_error'];
  expect(goals.map((g) => g.id).filter((id) => funnel.includes(id))).toEqual(
    ['constructor_open', 'design_upload', 'cart_add', 'order_send', 'order_submit']);

  const success = goals.find((g) => g.id === 'order_submit')!;
  expect(success.params).toMatchObject({ qty: 3, currency: 'RUB', order_id: number, source: 'direct', method: expect.any(String) });
  expect(success.params.order_price).toBeGreaterThan(0);

  // Покупка для электронной коммерции — одна, с номером заказа.
  const purchases = ((await saved('__dl')) as Array<{ ecommerce?: { purchase?: { actionField: { id: string } } } }>)
    .filter((x) => x.ecommerce?.purchase).map((x) => x.ecommerce!.purchase!.actionField.id);
  expect(purchases).toEqual([number]);

  // ClientID и источник дошли до сервера.
  const { meta } = await readStored(number);
  expect(meta.order).toMatchObject({ clientId: '1700000000123456789', source: 'direct' });
});
