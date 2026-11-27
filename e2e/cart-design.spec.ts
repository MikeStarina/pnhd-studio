import { expect, test, type Page } from '@playwright/test';
import { readdir, stat } from 'node:fs/promises';
import path from 'node:path';
import { ORDERS_DIR } from '../playwright.config';
import { addToCart, fillCheckout, mainButton, openConstructor, readStored, solidPng, storedCount, uploadImage } from './helpers';

/**
 * Изделие из конструктора идёт в корзину (adr/0001): позиция «свой принт» с превью и окончательной ценой,
 * переживает перезагрузку, удаляется вместе со своими картинками в IndexedDB.
 */

/** Главная кнопка итога. Точное имя: шаг подсказки «Положите в корзину» тоже содержит «в корзину». */
const addButton = (page: Page) => page.getByRole('button', { name: 'В корзину', exact: true });

/** Сколько картинок позиций лежит в IndexedDB корзины. */
const storedAssets = (page: Page) => page.evaluate(() => new Promise<number>((resolve, reject) => {
  const open = indexedDB.open('pnhd-cart-designs');
  open.onerror = () => reject(open.error);
  open.onsuccess = () => {
    const db = open.result;
    if (!db.objectStoreNames.contains('assets')) return resolve(0);
    const count = db.transaction('assets').objectStore('assets').count();
    count.onsuccess = () => resolve(count.result);
    count.onerror = () => reject(count.error);
  };
}));

test('изделие с принтом попадает в корзину и переживает перезагрузку', async ({ page }) => {
  await openConstructor(page);
  // Модель — сразу: на телефоне после загрузки картинки выбор модели скрыт.
  const model = (await page.getByRole('radiogroup', { name: 'Модель' }).getByRole('radio', { checked: true }).getAttribute('title'))!;
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));

  await mainButton(page, /Выбрать размеры/i).click({ force: true });
  for (const [size, qty] of Object.entries({ M: 2, L: 1 })) {
    const plus = page.getByRole('button', { name: `Больше ${size}`, exact: true });
    await plus.scrollIntoViewIfNeeded();
    for (let i = 0; i < qty; i++) await plus.click();
  }
  // Сумма в итоге «досчитывается» анимацией — берём, когда перестала меняться.
  const sum = page.getByTestId('constructor-total');
  let total = '';
  await expect.poll(async () => {
    const prev = total;
    total = (await sum.textContent())!.trim();
    return total === prev;
  }, { intervals: [600] }).toBe(true);

  await addButton(page).click();
  await page.getByRole('dialog', { name: 'Добавлено в корзину' }).getByRole('button', { name: 'Перейти в корзину' }).click({ timeout: 90_000 });
  await expect(page).toHaveURL(/\/cart$/);

  const item = page.getByRole('listitem').filter({ hasText: 'свой принт' });
  await expect(item.getByRole('heading', { name: new RegExp(model, 'i') })).toBeVisible();
  await expect(item.getByText('3 шт.')).toBeVisible();
  await expect(item.getByText(total).first()).toBeVisible();
  await expect(item.getByRole('button', { name: /^Рассмотреть принт крупно: .*, перед/ }).locator('img')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();
  expect(await storedAssets(page)).toBeGreaterThan(0);

  await page.reload();
  await expect(item.getByText(total).first()).toBeVisible();
  await expect(item.getByRole('button', { name: /^Рассмотреть принт крупно: .*, перед/ }).locator('img')).toBeVisible();

  await item.getByRole('button', { name: /Удалить/ }).click();
  await expect(page.getByText('свой принт')).toHaveCount(0);
  await expect.poll(() => storedAssets(page)).toBe(0);
});

