import { expect, test } from '@playwright/test';
import { openConstructor, orderAndSubmit, solidPng, uploadImage } from './helpers';

test('на странице «Спасибо» — список заказанного: изделие, размеры, превью и итог', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  await orderAndSubmit(page, { M: 2, L: 1 });

  const list = page.getByRole('region', { name: 'В твоём заказе' });
  await expect(list).toBeVisible();
  const item = list.getByRole('listitem').filter({ hasText: 'свой принт' });
  await expect(item).toHaveCount(1);
  await expect(item).toContainText('M×2, L×1');
  await expect(item).toContainText('3 шт');
  await expect.poll(() => item.locator('img').evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
  await expect(list).toContainText('Самовывоз');
  await expect(list).toContainText('Итого');

  // Перезагрузка в той же вкладке список не теряет.
  await page.reload();
  await expect(page.getByRole('region', { name: 'В твоём заказе' })).toContainText('M×2, L×1');
});
