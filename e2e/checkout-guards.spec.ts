import { expect, test, type Page } from '@playwright/test';
import { addToCart, fillCheckout, openConstructor, orderAndSubmit, solidPng, uploadImage } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
  await page.route(/mc\.yandex\.ru/, (r) => r.abort());
});

/** Заказы каталога (api.pnhd.ru) перехватываем: в настоящий бэкенд тестовые не уходят. */
async function catchCatalogOrders(page: Page) {
  const orders: unknown[] = [];
  await page.route((url) => url.pathname === '/api/orders' && url.hostname !== 'localhost', async (route) => {
    orders.push(route.request().postDataJSON());
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"id":"cat-900","paymentUrl":""}' });
  });
  return orders;
}

async function addCatalogItem(page: Page) {
  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByRole('link', { name: /Корзина, товаров: [1-9]/ })).toBeVisible();
}

async function designInCart(page: Page) {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(800, 800, [255, 0, 170]));
  await addToCart(page, { M: 1, L: 1 });
}

test('имя с фамилией длиннее, чем принимает бэкенд каталога: ошибка под полем, заказ не уходит', async ({ page }) => {
  const orders = await catchCatalogOrders(page);
  await addCatalogItem(page);
  await fillCheckout(page, undefined, false);
  await page.getByLabel('Имя', { exact: true }).fill('Александра-Виктория');
  await page.getByLabel('Фамилия').fill('Константинопольская-Задунайская');
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByText('Имя и фамилия вместе — не длиннее 39 знаков')).toBeVisible();
  await expect(page.getByLabel('Фамилия')).toBeFocused();
  expect(orders).toHaveLength(0);
});

test('промокод введён, но не применён: заказ не уходит, пока его не применят или не сотрут', async ({ page }) => {
  const orders = await catchCatalogOrders(page);
  await addCatalogItem(page);
  await fillCheckout(page, undefined, false);
  await page.getByLabel('Промокод').fill('SALE10');
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByText('Нажми «Применить» или очисти поле')).toBeVisible();
  await expect(page.getByLabel('Промокод')).toBeFocused();
  expect(orders).toHaveLength(0);

  await page.getByLabel('Промокод').fill('');
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page).toHaveURL(/\/thanks\?from=checkout$/, { timeout: 60_000 });
  expect(orders).toHaveLength(1);
});

test('«Спасибо» показывает номер заявки на изделие с принтом', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(800, 800, [255, 0, 170]));
  const number = await orderAndSubmit(page, { M: 1 });
  await expect(page.getByText(`Номер заявки: ${number}`)).toBeVisible();
});

test('размер пропал из каталога: заявка с меньшим количеством не уходит, покупателю сказано почему', async ({ page }) => {
  await designInCart(page);
  let designPosts = 0;
  await page.route((url) => url.pathname === '/api/orders' && url.hostname === 'localhost', async (route) => {
    designPosts += 1;
    await route.continue();
  });
  // В каталоге больше нет размера L.
  await page.route((url) => url.pathname === '/api/products' && url.hostname !== 'localhost', async (route) => {
    const response = await route.fetch();
    const json = (await response.json()) as { data: Array<{ sizes: Array<{ name: string }> }> };
    for (const product of json.data) product.sizes = product.sizes.filter((size) => size.name !== 'L');
    await route.fulfill({ response, json });
  });
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByRole('alert').filter({ hasText: 'В каталоге изменились размеры или цвета' })).toBeVisible({ timeout: 60_000 });
  expect(designPosts).toBe(0);
});

test('картинки изделия пропали из браузера: покупателю сказано собрать макет заново', async ({ page }) => {
  await designInCart(page);
  await fillCheckout(page);
  // Браузер вытеснил данные сайта: корзина в localStorage цела, картинок в IndexedDB нет.
  await page.evaluate(() => new Promise<void>((resolve, reject) => {
    const open = indexedDB.open('pnhd-cart-designs');
    open.onerror = () => reject(open.error);
    open.onsuccess = () => {
      const clear = open.result.transaction('assets', 'readwrite').objectStore('assets').clear();
      clear.onsuccess = () => resolve();
      clear.onerror = () => reject(clear.error);
    };
  }));
  await page.getByRole('button', { name: 'Оформить заказ' }).click();

  await expect(page.getByRole('alert').filter({ hasText: 'Макет не сохранился в браузере' })).toBeVisible({ timeout: 60_000 });
  await expect(page.getByRole('button', { name: 'Повторить' })).toHaveCount(0);
});

test('цена и остаток товара изменились в каталоге: корзина показывает новые и говорит об этом', async ({ page }) => {
  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByRole('link', { name: /Корзина, товаров: 1/ })).toBeVisible();

  // Пока товар лежал в корзине, он подорожал до 1 700 ₽, а размера M осталась одна штука.
  await page.route((url) => url.pathname === '/api/products' && url.hostname !== 'localhost', async (route) => {
    const response = await route.fetch();
    const json = (await response.json()) as { data: Array<{ slug: string; price: number; sizes: Array<{ name: string; qty: number }> }> };
    const product = json.data.find((item) => item.slug === 'futbolka-regular-chernaya')!;
    product.price = 1700;
    product.sizes.find((size) => size.name === 'M')!.qty = 1;
    await route.fulfill({ response, json });
  });
  await page.goto('/cart');

  const notice = page.getByRole('status').filter({ hasText: 'Корзина обновлена' });
  await expect(notice).toContainText('Футболка REGULAR черная: цена теперь 1 700 ₽');
  await expect(notice).toContainText('размера M осталось 1 шт.');
  await expect(page.getByText('1 700 ₽').first()).toBeVisible();
  await expect(page.getByText('Изделия, 1 шт.')).toBeVisible();
});

test('каталог принят, изделие с принтом не ушло: сверка не меняет корзину, повтор не шлёт каталог второй раз', async ({ page }) => {
  const orders = await catchCatalogOrders(page);
  await page.goto('/shop/futbolka-regular-chernaya');
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByRole('link', { name: /Корзина, товаров: 1/ })).toBeVisible();
  await designInCart(page);
  // Заявка на изделие с принтом срывается по связи.
  let offline = true;
  await page.route((url) => url.pathname === '/api/orders' && url.hostname === 'localhost', (route) => (offline ? route.abort() : route.continue()));
  await fillCheckout(page);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByRole('alert').filter({ hasText: 'часть уже принята' })).toBeVisible({ timeout: 60_000 });
  expect(orders).toHaveLength(1);

  // Принятый заказ уже списал остаток: размера M в каталоге осталась одна штука.
  await page.route((url) => url.pathname === '/api/products' && url.hostname !== 'localhost', async (route) => {
    const response = await route.fetch();
    const json = (await response.json()) as { data: Array<{ slug: string; sizes: Array<{ name: string; qty: number }> }> };
    json.data.find((item) => item.slug === 'futbolka-regular-chernaya')!.sizes.find((size) => size.name === 'M')!.qty = 1;
    await route.fulfill({ response, json });
  });
  offline = false;
  await fillCheckout(page);
  await expect(page.getByRole('status').filter({ hasText: 'Корзина обновлена' })).toHaveCount(0);
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page).toHaveURL(/\/thanks\?from=checkout$/, { timeout: 60_000 });
  expect(orders).toHaveLength(1);
});
