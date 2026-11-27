import { expect, test, type Page } from '@playwright/test';
import { mainButton, openConstructor } from './helpers';

test.skip(({ isMobile }) => !isMobile, 'Раскладка над экранной клавиатурой — только на телефоне');

const keyboardLayout = (page: Page) => page.locator('[data-kb]');

/**
 * Экранной клавиатуры в Chromium без устройства нет: подменяем visualViewport и уменьшаем его сами.
 * Вызывать до открытия страницы.
 */
async function fakeViewport(page: Page) {
  await page.addInitScript(() => {
    const vv = Object.assign(new EventTarget(), { height: window.innerHeight, offsetTop: 0, scale: 1 });
    Object.defineProperty(window, 'visualViewport', { value: vv, configurable: true });
    Object.assign(window, {
      shrinkViewport: (px: number, scale: number) => {
        Object.assign(vv, { height: (window.innerHeight - px) / scale, scale });
        vv.dispatchEvent(new Event('resize'));
      },
    });
  });
}

/** Видимая область стала ниже на px (клавиатура) при масштабе страницы scale. */
const shrinkViewport = (page: Page, px: number, scale = 1) =>
  page.evaluate(([h, s]) => (window as unknown as { shrinkViewport(px: number, scale: number): void }).shrinkViewport(h, s), [px, scale] as const);

/** Добавляет надпись и возвращает её поле «Текст». */
async function addText(page: Page) {
  await mainButton(page, /Добавить принт/i).click();
  await page.getByRole('button', { name: 'Добавить текст' }).click();
  return page.getByLabel('Текст', { exact: true });
}

async function pinchZoom(page: Page) {
  const cdp = await page.context().newCDPSession(page);
  await cdp.send('Input.synthesizePinchGesture', { x: 187, y: 300, scaleFactor: 2, relativeSpeed: 800 });
  await expect.poll(() => page.evaluate(() => window.visualViewport?.scale ?? 1)).toBeGreaterThan(1.5);
}

test('увеличенная щипком страница не включает раскладку набора: цвета и итог на месте', async ({ page }) => {
  await openConstructor(page);
  await pinchZoom(page);

  await expect(keyboardLayout(page)).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Цвет изделия' })).toBeVisible();
  await expect(mainButton(page, /Добавить принт/i)).toBeVisible();
});

test('поле осталось в фокусе без клавиатуры: зум щипком раскладку набора не включает', async ({ page }) => {
  await openConstructor(page);
  await (await addText(page)).focus();
  await pinchZoom(page);

  await expect(keyboardLayout(page)).toHaveCount(0);
});

test('видимая область уменьшилась без фокуса в поле (клавиатура адресной строки) — раскладка набора не включается', async ({ page }) => {
  await fakeViewport(page);
  await openConstructor(page);
  await shrinkViewport(page, 300);

  await expect(keyboardLayout(page)).toHaveCount(0);
  await expect(page.getByRole('radiogroup', { name: 'Цвет изделия' })).toBeVisible();
});

test('набор текста включает раскладку над клавиатурой; фокус ушёл из поля — выключает, даже если браузер не сообщил о закрытии клавиатуры', async ({ page }) => {
  await fakeViewport(page);
  await openConstructor(page);
  const field = await addText(page);
  await field.focus();
  await shrinkViewport(page, 300);
  await expect(keyboardLayout(page)).toHaveCount(1);

  // Видимая область остаётся уменьшенной, события resize нет.
  await field.blur();
  await expect(keyboardLayout(page)).toHaveCount(0);
});

test('при увеличенной странице набор текста тоже включает раскладку над клавиатурой', async ({ page }) => {
  await fakeViewport(page);
  await openConstructor(page);
  await (await addText(page)).focus();
  await shrinkViewport(page, 300, 1.3);

  await expect(keyboardLayout(page)).toHaveCount(1);
});

test('ползунок клавиатуру не открывает: с фокусом на нём раскладка набора не включается', async ({ page }) => {
  await fakeViewport(page);
  await openConstructor(page);
  await addText(page);
  await page.getByRole('tab', { name: 'Форма' }).click();
  await page.getByRole('slider', { name: 'Изгиб текста дугой' }).focus();
  await shrinkViewport(page, 300);

  await expect(keyboardLayout(page)).toHaveCount(0);
});
