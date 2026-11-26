import type { ImageLayer } from './types';

/** Ниже — предупреждаем, что печать может выйти нечёткой. */
export const MIN_DPI = 150;
export const MAX_FILE_MB = 15;
export const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/** Эффективное разрешение картинки на отпечатке. SVG — векторная, всегда ок. */
export function imageDpi(layer: ImageLayer, areaWidthCm: number, isVector = false): number {
  if (isVector) return Infinity;
  const printWidthInch = (layer.width * areaWidthCm) / 2.54;
  return printWidthInch > 0 ? Math.round(layer.naturalWidth / printWidthInch) : 0;
}

/** Значение `accept` у поля выбора файла: форматы выше и фото с iPhone (HEIC/HEIF). */
export const ACCEPT_ATTR = [...ACCEPTED_TYPES, '.heic', '.heif', 'image/heic', 'image/heif'].join(',');

export const HEIC_ERROR = 'Формат HEIC этот браузер не открывает. Сохрани фото как JPG или PNG и загрузи снова.';

/** Фото в HEIC/HEIF: по типу или (у части браузеров тип пустой) по расширению. */
export const isHeic = (f: File) =>
  /^image\/hei[cf]$/i.test(f.type) || (!f.type && /\.hei[cf]$/i.test(f.name));

/**
 * HEIC → JPEG средствами браузера (Safari его декодирует): рисуем в canvas и сохраняем JPEG ~0,92.
 * Если браузер не открыл файл — HEIC_ERROR.
 */
export async function convertHeic(f: File): Promise<File> {
  try {
    let w = 0;
    let h = 0;
    let draw: (ctx: CanvasRenderingContext2D) => void;
    if (typeof createImageBitmap === 'function') {
      const bmp = await createImageBitmap(f);
      [w, h] = [bmp.width, bmp.height];
      draw = (ctx) => { ctx.drawImage(bmp, 0, 0); bmp.close?.(); };
    } else {
      const url = URL.createObjectURL(f);
      try {
        const img = await new Promise<HTMLImageElement>((ok, fail) => {
          const el = new window.Image();
          el.onload = () => ok(el);
          el.onerror = () => fail(new Error('decode'));
          el.src = url;
        });
        [w, h] = [img.naturalWidth, img.naturalHeight];
        draw = (ctx) => ctx.drawImage(img, 0, 0);
      } finally {
        URL.revokeObjectURL(url);
      }
    }
    if (!w || !h) throw new Error('empty');
    const canvas = document.createElement('canvas');
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('ctx');
    // У JPEG нет прозрачности — подкладываем белый, чтобы прозрачные места не стали чёрными.
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, w, h);
    draw(ctx);
    const blob = await new Promise<Blob | null>((ok) => canvas.toBlob(ok, 'image/jpeg', 0.92));
    if (!blob) throw new Error('encode');
    return new File([blob], f.name.replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch {
    throw new Error(HEIC_ERROR);
  }
}

export function validateFile(f: File): string | null {
  if (!ACCEPTED_TYPES.includes(f.type) && !isHeic(f)) return 'Подойдут PNG, JPG, WEBP, SVG или HEIC.';
  if (f.size > MAX_FILE_MB * 1024 * 1024) return `Файл больше ${MAX_FILE_MB} МБ — уменьши его или пришли менеджеру.`;
  return null;
}
