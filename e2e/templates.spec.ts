import { expect, test } from '@playwright/test';
import { layerCount, openConstructor } from './helpers';

/** Пока у принтов нет фото вживую, карточка — одно превью без карусели, а применение шаблона работает как раньше. */
test('готовый принт без фото вживую: одно превью, без карусели, применяется к изделию', async ({ page, isMobile }) => {
  await openConstructor(page);
  // На телефоне каталог принтов — на втором шаге.
  if (isMobile) await page.getByRole('button', { name: 'Добавить принт' }).click();
  await page.getByRole('button', { name: /Готовые принты/ }).first().click();
  const dialog = page.getByRole('dialog', { name: 'Готовые принты' });
  await expect(dialog).toBeVisible();

  await expect(dialog.getByRole('group', { name: /вживую/ })).toHaveCount(0);
  await expect(dialog.getByRole('button', { name: /Снимок с подписью/ })).toHaveCount(1);

  const before = await layerCount(page);
  await dialog.getByRole('button', { name: /Снимок с подписью/ }).click();
  await expect(dialog).toHaveCount(0);
  await expect.poll(() => layerCount(page)).toBeGreaterThan(before);
});
