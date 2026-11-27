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

test('форма расчёта отправляет заявку на бэкенд и благодарит', async ({ page }) => {
  let sent: unknown = null;
  // В настоящий бэкенд тестовая заявка не уходит.
  await page.route((url) => url.hostname !== 'localhost' && url.pathname.startsWith('/api/leads'), (route) => {
    sent = route.request().postDataJSON();
    return route.fulfill({ status: 200, contentType: 'application/json', body: '{"message":"Заявка отправлена"}' });
  });
  await page.goto('/');
  await page.locator('#price-name').fill('Тест');
  await page.locator('#price-phone').pressSequentially('9991234567');
  await page.locator('#price-agree').check();
  await page.getByRole('button', { name: 'Передать менеджеру' }).click();
  await expect(page.getByText('Спасибо! Менеджер свяжется с тобой')).toBeVisible();
  expect(sent).toMatchObject({ name: 'Тест', phone: '+79991234567' });
  expect(new URL(page.url()).search).toBe('');
});

test.describe('до загрузки скриптов', () => {
  test.use({ javaScriptEnabled: false });

  test('форма расчёта не отправляется и не кладёт имя и телефон в адрес страницы', async ({ page }) => {
    await page.goto('/');
    await page.locator('#price-name').fill('Тест');
    await page.locator('#price-phone').fill('+79991234567');
    await page.locator('#price-phone').press('Enter');
    await page.getByRole('button', { name: 'Передать менеджеру' }).click({ force: true });
    await page.waitForTimeout(1000);
    expect(new URL(page.url()).search).toBe('');
  });
});
