import { expect, test } from '@playwright/test';
import { openConstructor } from './helpers';

const models = (page: import('@playwright/test').Page) => page.getByRole('radiogroup', { name: 'Модель' }).getByRole('radio');

test('модели идут по крою: Regular, Oversize, прочие взрослые, детские в конце', async ({ page }) => {
  await openConstructor(page);
  const labels = await models(page).evaluateAll((els) => els.map((e) => e.querySelector('span')?.textContent?.trim()));
  expect(labels).toEqual(['REGULAR', 'REGULAR 92/8', 'OVERSIZE', 'FREEFIT', 'KIDS']);
});

test('ткань в конце названия («Бежевая 92/8») — часть модели: цвета 92/8 собраны в одну модель, а не по модели на цвет', async ({ page }) => {
  await openConstructor(page);
  await models(page).filter({ hasText: 'REGULAR 92/8' }).click();
  const colors = page.getByRole('radiogroup', { name: 'Цвет изделия' });
  await expect(colors.getByRole('radio', { name: /Бежев/i })).toBeVisible();
  await expect(colors.getByRole('radio', { name: /Графит/i })).toBeVisible();
});

test('после выбора типа список типов сворачивается и раскрывается кнопкой «Изменить»', async ({ page }) => {
  await openConstructor(page);
  const types = page.getByRole('radiogroup', { name: 'Тип изделия' });
  await expect(types).toBeVisible();
  await types.getByRole('radio', { name: /Худи/ }).click();

  await expect(types).toBeHidden();
  const change = page.getByRole('button', { name: 'Изменить тип изделия' });
  await expect(change).toHaveAttribute('aria-expanded', 'false');
  await expect(models(page).first()).toBeVisible();

  await change.click();
  await expect(change).toHaveAttribute('aria-expanded', 'true');
  await expect(types).toBeVisible();
});

test('«Фото вживую» на холсте открывает окно выбранной модели, Esc закрывает и возвращает фокус', async ({ page }) => {
  await openConstructor(page);
  const open = page.getByRole('button', { name: 'Фото вживую: Футболка REGULAR' });
  await open.click();

  const dialog = page.getByRole('dialog', { name: /REGULAR/ });
  await expect(dialog).toBeVisible();
  await expect(dialog.getByText(/хлопок/i)).toBeVisible();
  await expect(dialog.getByRole('img').first()).toBeVisible();
  await expect(dialog).toContainText('180');
  await expect(dialog.getByRole('button', { name: 'Закрыть' }).first()).toBeFocused();

  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
  await expect(open).toBeFocused();

  await open.click();
  const view = page.viewportSize()!;
  await page.mouse.click(view.width - 5, view.height - 5);
  await expect(dialog).toBeHidden();
});
