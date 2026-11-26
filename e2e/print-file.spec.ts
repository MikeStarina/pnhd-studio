import { expect, test, type Page } from '@playwright/test';
import { dragLayer, openConstructor, orderAndSubmit, readStored, solidPng, uploadImage } from './helpers';

/** Рамка пикселей заданного цвета на картинке (считается в браузере через canvas). */
async function colorBox(page: Page, png: Buffer, color: 'red' | 'blue') {
  return page.evaluate(async ([b64, which]) => {
    const img = new Image();
    img.src = `data:image/png;base64,${b64}`;
    await img.decode();
    const c = document.createElement('canvas');
    c.width = img.naturalWidth;
    c.height = img.naturalHeight;
    const ctx = c.getContext('2d')!;
    ctx.drawImage(img, 0, 0);
    const { data } = ctx.getImageData(0, 0, c.width, c.height);
    let x1 = Infinity, y1 = Infinity, x2 = -1, y2 = -1;
    for (let y = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++) {
        const i = (y * c.width + x) * 4;
        const [r, g, b, a] = [data[i], data[i + 1], data[i + 2], data[i + 3]];
        const hit = a > 200 && (which === 'red' ? r > 150 && g < 90 && b < 90 : b > 150 && r < 90 && g < 90);
        if (hit) { x1 = Math.min(x1, x); y1 = Math.min(y1, y); x2 = Math.max(x2, x); y2 = Math.max(y2, y); }
      }
    }
    return { w: x2 - x1 + 1, h: y2 - y1 + 1, cx: (x1 + x2) / 2, cy: (y1 + y2) / 2, imgW: c.width, imgH: c.height };
  }, [png.toString('base64'), color] as const);
}

/**
 * Файл печати: размер в пикселях соответствует габариту принта в сантиметрах при заявленном dpi,
 * а взаимное положение и размеры элементов — те же, что на превью, которое видел клиент.
 */
test('файл печати совпадает с превью и с размером в сантиметрах', async ({ page }) => {
  await openConstructor(page);
  await uploadImage(page, 'red.png', solidPng(900, 900, [230, 20, 20]));
  await uploadImage(page, 'blue.png', solidPng(900, 450, [20, 20, 230]));

  // Второй слой сдвигаем вниз и вправо, чтобы элементы не перекрывались.
  await dragLayer(page, -1, 0.1, 2.2);
  await expect(page.getByRole('button', { name: /Принт вне зоны/i })).toHaveCount(0);

  const number = await orderAndSubmit(page, { M: 1 });
  const { meta, file } = await readStored(number);
  const print = await file('print_front');
  const preview = await file('preview_0_front');

  // 1. Размер файла печати = габарит принта (см) при dpi из имени файла.
  const dpi = Number(print.name.match(/_(\d+)dpi/)?.[1]);
  expect(dpi).toBeGreaterThanOrEqual(150);
  const cm = meta.order.sides[0].match(/≈(\d+)×(\d+) см/)!;
  const pr = await colorBox(page, print.buf, 'red');
  const pb = await colorBox(page, print.buf, 'blue');
  expect(Math.abs((pr.imgW / dpi) * 2.54 - Number(cm[1]))).toBeLessThanOrEqual(1);
  expect(Math.abs((pr.imgH / dpi) * 2.54 - Number(cm[2]))).toBeLessThanOrEqual(1);

  // 2. Элементы стоят так же, как на превью: сравниваем в долях ширины красного квадрата.
  const vr = await colorBox(page, preview.buf, 'red');
  const vb = await colorBox(page, preview.buf, 'blue');
  const rel = (r: typeof pr, b: typeof pr) => ({ dx: (b.cx - r.cx) / r.w, dy: (b.cy - r.cy) / r.w, bw: b.w / r.w, bh: b.h / r.w, rh: r.h / r.w });
  const [p, v] = [rel(pr, pb), rel(vr, vb)];
  for (const k of ['dx', 'dy', 'bw', 'bh', 'rh'] as const) expect(Math.abs(p[k] - v[k]), `${k}: печать ${p[k]}, превью ${v[k]}`).toBeLessThan(0.04);
});
