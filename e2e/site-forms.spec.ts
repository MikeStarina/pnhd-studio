import { expect, test } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('COOKIE_AGREEMENT', 'AGREED'));
});

test('битый якорь в адресе не роняет страницу', async ({ page }) => {
  await page.goto('/#%');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Что-то пошло не так' })).toHaveCount(0);
  await expect(page.locator('#price-phone')).toBeAttached();
});

test('форма расчёта: телефон стирается клавишей Backspace до конца', async ({ page }) => {
  await page.goto('/');
  const phone = page.locator('#price-phone');
  await phone.scrollIntoViewIfNeeded();
  await phone.pressSequentially('9991');
  await expect(phone).toHaveValue('+7 (999) 1');
  await phone.press('Backspace');
  await phone.press('Backspace');
  await expect(phone).toHaveValue('+7 (99');
  await phone.press('Backspace');
  await phone.press('Backspace');
  await phone.press('Backspace');
  await expect(phone).toHaveValue('');
});
