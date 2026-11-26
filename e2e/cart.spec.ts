import { expect, test, type Page } from '@playwright/test';

/**
 * Путь покупки: корзина переживает перезагрузку и прямой переход, пустая корзина не уводит в каталог,
 * оформление показывает ошибку и после успеха чистит корзину.
 * Заказ на api.pnhd.ru не уходит: запрос `/api/orders` перехватывается.
 */
const PRODUCT = '/shop/futbolka-regular-chernaya';
const NAME = 'Футболка REGULAR черная';

const addOne = async (page: Page) => {
  await page.goto(PRODUCT);
  await page.getByRole('button', { name: 'Добавить M' }).click();
  await page.getByRole('button', { name: 'В корзину' }).click();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();
};

test('корзина переживает перезагрузку и прямой переход на /cart и /checkout', async ({ page }) => {
  await addOne(page);

  await page.reload();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();

  await page.goto('/cart');
  await expect(page.getByRole('heading', { level: 1, name: 'Корзина' })).toBeVisible();
  await expect(page.getByRole('link', { name: NAME })).toBeVisible();
  await expect(page.getByText('1 200 ₽').first()).toBeVisible();
  await expect(page).toHaveURL(/\/cart$/);

  await page.goto('/checkout');
  await expect(page.getByRole('heading', { level: 1, name: 'Оформление заказа' })).toBeVisible();
  await expect(page.getByLabel('Имя', { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
});

test('корзина из старого sessionStorage переносится в localStorage', async ({ page }) => {
  await addOne(page);
  await page.evaluate(() => {
    const saved = localStorage.getItem('order');
    localStorage.removeItem('order');
    sessionStorage.setItem('order', saved ?? '');
  });
  await page.goto('/cart');
  await expect(page.getByRole('link', { name: NAME })).toBeVisible();
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('order') ?? '[]').length)).toBe(1);
});

test('пустая корзина показывает «пусто» со ссылкой в каталог, а не уводит', async ({ page }) => {
  await page.goto('/cart');
  await expect(page.getByRole('heading', { name: 'В корзине пока пусто' })).toBeVisible();
  await expect(page).toHaveURL(/\/cart$/);
  await page.getByRole('link', { name: 'Перейти в каталог' }).click();
  await expect(page).toHaveURL(/\/shop$/);

  await page.goto('/checkout');
  await expect(page.getByRole('heading', { name: 'В корзине пока пусто' })).toBeVisible();
  await expect(page).toHaveURL(/\/checkout$/);
});

test('под корзиной — подборка других изделий без товара из корзины; у пустой — «Посмотри в каталоге»', async ({ page }) => {
  await addOne(page);
  await page.goto('/cart');
  const picks = page.getByRole('list', { name: 'С этим заказывают' });
  await expect(picks.locator(':scope > li')).toHaveCount(4);
  await expect(picks.getByRole('heading', { name: NAME })).toHaveCount(0);
  // К футболке первым предлагаем другой вид изделия — худи
  await expect(picks.getByRole('heading').first()).toContainText('Худи');

  await page.getByRole('button', { name: `Удалить ${NAME}` }).click();
  await expect(page.getByRole('list', { name: 'Посмотри в каталоге' }).locator(':scope > li')).toHaveCount(4);
});

test('удаление товара из корзины показывает «пусто»', async ({ page }) => {
  await addOne(page);
  await page.goto('/cart');
  await page.getByRole('button', { name: `Удалить ${NAME}` }).click();
  await expect(page.getByRole('heading', { name: 'В корзине пока пусто' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'В корзине пока пусто' })).toBeVisible();
});

test('в корзине размеры меняются степпером, последнюю штуку не убрать', async ({ page }) => {
  await addOne(page);
  await page.goto('/cart');
  const sizes = page.getByRole('list', { name: `Размеры: ${NAME}` });
  await expect(page.getByRole('button', { name: 'Убрать M' })).toBeDisabled();

  await page.getByRole('button', { name: 'Добавить M' }).click();
  await expect(sizes).toContainText('2');
  await expect(page.getByText('2 400 ₽').first()).toBeAttached();
  await expect(page.getByRole('button', { name: 'Убрать M' })).toBeEnabled();

  await page.reload();
  await expect(page.getByRole('list', { name: `Размеры: ${NAME}` })).toContainText('2');
  await page.getByRole('button', { name: 'Убрать M' }).click();
  await expect(page.getByRole('button', { name: 'Убрать M' })).toBeDisabled();
  await expect(page.getByRole('link', { name: 'Другой размер' })).toHaveAttribute('href', /itemCartId=/);
});

