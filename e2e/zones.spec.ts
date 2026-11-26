import { expect, test, type Page } from '@playwright/test';
import { dragLayer, openConstructor, orderAndSubmit, readStored, solidPng, uploadImage } from './helpers';

/** Габарит верхнего слоя дизайна на экране: центр и размеры. */
const layerBox = (page: Page) =>
  page.evaluate(() => {
    type Node = { getClientRect(): { x: number; y: number; width: number; height: number } };
    const stage = (window as unknown as { Konva: { stages: Array<{ find(s: string): Node[] }> } }).Konva.stages[0];
    const nodes = stage.find('.design');
    const r = nodes[nodes.length - 1].getClientRect();
    return { cx: r.x + r.width / 2, top: r.y, w: r.width, h: r.height };
  });

/** Размер принта из подписи под рамкой: «9 × 9 см · A6». */
const caption = (page: Page) => page.getByText(/^\d+(,\d)? × \d+(,\d)? см · /).first();

test('зона футболки — прямоугольник по центру до нижнего шва', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'проверка раскладки — десктоп');
  await openConstructor(page);
  // REGULAR: от горловины до нижнего шва на мокапе, с запасом от боковых швов.
  await expect(page.getByText('38 × 80 см', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'Спина', exact: true }).click();
  await expect(page.getByText('38 × 82 см', { exact: true })).toBeVisible();
});

test('новая картинка встаёт на грудь и не считается вышедшей за зону', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'проверка раскладки — десктоп');
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);
});

test('«На сердце» и «По центру груди» ставят принт в 7 см от шва горловины', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'проверка раскладки — десктоп');
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));

  await page.getByRole('button', { name: 'По центру груди' }).click();
  await expect.poll(async () => (await layerBox(page)).w).toBeGreaterThan(0);
  const chest = await layerBox(page);

  await page.getByRole('button', { name: 'На сердце' }).click();
  // Принт на сердце — не шире 9 см, с тем же отступом сверху, правее центра на 10 см от оси.
  await expect(page.getByText(/^9 × 9 см · /)).toBeVisible();
  const heart = await layerBox(page);
  expect(Math.abs(heart.top - chest.top)).toBeLessThan(1.5);
  expect((heart.cx - chest.cx) / heart.w).toBeGreaterThan(1.05);
  expect((heart.cx - chest.cx) / heart.w).toBeLessThan(1.17);
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);
});

test('на спине — кнопка «На спине», на переде её нет', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'проверка раскладки — десктоп');
  await openConstructor(page);
  await page.getByRole('button', { name: 'Спина', exact: true }).click();
  await uploadImage(page, 'logo.png', solidPng(900, 900, [255, 0, 170]));
  await expect(page.getByRole('button', { name: 'На сердце' })).toHaveCount(0);
  const before = await layerBox(page);
  await page.getByRole('button', { name: 'На спине' }).click();
  await expect(caption(page)).toBeVisible();
  const after = await layerBox(page);
  // Принт по центру спины: сдвиг по горизонтали нулевой (после загрузки он уже по центру), сверху — 10 см от шва.
  expect(Math.abs(after.cx - before.cx)).toBeLessThan(1.5);
});

test('принт, поднятый к горловине выше зоны, — вне зоны; «Вписать в зону» возвращает его', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'перетаскивание мышью — только десктоп');
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(900, 900, [255, 0, 170]));
  await page.getByRole('button', { name: 'По центру груди' }).click();
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);

  // Поднимаем принт к горловине: верх уходит выше зоны. Отпущенный над обрезанной частью, он теряет выделение —
  // кнопка «Принт вне зоны» ведёт к нему.
  await dragLayer(page, -1, 0, -0.9);
  await page.getByRole('button', { name: /Принт вне зоны/i }).click();
  await expect(page.getByText(/за границей зоны печати/).first()).toBeVisible();

  await page.getByRole('button', { name: /Вписать в зону/i }).click();
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);
});

/** Выбирает тип изделия: список типов раскрывается кнопкой «Изменить», если он свёрнут. */
async function pickType(page: Page, type: RegExp) {
  const change = page.getByRole('button', { name: 'Изменить тип изделия' });
  if ((await change.count()) && (await change.getAttribute('aria-expanded')) === 'false') await change.click();
  await page.getByRole('radiogroup', { name: 'Тип изделия' }).getByRole('radio', { name: type }).click();
}

test('у худи карман-кенгуру — отдельная вкладка «Карман» со своей зоной, цена и файл печати её учитывают', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'проверка раскладки — десктоп');
  await openConstructor(page);
  await expect(page.getByRole('button', { name: 'Карман', exact: true })).toHaveCount(0);
  await pickType(page, /Худи/);
  await page.getByRole('button', { name: 'Карман', exact: true }).click();
  await expect(page.getByText('34 × 25 см', { exact: true })).toBeVisible();

  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);

  const number = await orderAndSubmit(page, { M: 1 });
  const { meta } = await readStored(number);
  const names = meta.files.map((f) => f.name).join(' ');
  expect(names).toContain('print_pocket');
  expect(names).toContain('preview_0_pocket');
  expect(meta.order.sides.join(' ')).toContain('карман');
});

test('зип-худи: принт через молнию не «вне зоны», в файле печати под молнией прозрачная полоса', async ({ page }) => {
  test.skip(test.info().project.name.startsWith('mobile'), 'проверка раскладки — десктоп');
  // В каталоге нет зип-модели: переименовываем худи в ответе API.
  await page.route('**/api/products', async (route) => {
    const res = await route.fetch();
    const json = (await res.json()) as { data?: Array<{ type: string; name: string }> };
    if (!Array.isArray(json.data)) return route.fulfill({ response: res });
    const data = json.data.map((p) => (p.type === 'hoodie' ? { ...p, name: p.name.replace('Худи', 'Худи ZIP') } : p));
    await route.fulfill({ response: res, json: { ...json, data } });
  });
  await openConstructor(page);
  await pickType(page, /Худи/);
  await expect(page.getByRole('button', { name: 'Карман', exact: true })).toHaveCount(0);

  // Картинка встаёт по центру, то есть поперёк молнии.
  await uploadImage(page, 'logo.png', solidPng(900, 900, [230, 20, 20]));
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'На сердце' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'По центру груди' })).toHaveCount(0);

  const number = await orderAndSubmit(page, { M: 1 });
  const { file } = await readStored(number);
  const print = await file('print_front');
  const dpi = Number(print.name.match(/_(\d+)dpi/)?.[1]);
  const alpha = await page.evaluate(async ([b64, d]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const cm = d / 2.54;
    const at = (dx: number) => ctx.getImageData(Math.round(c.width / 2 + dx * cm), Math.round(c.height / 2), 1, 1).data[3];
    return { strip: at(0), left: at(-2.5), right: at(2.5) };
  }, [print.buf.toString('base64'), dpi] as const);
  expect(alpha).toEqual({ strip: 0, left: 255, right: 255 });
});
