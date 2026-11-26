import { expect, test } from '@playwright/test';

/** Каталог из двух цветов одной футболки и худи: slug-и известны заранее. */
const product = (slug: string, type: string, name: string, color: string, stageColor: string) => ({
  _id: `id-${slug}`, slug, name, type, price: 1000, color, stageColor, isForPrinting: true, photos: [],
  editor_front_view: '', editor_back_view: '', sizes: [{ name: 'M', qty: 5 }], description: '',
});
const FAKE_CATALOG = [
  product('tee-white', 'tshirt', 'Футболка REGULAR белая', 'белая', '#ffffff'),
  product('tee-black', 'tshirt', 'Футболка REGULAR черная', 'черная', '#1c1c1c'),
  product('hoodie-grey', 'hoodie', 'Худи OVERSIZE серое', 'серое', '#9a9a9a'),
  product('hoodie-pink', 'hoodie', 'Худи OVERSIZE розовое', 'розовое', '#f4c2c9'),
];

async function openWithQuery(page: import('@playwright/test').Page, query: string) {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
  await page.route('**/api/products', (route) => route.fulfill({ json: { data: FAKE_CATALOG } }));
  await page.goto(`/constructor${query}`);
  await expect(page.getByRole('radiogroup', { name: 'Модель' }).getByRole('radio', { checked: true })).toBeVisible({ timeout: 60_000 });
}

test('?product=<slug> открывает конструктор с этим изделием и цветом, параметр уходит из адреса', async ({ page }) => {
  await openWithQuery(page, '?utm_source=ad&product=hoodie-pink');
  await expect(page.getByRole('radiogroup', { name: 'Модель' }).getByRole('radio', { checked: true })).toContainText('OVERSIZE');
  await expect(page.getByRole('button', { name: 'Изменить тип изделия' })).toBeVisible();
  await expect(page.getByRole('radio', { name: /розовое/i, checked: true })).toBeVisible();
  const url = new URL(page.url());
  expect(url.searchParams.get('product')).toBeNull();
  expect(url.searchParams.get('utm_source')).toBe('ad');
});

test('?product с неизвестным slug — обычный старт, параметр уходит из адреса', async ({ page }) => {
  await openWithQuery(page, '?product=no-such-product');
  await expect(page.getByRole('radiogroup', { name: 'Модель' }).getByRole('radio', { checked: true })).toContainText('REGULAR');
  await expect(page.getByRole('radiogroup', { name: 'Тип изделия' })).toBeVisible();
  expect(new URL(page.url()).searchParams.get('product')).toBeNull();
});
