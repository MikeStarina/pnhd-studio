import { readdir, readFile, writeFile } from 'node:fs/promises';
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

type Call = { method: string; body: { fields: Record<string, unknown> } };
const stubCalls = async (log: string): Promise<Call[]> =>
  (await readFile(log, 'utf8')).trim().split('\n').filter(Boolean).map((l) => JSON.parse(l) as Call);

test('заявка с формы цены на главной создаёт контакт и сделку «Заявка на звонок» нашим вебхуком', async ({ page, context }) => {
  const log = process.env.BITRIX_STUB_LOG;
  test.skip(!log, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');

  await context.addCookies([{ name: 'roistat_visit', value: '2718281', url: 'http://localhost:3114' }]);
  await page.route(/mc\.yandex\.ru/, (r) => r.abort());
  // Бэкенд каталога заявку больше не получает: его вебхук Битрикса не создаёт сделки.
  let backend = 0;
  await page.route((url) => url.hostname !== 'localhost' && url.pathname.startsWith('/api/leads'), (r) => { backend += 1; return r.abort(); });
  const before = (await stubCalls(log!)).length;

  await page.goto('/');
  await page.getByPlaceholder('Как к тебе обращаться').fill('Лид Тестовый');
  await page.getByPlaceholder('+7 (999) 999-99-99').fill('9007654321');
  await page.locator('#price-agree').check();
  await page.getByRole('button', { name: 'Передать менеджеру' }).click();
  await expect(page.getByText('Спасибо! Менеджер свяжется с тобой')).toBeVisible();

  const calls = (await stubCalls(log!)).slice(before);
  expect(calls.find((c) => c.method === 'crm.contact.add')!.body.fields).toMatchObject({
    NAME: 'Лид Тестовый',
    PHONE: [{ VALUE: '+79007654321', VALUE_TYPE: 'WORK' }],
  });
  const deal = calls.find((c) => c.method === 'crm.deal.add')!.body.fields;
  expect(deal).toMatchObject({
    TITLE: 'Заявка на звонок',
    CATEGORY_ID: 52,
    CONTACT_ID: 7,
    UF_CRM_ROISTAT: '2718281',
    UF_CRM_6A7B1BE7505A0: 2256,
    UF_CRM_DEAL_URL_PAGE: 2502,
  });
  expect(String(deal.COMMENTS)).toContain('+79007654321');
  expect(backend).toBe(0);
});

test('заказ из каталога после приёма бэкендом создаёт сделку «Новый заказ с сайта» нашим вебхуком', async ({ page, context }) => {
  const log = process.env.BITRIX_STUB_LOG;
  test.skip(!log, 'нужна заглушка Битрикса: npx playwright test -c playwright.bitrix.config.ts');

  await context.addCookies([{ name: 'roistat_visit', value: '3141592', url: 'http://localhost:3114' }]);
  await page.route(/mc\.yandex\.ru/, (r) => r.abort());
  // Заказ каталога принимает бэкенд (api.pnhd.ru) — в тесте его ответ подставляем.
  await page.route((url) => url.hostname !== 'localhost' && url.pathname === '/api/orders', (r) =>
    r.fulfill({ status: 200, contentType: 'application/json', body: '{"id":"6750aa00bb11cc22dd33ee44","paymentUrl":""}' }));
  const before = (await stubCalls(log!)).length;

  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'Добавить L' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByRole('link', { name: /Корзина, товаров/ })).toBeVisible();
  await fillCheckout(page, undefined, false);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page).toHaveURL(/\/thanks/);

  await expect.poll(async () => (await stubCalls(log!)).slice(before).some((c) => c.method === 'crm.deal.add')).toBe(true);
  const calls = (await stubCalls(log!)).slice(before);
  expect(calls.find((c) => c.method === 'crm.contact.add')!.body.fields).toMatchObject({
    NAME: 'Тест Автотестов',
    PHONE: [{ VALUE: '+79001234567', VALUE_TYPE: 'WORK' }],
    EMAIL: [{ VALUE: 'autotest@example.com', VALUE_TYPE: 'WORK' }],
    IM: [{ VALUE: 'pinhead_test', VALUE_TYPE: 'TELEGRAM' }],
  });
  const deal = calls.find((c) => c.method === 'crm.deal.add')!.body.fields;
  expect(deal).toMatchObject({
    TITLE: 'Новый заказ с сайта № 6750aa00bb11cc22dd33ee44',
    CATEGORY_ID: 52,
    CONTACT_ID: 7,
    CURRENCY_ID: 'RUB',
    OPPORTUNITY: 2400,
    UF_CRM_1700558521016: '6750aa00bb11cc22dd33ee44',
    UF_CRM_ROISTAT: '3141592',
    UF_CRM_6A7B1BE7505A0: 2256,
    UF_CRM_DEAL_URL_PAGE: 2506,
  });
  expect(String(deal.COMMENTS)).toContain('Футболка REGULAR черная');
  expect(String(deal.COMMENTS)).toContain('M — 1, L — 1');
});
