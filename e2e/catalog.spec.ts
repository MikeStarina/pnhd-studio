import { expect, test } from '@playwright/test';

// Плашка cookie на телефоне перекрывает низ панели фильтров — считаем, что согласие уже дано.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
});

test('каталог: карточки есть в HTML, размер меняет адрес и число моделей, «Сбросить» возвращает всё', async ({ page, request }) => {
  const html = await (await request.get('/shop')).text();
  expect(html.match(/<h1/g)).toHaveLength(1);
  expect(html.match(/<article/g)).toHaveLength(31);

  await page.goto('/shop');
  const cards = page.locator('#catalog-results article');
  await expect(cards).toHaveCount(31);

  const trigger = page.getByRole('button', { name: /Фильтры/ });
  await trigger.click();
  const panel = page.getByRole('dialog', { name: 'Фильтры' });
  await expect(panel).toBeVisible();

  await panel.getByRole('button', { name: 'XS', exact: true }).click();
  await expect(page).toHaveURL(/\/shop\?size=XS$/);
  await expect(cards).toHaveCount(7);
  await expect(panel.getByRole('button', { name: 'Показать 7 моделей' })).toBeVisible();

  await panel.getByRole('button', { name: 'Сбросить' }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(cards).toHaveCount(31);

  await page.keyboard.press('Escape');
  await expect(panel).toBeHidden();
  await expect(trigger).toBeFocused();
});

test('карточка каталога: кружок меняет цвет на месте, высота карточки не меняется', async ({ page }) => {
  await page.goto('/shop');
  const card = page.locator('#catalog-results article').filter({ has: page.getByRole('button', { name: 'бежевый' }) }).first();
  await card.scrollIntoViewIfNeeded();
  const height = (await card.boundingBox())?.height;

  await card.getByRole('button', { name: 'бежевый' }).click();
  await expect(page).toHaveURL(/\/shop$/);
  await expect(card.getByRole('heading')).toHaveText('Футболка REGULAR Бежевая 92/8');
  await expect(card.getByRole('link', { name: 'Футболка REGULAR Бежевая 92/8', exact: true })).toHaveAttribute('href', '/shop/futbolka-regular-bezh');
  await expect(card.getByRole('button', { name: 'бежевый' })).toHaveAttribute('aria-pressed', 'true');

  await card.getByRole('button', { name: 'розовый' }).click();
  await expect(card.getByRole('heading')).toHaveText('Футболка REGULAR розовая');
  expect((await card.boundingBox())?.height).toBe(height);
});

test('частые вопросы: на /shop их нет, у раздела — свои', async ({ page }) => {
  await page.goto('/shop');
  await expect(page.getByRole('heading', { name: /Частые\s*вопросы/ })).toHaveCount(0);

  await page.goto('/hudi');
  await expect(page.getByRole('heading', { name: /Частые\s*вопросы/ })).toBeVisible();
});
