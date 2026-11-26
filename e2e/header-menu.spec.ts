import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
});

test('меню-бургер: открытое меню не уводит шапку за верх экрана', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'бургер — меню телефона');

  await page.goto('/');
  await page.evaluate(() => window.scrollTo({ top: 1500, behavior: 'instant' }));
  const header = page.locator('header[data-source="header"]');
  const burger = page.getByRole('button', { name: 'Открыть меню' });

  await burger.click();
  await expect(page.getByRole('button', { name: 'Закрыть меню' })).toBeInViewport();
  expect(Math.round((await header.boundingBox())!.y)).toBe(0);

  await page.getByRole('button', { name: 'Закрыть меню' }).click();
  await expect(burger).toBeInViewport();
  expect(await page.evaluate(() => window.scrollY)).toBe(1500);
});
