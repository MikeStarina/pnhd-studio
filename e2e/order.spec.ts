import { expect, test } from '@playwright/test';
import { PDFDocument } from 'pdf-lib';
import { acceptedNumber, addToCart, dragLayer, fillCheckout, openConstructor, orderAndSubmit, readStored, solidPng, storedCount, uploadImage } from './helpers';

/**
 * Основной сценарий: изделие → своя картинка → размеры → корзина → оформление → заявка с номером.
 * Идёт на десктопе 1440 и на телефоне 375 (см. playwright.config.ts).
 */
test('заявка проходит от картинки через корзину до номера заказа', async ({ page }) => {
  // Запоминаем отправленную заявку: после оформления страница уходит на «Спасибо», повторяем её сами.
  let sent: { url: string; headers: Record<string, string>; body: Buffer } | undefined;
  page.on('request', (r) => {
    if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/orders') sent = { url: r.url(), headers: r.headers(), body: r.postDataBuffer()! };
  });
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));

  const number = await orderAndSubmit(page, { M: 2, L: 1 });

  // Сервер сохранил заявку со всеми файлами и сам посчитал количество и сумму.
  expect(number).toMatch(/^ST-\d{4,}$/);
  const { meta, file } = await readStored(number);
  expect(meta.order.qty).toBe(3);
  expect(meta.total).toBeGreaterThan(0);
  expect(meta.order.contacts.email).toBe('autotest@example.com');
  expect(meta.order.contacts.telegram).toBe('@pinhead_test');
  const names = meta.files.map((f) => f.name).join(' ');
  for (const part of ['preview_0_front', 'print_front', 'logo', 'order_', 'design']) expect(names).toContain(part);

  // Файл печати есть и в PDF: одна страница с теми же пропорциями, что у PNG.
  expect(meta.files.find((f) => f.name.endsWith('print_front.pdf'))?.type).toBe('application/pdf');
  const pdf = await PDFDocument.load((await file('print_front.pdf')).buf);
  expect(pdf.getPageCount()).toBe(1);
  const png = (await file('print_front_')).buf;
  const { width, height } = pdf.getPage(0).getSize();
  expect(width / height).toBeCloseTo(png.readUInt32BE(16) / png.readUInt32BE(20), 2);

  // Та же заявка, отправленная ещё раз (сбой сети, двойное нажатие), второй заявки не создаёт.
  const before = await storedCount();
  const again = await page.request.post(sent!.url, {
    headers: { 'content-type': sent!.headers['content-type'], origin: new URL(sent!.url).origin },
    data: sent!.body,
  });
  expect(await again.json()).toMatchObject({ ok: true, number, duplicate: true });
  expect(await storedCount()).toBe(before);
});

test('с принтом за границей зоны заявку оформить нельзя', async ({ page, isMobile }) => {
  test.skip(isMobile, 'перетаскивание мышью — только десктоп');
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(600, 600, [255, 0, 170]));
  // Тащим слой далеко влево — за край зоны печати.
  await dragLayer(page, 0, -4, 0);

  // Главная кнопка не открывает форму, а выбирает проблемный слой и объясняет, что мешает.
  await page.getByRole('button', { name: /Принт вне зоны/i }).click({ force: true });
  await expect(page.getByText(/за границей зоны печати/).first()).toBeVisible();
  await expect(page.getByPlaceholder('Как к тебе обращаться')).toHaveCount(0);
  await page.getByRole('button', { name: /Вписать в зону/i }).click();
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);
});

test('у конструктора один путь — корзина: заявки в обход корзины нет', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  await page.getByRole('button', { name: /Выбрать размеры/i }).last().click({ force: true });
  await page.getByRole('button', { name: 'Больше M', exact: true }).click();
  await expect(page.getByRole('button', { name: 'В корзину', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Заявка без корзины' })).toHaveCount(0);
});

test('без файлов для печати оформление изделия с принтом не отправить', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  await addToCart(page, { M: 1 });
  await fillCheckout(page, undefined, false);
  const before = await storedCount();
  const send = page.getByRole('button', { name: 'Оформить заказ' });
  await send.click();

  await expect(page.getByText('Приложи файлы для печати')).toBeVisible();
  const input = page.locator('input[type=file][multiple]');
  await expect(input).toBeFocused();
  await expect(input).toHaveAttribute('aria-invalid', 'true');
  expect(await storedCount()).toBe(before);

  await input.setInputFiles({ name: 'maket.png', mimeType: 'image/png', buffer: solidPng(400, 400, [0, 0, 0]) });
  const number = await acceptedNumber(page);
  await send.click();
  const { meta } = await readStored(await number());
  expect(meta.files.map((f) => f.name).join(' ')).toContain('maket');
});

test('без согласия на обработку персональных данных оформление не отправить', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  await addToCart(page, { M: 1 });
  await fillCheckout(page);
  const consent = page.getByLabel(/согласие на обработку/);
  await consent.uncheck();
  const before = await storedCount();
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByText('Отметь согласие на обработку персональных данных, иначе заказ не отправить')).toBeVisible();
  await expect(consent).toBeFocused();
  await expect(page).toHaveURL(/\/checkout$/);
  expect(await storedCount()).toBe(before);
});