test('«Нанести принт» у товара в корзине: та же вещь и размеры, изделие с принтом заменяет её; правка позиции', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await page.goto('/cart');
  await page.getByRole('main').getByRole('link', { name: 'Нанести принт', exact: true }).click();

  await expect(page).toHaveURL(/\/constructor/);
  await expect(page.locator('canvas').first()).toBeVisible({ timeout: 60_000 });
  // Размер из корзины перенёсся (итог — за 1 шт. с выбранным размером): можно загружать принт.
  await expect(page.getByText(/^1 шт · /)).toBeVisible({ timeout: 60_000 });
  await uploadImage(page, 'logo.png', solidPng(800, 800, [0, 120, 255]));
  await addButton(page).click();
  await page.getByRole('dialog', { name: 'Добавлено в корзину' }).getByRole('button', { name: 'Перейти в корзину' }).click({ timeout: 90_000 });
  await expect(page).toHaveURL(/\/cart$/);
  const item = page.getByRole('listitem').filter({ hasText: 'свой принт' });
  // Размер M перенёсся в позицию с принтом: у неё степпер M и всего 1 шт.
  await expect(item.getByRole('button', { name: /^Добавить M/ })).toBeVisible();
  await expect(item.getByText('1 шт.', { exact: true })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();

  // Правка: макет открывается, «Сохранить в корзине» заменяет позицию, а не добавляет вторую.
  await item.getByRole('link', { name: 'Изменить принт' }).click();
  await expect(page.getByRole('button', { name: 'Сохранить в корзине', exact: true })).toBeVisible({ timeout: 60_000 });
  await page.getByRole('button', { name: 'Сохранить в корзине', exact: true }).click();
  await expect(page).toHaveURL(/\/cart$/, { timeout: 90_000 });
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();
  await expect(page.getByRole('listitem').filter({ hasText: 'свой принт' })).toHaveCount(1);
});

test('«Сделать ещё вариант» оставляет макет: второе нажатие кладёт вторую позицию', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(600, 600, [20, 200, 60]));
  await mainButton(page, /Выбрать размеры/i).click({ force: true });
  const plus = page.getByRole('button', { name: 'Больше M', exact: true });
  await plus.scrollIntoViewIfNeeded();
  await plus.click();

  const dialog = page.getByRole('dialog', { name: 'Добавлено в корзину' });
  await addButton(page).click();
  await expect(dialog.getByText('свой принт · 1 шт')).toBeVisible({ timeout: 90_000 });
  await dialog.getByRole('button', { name: 'Сделать ещё вариант' }).click();
  await expect(dialog).toHaveCount(0);
  await expect(page).toHaveURL(/\/constructor/);

  await addButton(page).click();
  await dialog.getByRole('button', { name: 'Перейти в корзину' }).click({ timeout: 90_000 });
  await expect(page.getByRole('listitem').filter({ hasText: 'свой принт' })).toHaveCount(2);
});

test('«Нанести принт» из корзины: перезагрузка не теряет работу; Escape закрывает «Добавлено» и возвращает фокус', async ({ page, isMobile }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await page.goto('/cart');
  await page.getByRole('main').getByRole('link', { name: 'Нанести принт', exact: true }).click();
  await expect(page.getByText(/^1 шт · /)).toBeVisible({ timeout: 60_000 });
  await uploadImage(page, 'logo.png', solidPng(700, 700, [250, 120, 0]));
  await page.waitForTimeout(1200); // черновик сохраняется через 800 мс после правки

  await page.reload();
  // Принт и размер вернулись: главная кнопка сразу «В корзину» (без принта была бы «Добавить принт»).
  const add = addButton(page);
  await expect(add).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('dialog', { name: 'Продолжить дизайн?' })).toHaveCount(0);

  await add.click();
  const dialog = page.getByRole('dialog', { name: 'Добавлено в корзину' });
  await expect(dialog).toBeVisible({ timeout: 90_000 });
  await page.keyboard.press('Escape');
  await expect(dialog).toHaveCount(0);
  if (!isMobile) await expect(add).toBeFocused();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();
});

test('ссылка на правку позиции, которой уже нет, открывает обычный конструктор с подсказкой', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
  await page.goto('/constructor?edit=d-1-gone');
  await expect(page.getByText('Этого изделия уже нет в корзине — собери новое.')).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('button', { name: /Сохранить в корзине/i })).toHaveCount(0);
});

