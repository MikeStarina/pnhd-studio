import { expect, test } from '@playwright/test';
import { acceptedNumber, fillCheckout, openConstructor, readStored, solidPng, storedCount, uploadImage } from './helpers';

/**
 * Акция −50% на трикотаж в конструкторе до 00:00 30.11.2026 (config/promo.ts).
 * Тесты про время идут с подменой часов браузера; сервер считает по своим часам — пока акция идёт.
 */
const DURING = new Date('2026-11-27T12:00:00+03:00');
const AFTER = new Date('2026-11-30T00:00:01+03:00');

test('полоса акции на главной ведёт в конструктор и считает время до конца', async ({ page }) => {
  await page.clock.setFixedTime(DURING);
  await page.goto('/');
  const bar = page.getByRole('link', { name: /Скидка 50% при оформлении заказа через конструктор/ });
  await expect(bar).toBeVisible();
  await expect(bar.locator('time')).toHaveText('2 дня 12:00:00');
  await bar.click();
  await expect(page).toHaveURL(/\/constructor/);
});

test('после конца акции полосы нет', async ({ page }) => {
  await page.clock.setFixedTime(AFTER);
  await page.goto('/');
  await expect(page.getByRole('link', { name: /Скидка 50%/ })).toHaveCount(0);
});

test('во время акции изделие за полцены, а без отзыва заявку не отправить', async ({ page }) => {
  await page.clock.setFixedTime(DURING);
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));

  // В разбивке у изделия метка скидки и зачёркнутая цена без акции
  await page.getByRole('button', { name: /Выбрать размеры/i }).last().click({ force: true });
  await page.getByRole('button', { name: 'Больше M', exact: true }).click();
  await expect(page.getByText('−50%').locator('visible=true').first()).toBeVisible();
  await expect(page.locator('s:visible').first()).toBeVisible();

  await page.getByRole('button', { name: 'В корзину', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Добавлено в корзину' })).toBeVisible({ timeout: 90_000 });

  // Отзыв о конструкторе — условие акции: на оформлении без него заказ не уходит.
  await fillCheckout(page, '');
  const before = await storedCount();
  const send = page.getByRole('button', { name: 'Оформить заказ' });
  await send.click();
  const feedback = page.getByLabel(/Отзыв о конструкторе/);
  await expect(page.getByText('Напиши пару слов о конструкторе — это условие акции')).toBeVisible();
  await expect(feedback).toBeFocused();
  expect(await storedCount()).toBe(before);

  await feedback.fill('Удобно, всё понятно');
  const number = await acceptedNumber(page);
  await send.click();
  const { meta } = await readStored(await number());
  expect(meta.order).toMatchObject({ promo: true, contacts: { comment: 'Отзыв о конструкторе: Удобно, всё понятно' } });
});

test('после конца акции цена без скидки и отзыв на оформлении не спрашиваем', async ({ page }) => {
  await page.clock.setFixedTime(AFTER);
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  await page.getByRole('button', { name: /Выбрать размеры/i }).last().click({ force: true });
  await page.getByRole('button', { name: 'Больше M', exact: true }).click();
  await expect(page.getByText('−50%')).toHaveCount(0);
  await page.getByRole('button', { name: 'В корзину', exact: true }).click();
  await expect(page.getByRole('dialog', { name: 'Добавлено в корзину' })).toBeVisible({ timeout: 90_000 });
  await page.goto('/checkout');
  await expect(page.getByText('свой принт').first()).toBeVisible();
  await expect(page.getByLabel(/Отзыв о конструкторе/)).toHaveCount(0);
});
