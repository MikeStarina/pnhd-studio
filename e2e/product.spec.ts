import { expect, test } from '@playwright/test';

/** Страница товара: без размера кнопка неактивна и просит выбрать размер; выбрали — «В корзину», остаёмся на странице,
 *  видно подтверждение, в шапке в корзине 1, кнопка снова просит размер. */
test('товар добавляется в корзину без ухода со страницы', async ({ page }) => {
  await page.goto('/shop/futbolka-regular-chernaya');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Футболка REGULAR черная');

  const pickSize = page.getByRole('button', { name: 'Выбери размер' });
  await expect(pickSize).toBeDisabled();

  await page.getByRole('button', { name: 'Добавить M' }).click();
  await expect(page.getByText('1 шт. · 1 200 ₽')).toBeVisible();
  await page.getByRole('button', { name: 'В корзину' }).click();

  await expect(page.getByText('Добавлено в корзину')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Перейти в корзину' })).toBeVisible();
  await expect(page).toHaveURL(/\/shop\/futbolka-regular-chernaya$/);
  await expect(page.getByRole('link', { name: 'Корзина, товаров: 1' })).toBeVisible();
  await expect(pickSize).toBeDisabled();
});
