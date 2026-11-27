import { mkdir, readdir, readFile, rm, writeFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';
import { acceptedNumber, addToCart, fillCheckout, openConstructor, orderAndSubmit, solidPng, uploadImage } from './helpers';

/** Схема полей сделки — от CRM Pinhead. Идёт только с playwright.bitrix.config.ts (там заглушка Битрикса). */
test('изделие из конструктора, оформленное в корзине, создаёт сделку в воронке «Студия» с полями аналитики', async ({ page, context }) => {
  const log = process.env.BITRIX_STUB_LOG;
  test.skip(!log, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');

  await context.addCookies([{ name: 'roistat_visit', value: '4815162', url: 'http://localhost:3114' }]);
  // Метрика в тестах не грузится: подставляем её ответ на getClientID.
  await page.addInitScript(() => {
    (window as unknown as { ym: unknown }).ym = (_id: number, cmd: string, cb?: (id: string) => void) => {
      if (cmd === 'getClientID') cb?.('1732000000123456789');
    };
  });
  await page.route(/mc\.yandex\.ru/, (r) => r.abort());
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  const number = await orderAndSubmit(page, { M: 2 });

  const calls = (await readFile(log!, 'utf8')).trim().split('\n').map((l) => JSON.parse(l) as { method: string; body: { fields: Record<string, unknown> } });
  const deal = calls.find((c) => c.method === 'crm.deal.add')!.body.fields;
  expect(deal).toMatchObject({
    CATEGORY_ID: 52,
    CONTACT_ID: 7,
    CURRENCY_ID: 'RUB',
    UF_CRM_1700558521016: number,
    UF_CRM_DCT_YA_CID: '1732000000123456789',
    UF_CRM_ROISTAT: '4815162',
    UF_CRM_6A7B1BE7505A0: 2256,
    UF_CRM_DEAL_URL_PAGE: 2506, // заявка с принтом уходит с оформления корзины
  });
  expect(deal.OPPORTUNITY).toBeGreaterThan(0);
  // Источник сделки ставит Roistat по визиту — сайт его не задаёт.
  expect(deal).not.toHaveProperty('SOURCE_ID');
  expect(deal).not.toHaveProperty('SOURCE_DESCRIPTION');
  const contact = calls.find((c) => c.method === 'crm.contact.add')!.body.fields;
  expect(contact).not.toHaveProperty('SOURCE_ID');
  // Ник — в стандартное поле «Мессенджеры» контакта, чтобы менеджер открыл чат из карточки; и строкой в сделке.
  expect(contact.IM).toEqual([{ VALUE: 'pinhead_test', VALUE_TYPE: 'TELEGRAM' }]);
  expect(deal.COMMENTS).toContain('Telegram: @pinhead_test');
  expect(calls.filter((c) => c.method === 'crm.timeline.comment.add').length).toBeGreaterThan(0);
});

test('файлы для печати, приложенные на оформлении, приходят в сделку; файл с чужим содержимым — нет', async ({ page }) => {
  const log = process.env.BITRIX_STUB_LOG;
  test.skip(!log, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');

  await page.route(/mc\.yandex\.ru/, (r) => r.abort());
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(800, 800, [0, 120, 255]));
  await addToCart(page, { M: 1 });
  await fillCheckout(page, undefined, false);
  const pdf = Buffer.from('%PDF-1.6\n% Adobe Illustrator\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
  await page.locator('input[type=file][multiple]').setInputFiles([
    { name: 'Логотип.ai', mimeType: 'application/postscript', buffer: pdf },
    { name: 'макет.pdf', mimeType: 'application/pdf', buffer: pdf },
    { name: 'фото.psd', mimeType: '', buffer: Buffer.concat([Buffer.from('8BPS'), Buffer.alloc(40)]) },
    { name: 'вирус.ai', mimeType: '', buffer: Buffer.concat([Buffer.from('MZ'), Buffer.alloc(40)]) },
  ]);
  await expect(page.getByRole('list', { name: 'Приложенные файлы' }).getByRole('listitem')).toHaveCount(4);
  // Формат, которого нет в списке, в форму не добавляется.
  await page.locator('input[type=file][multiple]').setInputFiles([{ name: 'setup.exe', mimeType: '', buffer: Buffer.from('MZ') }]);
  await expect(page.getByText('setup.exe: такой формат не принимаем')).toBeVisible();

  const number = await acceptedNumber(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  const n = await number();

  const calls = (await readFile(log!, 'utf8')).trim().split('\n')
    .map((l) => JSON.parse(l) as { method: string; body: { fields: Record<string, unknown> } });
  const deal = calls.filter((c) => c.method === 'crm.deal.add').map((c) => c.body.fields).find((f) => f.UF_CRM_1700558521016 === n)!;
  expect(String(deal.COMMENTS)).toContain('Не приняты файлы клиента (формат не распознан): вирус.ai');
  const clientFiles = calls
    .filter((c) => c.method === 'crm.timeline.comment.add' && c.body.fields.COMMENT === 'Файл для печати от клиента')
    .map((c) => (c.body.fields.FILES as string[][])[0][0])
    .filter((name) => name.startsWith(n));
  expect(clientFiles).toEqual([`${n}_file_0_Логотип.ai`, `${n}_file_1_макет.pdf`, `${n}_file_2_фото.psd`]);
});

test('DTF с надписью: в сделку приходит PDF файла печати, где текст — кривые, а не шрифт', async ({ page }) => {
  const log = process.env.BITRIX_STUB_LOG;
  test.skip(!log, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');

  await page.route(/mc\.yandex\.ru/, (r) => r.abort());
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(800, 800, [0, 120, 255]));
  await page.getByRole('button', { name: 'Готово' }).click();
  await page.getByRole('button', { name: 'Добавить текст' }).click();
  await page.getByLabel('Текст', { exact: true }).fill('Пинхэд Studio');
  const n = await orderAndSubmit(page, { L: 1 });

  const calls = (await readFile(log!, 'utf8')).trim().split('\n')
    .map((l) => JSON.parse(l) as { method: string; body: { fields: Record<string, unknown> } });
  const vector = calls.find((c) => c.method === 'crm.timeline.comment.add'
    && String(c.body.fields.COMMENT).startsWith('Файл печати DTF, текст в кривых (PDF): перед')
    && (c.body.fields.FILES as string[][])[0][0] === `${n}_print_front_vector.pdf`);
  expect(vector).toBeTruthy();
  const pdf = Buffer.from((vector!.body.fields.FILES as string[][])[0][1], 'base64');
  await writeFile('data/e2e-vector.pdf', pdf);
  const raw = pdf.toString('latin1');
  expect(raw.startsWith('%PDF-')).toBe(true);
  // Шрифт в файл не встроен: буквы нарисованы контурами. Картинка клиента — растром под ними.
  expect(raw).not.toContain('/Font');
  expect(raw).toContain('/Subtype /Image');
});

test('файл, который Битрикс не принял, остаётся на сервере; принятые удаляются', async ({ page }) => {
  const log = process.env.BITRIX_STUB_LOG;
  test.skip(!log, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');

  await page.route(/mc\.yandex\.ru/, (r) => r.abort());
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(800, 800, [0, 120, 255]));
  await addToCart(page, { M: 1 });
  await fillCheckout(page, undefined, false);
  const pdf = Buffer.from('%PDF-1.6\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n');
  await page.locator('input[type=file][multiple]').setInputFiles([
    { name: 'слишком-большой.pdf', mimeType: 'application/pdf', buffer: pdf },
    { name: 'обычный.pdf', mimeType: 'application/pdf', buffer: pdf },
  ]);
  const number = await acceptedNumber(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  const n = await number();

  const dir = `data/e2e-orders-bitrix/${n}`;
  await expect.poll(async () => (JSON.parse(await readFile(`${dir}/meta.json`, 'utf8')) as { status: string }).status).toBe('delivered');
  expect(await readdir(`${dir}/files`)).toEqual([`${n}_file_0_слишком-большой.pdf`]);
});

test('проверка связи с Битриксом закрыта паролем журнала и показывает, дошёл ли вызов, без ключа вебхука', async ({ request }) => {
  test.skip(!process.env.BITRIX_STUB_LOG, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');
  const auth = (p: string) => ({ authorization: `Basic ${Buffer.from(`report:${p}`).toString('base64')}` });

  expect((await request.get('/api/orders/ledger/bitrix')).status()).toBe(401);
  const res = await request.get('/api/orders/ledger/bitrix', { headers: auth('e2e-bitrix-ledger') });
  expect(res.status()).toBe(200);
  const body = (await res.json()) as { webhook: { host: string; user: string; clean: boolean }; bitrix: { ok: boolean } };
  expect(body.webhook).toEqual({ host: 'localhost:3115', user: '1', clean: true });
  expect(body.bitrix.ok).toBe(true);
  expect(JSON.stringify(body)).not.toContain('/rest/1/test');
});

/** Тестовое хранилище без записей о непринятых файлах: их оставляют другие тесты, а это — предупреждение здоровья. */
const clearKeptFiles = async () => {
  const root = 'data/e2e-orders-bitrix';
  for (const name of await readdir(root).catch(() => [] as string[])) {
    const meta = await readFile(`${root}/${name}/meta.json`, 'utf8').catch(() => '');
    if (meta.includes('"filesKept"')) await rm(`${root}/${name}`, { recursive: true, force: true });
  }
};

test('страница здоровья: 200, пока всё работает; 503, если заявка застряла; без ключей и данных клиентов', async ({ request }) => {
  test.skip(!process.env.BITRIX_STUB_LOG, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');
  await clearKeptFiles();
  const healthy = await request.get('/api/health');
  expect(healthy.status()).toBe(200);
  const healthyBody = await healthy.json();
  expect(healthyBody).toEqual({
    ok: true, version: 'dev',
    checks: { bitrix: 'ok', orders: 'ok', disk: 'ok', space: 'ok', backend: 'ok', retry: 'ok' },
  });
  // Слово warning в ответе — сигнал для проверки по ключевому слову: без предупреждений его нет.
  expect(JSON.stringify(healthyBody)).not.toContain('warning');

  // Заявка, которую сервер больше не пытается отправить (60 попыток) и которая лежит дольше 15 минут.
  const dir = 'data/e2e-orders-bitrix/ST-9999';
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/meta.json`, JSON.stringify({
    number: 'ST-9999', fingerprint: 'x', status: 'pending', receivedAt: new Date(Date.now() - 3600_000).toISOString(),
    attempts: 60, lastAttemptAt: new Date().toISOString(), total: 1000,
    order: { contacts: { name: 'Клиент Скрытый', phone: '+79990000000' } },
  }));
  try {
    const stuck = await request.get('/api/health');
    expect(stuck.status()).toBe(503);
    const body = await stuck.json();
    expect(body).toMatchObject({ ok: false, checks: { orders: '1 stuck' } });
    expect(JSON.stringify(body)).not.toContain('Скрытый');
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
  expect((await request.get('/api/health')).status()).toBe(200);
});

test('страница здоровья: файл, который Битрикс не принял за последние сутки, — предупреждение без аварии', async ({ request }) => {
  test.skip(!process.env.BITRIX_STUB_LOG, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');
  await clearKeptFiles();
  const dir = 'data/e2e-orders-bitrix/ST-9998';
  await mkdir(dir, { recursive: true });
  await writeFile(`${dir}/meta.json`, JSON.stringify({
    number: 'ST-9998', fingerprint: 'x', status: 'delivered', receivedAt: new Date().toISOString(), attempts: 1,
    deliveredAt: new Date().toISOString(), channel: 'bitrix', total: 1000, filesKept: ['ST-9998_file_0_maket.pdf'],
  }));
  try {
    const res = await request.get('/api/health');
    expect(res.status()).toBe(200);
    expect(await res.json()).toMatchObject({ ok: true, warnings: ['files_not_delivered: 1'] });
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});
