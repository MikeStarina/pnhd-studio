import { expect, test } from '@playwright/test';
import { noisePng, openConstructor, uploadImage } from './helpers';

test('фото, которое не помещается в localStorage, переживает перезагрузку: черновик возвращает его целиком', async ({ page }) => {
  await openConstructor(page);
  // Около 5 МБ: в localStorage (≈5 МБ на весь сайт) такая картинка не помещается.
  await uploadImage(page, 'photo.png', noisePng(1200, 1100));
  await expect.poll(() => page.evaluate(() => localStorage.getItem('pnhd-constructor-draft:1') !== null)).toBe(true);

  await page.reload();
  const prompt = page.getByRole('dialog', { name: 'Продолжить дизайн?' });
  await expect(prompt).toBeVisible({ timeout: 60_000 });
  await prompt.getByRole('button', { name: 'Продолжить' }).click();

  // На холсте та же картинка (её ширина в точках), а не пустое место.
  await expect.poll(() => page.evaluate(() => {
    const { Konva } = window as unknown as { Konva: { stages: Array<{ find(s: string): Array<{ image(): HTMLImageElement | undefined }> }> } };
    return Konva.stages[0]?.find('.design')[0]?.image()?.naturalWidth ?? 0;
  })).toBe(1200);
});