test('количество изделия с принтом меняется в корзине: сумма пересчитывается, переживает перезагрузку', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(900, 900, [0, 120, 255]));
  await mainButton(page, /Выбрать размеры/i).click({ force: true });
  const plusM = page.getByRole('button', { name: 'Больше M', exact: true });
  await plusM.scrollIntoViewIfNeeded();
  await plusM.click();
  await plusM.click();
  await addButton(page).click();
  await page.getByRole('dialog', { name: 'Добавлено в корзину' }).getByRole('button', { name: 'Перейти в корзину' }).click({ timeout: 90_000 });

  const item = page.getByRole('listitem').filter({ hasText: 'свой принт' });
  await expect(item.getByText('2 шт.')).toBeVisible();
  const unitText = (await item.getByText(/за\sшт\./).first().textContent())!;
  const unit = Number(unitText.replace(/\D/g, ''));
  const rub = (n: number) => `${n.toLocaleString('ru-RU').replace(/\s/g, ' ')} ₽`;

  // Позиции, добавленные раньше, несут в количестве размеры других моделей (хвост конструктора): степпер работает и с ними
  await page.evaluate(() => {
    const designs = JSON.parse(localStorage.getItem('cart-designs')!);
    designs[0].quantities['000000000000000000000000'] = { XL: 1 };
    localStorage.setItem('cart-designs', JSON.stringify(designs));
  });
  await page.reload();
  await expect(item.getByText('2 шт.')).toBeVisible();

  // Последнюю штуку «−» не убирает — для этого кнопка удаления; пока штук две, «−» доступна
  await item.getByRole('button', { name: /^Добавить M/ }).click();
  await expect(item.getByText('3 шт.')).toBeVisible();
  await expect.poll(async () => (await item.textContent())!.replace(/\s/g, ' ')).toContain(rub(unit * 3));

  await page.reload();
  await expect(item.getByText('3 шт.')).toBeVisible();

  // Превью открывает просмотр крупно: изделие и сам файл печати; Escape закрывает
  await item.getByRole('button', { name: /^Рассмотреть принт крупно/ }).click();
  const viewer = page.getByRole('dialog', { name: /Фото:/ });
  await expect(viewer.getByRole('img', { name: 'Перед: изделие с принтом' })).toBeVisible();
  await viewer.getByRole('button', { name: 'Следующее фото' }).click();
  await expect(viewer.getByRole('img', { name: 'Перед: принт' })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();

  await item.getByRole('button', { name: /^Убрать M/ }).click();
  await item.getByRole('button', { name: /^Убрать M/ }).click();
  await expect(item.getByText('1 шт.')).toBeVisible();
  await expect(item.getByRole('button', { name: /^Убрать M/ })).toBeDisabled();
});