test('оформление: ошибки полей, сбой отправки с повтором, успех чистит корзину', async ({ page }) => {
  let calls = 0;
  await page.route('**/api/orders', async (route) => {
    calls += 1;
    if (calls === 1) return route.fulfill({ status: 500, contentType: 'application/json', body: '{"message":"fail"}' });
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"id":"test","paymentUrl":""}' });
  });

  await addOne(page);
  await page.goto('/checkout');
  const submit = page.getByRole('button', { name: 'Оформить заказ' });

  await submit.click();
  await expect(page.getByText('Укажи имя')).toBeVisible();
  await expect(page.getByLabel('Имя', { exact: true })).toHaveAttribute('aria-invalid', 'true');
  expect(calls).toBe(0);

  await page.getByLabel('Имя', { exact: true }).fill('Тест');
  await page.getByLabel('Фамилия').fill('Тестов');
  await page.getByLabel('Телефон').fill('9991234567');
  await page.getByLabel('Почта').fill('autotest@example.com');
  await page.getByLabel('Ник в Telegram').fill('@pinhead_test');
  await page.getByLabel(/согласие на обработку/).check();
  await submit.click();

  await expect(page.getByRole('alert').filter({ hasText: 'Не удалось оформить заказ' })).toBeVisible();
  await expect(page.getByLabel('Фамилия')).toHaveValue('Тестов');
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();

  await page.getByRole('button', { name: 'Повторить' }).click();
  await expect(page).toHaveURL(/\/thanks\?from=checkout$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Спасибо за заказ' })).toBeVisible();
  expect(calls).toBe(2);

  await expect(page.getByRole('link', { name: 'Корзина, товаров: 0' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 0' })).toBeVisible();
});

/** СДЭК и промокод: ответы API подменяются, заказ перехватывается и разбирается. */
const CITY = (code: number, city: string, region: string) => ({
  city, code, region, country: 'Россия', latitude: 59.9, longitude: 30.3,
});
const CITIES = [
  CITY(137, 'Санкт-Петербург', 'Санкт-Петербург'),
  CITY(44, 'Москва', 'Москва'),
  CITY(1001, 'Кировск', 'Ленинградская обл.'),
  CITY(1002, 'Кировск', 'Мурманская обл.'),
];
const POINT = { uuid: 'p1', code: 'P1', name: 'ПВЗ Тестовый', location: CITY(44, 'Москва', 'Москва') };

const mockCdek = async (page: Page, price: 'ok' | 'fail') => {
  const requestedCodes: string[] = [];
  await page.route('**/api/shipping/cities**', (route) =>
    route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(CITIES) }));
  await page.route('**/api/shipping/points**', (route) => {
    requestedCodes.push(new URL(route.request().url()).searchParams.get('city_code') ?? '');
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify([POINT]) });
  });
  await page.route('**/api/shipping/calculate/**', (route) =>
    price === 'ok'
      ? route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ total_sum: 500 }) })
      : route.fulfill({ status: 500, contentType: 'application/json', body: '{}' }));
  return requestedCodes;
};

const captureOrder = async (page: Page) => {
  const bodies: Array<Record<string, unknown>> = [];
  await page.route('**/api/orders', (route) => {
    bodies.push(route.request().postDataJSON());
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"id":"test","paymentUrl":""}' });
  });
  return bodies;
};

const fillContacts = async (page: Page) => {
  await page.getByLabel('Имя', { exact: true }).fill('Тест');
  await page.getByLabel('Фамилия').fill('Тестов');
  await page.getByLabel('Телефон').fill('9991234567');
  await page.getByLabel('Почта').fill('autotest@example.com');
  await page.getByLabel('Ник в Telegram').fill('@pinhead_test');
  await page.getByLabel(/согласие на обработку/).check();
};

const chooseCdek = async (page: Page, city: string) => {
  await page.getByText('Доставка СДЭК').click();
  await page.locator('#checkout-city').fill(city);
  await page.getByLabel('Пункт выдачи').selectOption({ label: POINT.name });
};

