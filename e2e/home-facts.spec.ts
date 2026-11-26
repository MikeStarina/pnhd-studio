import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
});

test('обещания «Студии»: тап по ссылке на телефоне не перекрашивает карточки, Tab — перекрашивает', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'касание — сценарий телефона');

  await page.goto('/');
  const facts = page.locator('ul:has(> li[data-highlight])').first();
  const main = facts.locator('> li').filter({ hasText: 'за принт формата А6' });
  const call = facts.locator('> li').filter({ hasText: 'ждать звонка после заявки' });
  await expect(main).toHaveAttribute('data-active');

  await call.getByRole('link', { name: 'Оставить заявку' }).tap();
  await expect(main).toHaveAttribute('data-active');
  await expect(call).not.toHaveAttribute('data-active');

  await main.getByRole('link', { name: 'Все цены' }).focus();
  await page.keyboard.press('Tab');
  await expect(call).toHaveAttribute('data-active');
});