test('оформление отправляет изделие с принтом в заявку вместе с файлами; повтор шлёт только неотправленное', async ({ page }) => {
  // Заказ каталога (api.pnhd.ru) перехватываем: в настоящий бэкенд тестовые заказы не уходят.
  const catalogOrders: Array<Record<string, unknown>> = [];
  await page.route((url) => url.pathname === '/api/orders' && url.hostname !== 'localhost', async (route) => {
    catalogOrders.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"id":"cat-777","paymentUrl":""}' });
  });
  // Первая отправка изделия на наш сервер срывается, вторая проходит.
  let designPosts = 0;
  await page.route((url) => url.pathname === '/api/orders' && url.hostname === 'localhost', async (route) => {
    designPosts += 1;
    if (designPosts === 1) return route.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' });
    return route.continue();
  });

  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1000, 1000, [255, 0, 170]));
  await mainButton(page, /Выбрать размеры/i).click({ force: true });
  const plus = page.getByRole('button', { name: 'Больше M', exact: true });
  await plus.scrollIntoViewIfNeeded();
  await plus.click();
  await plus.click();
  await addButton(page).click();
  await expect(page.getByRole('dialog', { name: 'Добавлено в корзину' })).toBeVisible({ timeout: 90_000 });

  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 2' })).toBeVisible();

  await page.goto('/checkout');
  await expect(page.getByText('свой принт').first()).toBeVisible();
  await page.getByLabel('Имя', { exact: true }).fill('Тест');
  await page.getByLabel('Фамилия').fill('Тестов');
  await page.getByLabel('Телефон').fill('9991234567');
  await page.getByLabel('Почта').fill('autotest@example.com');
  await page.getByLabel('Ник в Telegram').fill('@pinhead_test');
  // Во время акции отзыв о конструкторе — обязательное поле оформления.
  const feedback = page.getByLabel(/Отзыв о конструкторе/);
  if (await feedback.count()) await feedback.fill('Автотест: всё понятно');
  await page.locator('input[type=file][multiple]').setInputFiles({ name: 'maket.png', mimeType: 'image/png', buffer: solidPng(400, 400, [0, 0, 0]) });
  await page.getByLabel(/согласие на обработку/).check();
  const before = await storedCount();
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByRole('alert').filter({ hasText: 'Не удалось оформить заказ' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 2' })).toBeVisible();
  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(page).toHaveURL(/\/thanks\?from=checkout$/, { timeout: 60_000 });

  // Заказ каталога ушёл один раз и без изделия из конструктора.
  expect(catalogOrders).toHaveLength(1);
  expect(JSON.stringify(catalogOrders[0])).not.toContain('свой принт');
  expect(designPosts).toBe(2);

  // Наш сервер сохранил заявку с файлами печати, превью, исходником, PDF и макетом.
  await expect.poll(storedCount).toBe(before + 1);
  // Рядом с заявками лежат журнал и черновики писем — берём только папки заявок.
  const dirs = (await readdir(path.resolve(ORDERS_DIR))).filter((d) => /^ST-/.test(d));
  const newest = (await Promise.all(dirs.map(async (d) => ({ d, t: (await stat(path.resolve(ORDERS_DIR, d))).mtimeMs }))))
    .sort((a, b) => b.t - a.t)[0].d;
  const { meta } = await readStored(newest);
  expect(meta.order.qty).toBe(2);
  expect(meta.order.contacts.email).toBe('autotest@example.com');
  expect((meta.order.contacts as { comment?: string }).comment).toContain('cat-777');
  const names = meta.files.map((f) => f.name).join(' ');
  for (const part of ['preview_0_front', 'print_front', 'logo', 'order_', 'design']) expect(names).toContain(part);

  await expect(page.getByRole('link', { name: 'Корзина, товаров: 0' })).toBeVisible();
  await expect.poll(() => storedAssets(page)).toBe(0);
});

test('каталог принят, изделие сорвалось, страницу перезагрузили: повторное оформление не создаёт второй заказ каталога', async ({ page }) => {
  const catalogOrders: unknown[] = [];
  await page.route((url) => url.pathname === '/api/orders' && url.hostname !== 'localhost', async (route) => {
    catalogOrders.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"id":"cat-778","paymentUrl":""}' });
  });
  let designPosts = 0;
  await page.route((url) => url.pathname === '/api/orders' && url.hostname === 'localhost', async (route) => {
    designPosts += 1;
    if (designPosts === 1) return route.fulfill({ status: 500, contentType: 'application/json', body: '{"ok":false}' });
    return route.continue();
  });

  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1000, 1000, [255, 0, 170]));
  await addToCart(page, { M: 1 });
  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 2' })).toBeVisible();

  await fillCheckout(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'Не удалось оформить заказ' })).toBeVisible({ timeout: 60_000 });

  // Перезагрузка стирает память страницы; корзина остаётся полной.
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page).toHaveURL(/\/thanks\?from=checkout$/, { timeout: 60_000 });
  expect(catalogOrders).toHaveLength(1);
  expect(designPosts).toBe(2);
});