test('оформление: ник в Telegram обязателен, «@» дописывается сам; в заказ каталога — отдельным полем и у имени', async ({ page }) => {
  const bodies = await captureOrder(page);
  await addOne(page);
  await page.goto('/checkout');
  await fillContacts(page);
  const nick = page.getByLabel('Ник в Telegram');
  const submit = page.getByRole('button', { name: 'Оформить заказ' });

  await nick.fill('');
  await submit.click();
  await expect(page.getByText('Укажи ник в Telegram')).toBeVisible();
  await expect(nick).toHaveAttribute('aria-invalid', 'true');

  await nick.fill('@ab');
  await submit.click();
  await expect(page.getByText('Ник — от 5 знаков: латиница, цифры и _')).toBeVisible();
  expect(bodies).toHaveLength(0);

  // Ссылку на профиль или ник без «@» тоже принимаем
  await nick.fill('https://t.me/pinhead_fan');
  await submit.click();
  await expect(page).toHaveURL(/\/thanks/);
  expect(bodies).toHaveLength(1);
  // Бэкенд каталога ещё не хранит ник: он уходит и отдельным полем, и в имени (имя на бэкенде — до 40 знаков)
  expect(bodies[0]).toMatchObject({
    owner_name: 'Тестов Тест · @pinhead_fan',
    owner_telegram: '@pinhead_fan',
    owner_email: 'autotest@example.com',
  });
});

test('СДЭК: без посчитанной цены доставки заказ не уходит', async ({ page }) => {
  await mockCdek(page, 'fail');
  const bodies = await captureOrder(page);
  await addOne(page);
  await page.goto('/checkout');
  await fillContacts(page);
  await chooseCdek(page, 'Москва');
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page.getByText('Дождись расчёта доставки')).toBeVisible();
  expect(bodies).toHaveLength(0);
});

test('СДЭК: город с тем же названием выбирается по региону', async ({ page }) => {
  const codes = await mockCdek(page, 'ok');
  await addOne(page);
  await page.goto('/checkout');
  await page.getByText('Доставка СДЭК').click();
  await page.locator('#checkout-city').fill('Кировск, Мурманская обл.');
  await expect(page.getByLabel('Пункт выдачи')).toBeVisible();
  expect(codes).toEqual(['1002']);
});

test('промокод: бесплатная доставка и скидка только на свой тип изделия, метка Roistat в заказе', async ({ page, context }) => {
  await context.addCookies([{ name: 'roistat_visit', value: '777', url: 'http://localhost' }]);
  await mockCdek(page, 'ok');
  const bodies = await captureOrder(page);
  const promos: Record<string, object> = {
    FREE: { name: 'FREE', mechanic: 'freeShipping', discounted_item: 'all', discount_ratio: 1, message: '', _id: '1' },
    HOOD: { name: 'HOOD', mechanic: 'discount', discounted_item: 'hoodie', discount_ratio: 0.5, message: '', _id: '2' },
  };
  await page.route('**/api/promocodes/**', (route) => {
    const { user_promocode } = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ promocode: [promos[user_promocode]] }) });
  });

  await addOne(page);
  await page.goto('/checkout');
  await fillContacts(page);
  await chooseCdek(page, 'Москва');
  await expect(page.getByText('518 ₽')).toBeVisible();

  await page.getByLabel('Промокод').fill('HOOD');
  await page.getByRole('button', { name: 'Применить' }).click();
  await expect(page.getByText('Промокод HOOD применён')).toBeVisible();
  await expect(page.getByText('1 718 ₽')).toBeVisible();

  await page.getByLabel('Промокод').fill('FREE');
  await page.getByRole('button', { name: 'Применить' }).click();
  await expect(page.getByText('Промокод FREE применён')).toBeVisible();
  await page.getByRole('button', { name: 'Оформить заказ' }).click();
  await expect(page).toHaveURL(/\/thanks/);

  expect(bodies).toHaveLength(1);
  expect(bodies[0]).toMatchObject({ order_total_price: 1200, order_discounted_price: 1200, shipping_price: 0, roistat: '777' });
});

test('фото вещи в корзине открывается крупно, на страницу товара ведёт название', async ({ page }) => {
  await addOne(page);
  await page.goto('/cart');
  await page.getByRole('button', { name: `Рассмотреть фото крупно: ${NAME}` }).click();
  const viewer = page.getByRole('dialog', { name: `Фото: ${NAME}` });
  await expect(viewer.getByRole('img', { name: `${NAME}, фото 1` })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(viewer).toBeHidden();
  await expect(page.getByRole('main').getByRole('link', { name: NAME })).toHaveAttribute('href', PRODUCT);
});
