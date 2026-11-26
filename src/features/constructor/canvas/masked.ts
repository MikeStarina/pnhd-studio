import { PHOTO_SHAPE } from '../config/photo-shapes';
import { maskStyle } from '../model/slot';
import { measureText, textFont } from '../model/trim';
import type { ImageMask } from '../model/types';

/** Предел стороны буфера, px: больше canvas на телефонах может не выделить. */
const MAX_SIDE = 4096;
let buffer: HTMLCanvasElement | null = null;

const shapePaths = new Map<string, Path2D>();

type Src = { x: number; y: number; width: number; height: number };

/**
 * Рисует фото в прямоугольнике w×h, обрезанное по маске. Работает и на холсте, и в превью, и при снимке
 * файла печати: разрешение буфера берётся из текущего масштаба контекста.
 */
export function drawMasked(c: CanvasRenderingContext2D, img: CanvasImageSource, src: Src, w: number, h: number, mask: ImageMask) {
  if (w <= 0 || h <= 0) return;
  if (mask.kind === 'shape') {
    // Контур задан в рамке 100 × 100·aspect: растягиваем его под w×h только на время обрезки.
    const def = PHOTO_SHAPE[mask.shape];
    let path = shapePaths.get(def.id);
    if (!path) shapePaths.set(def.id, (path = new Path2D(def.d)));
    c.save();
    c.scale(w / 100, h / (100 * def.aspect));
    c.clip(path);
    c.scale(100 / w, (100 * def.aspect) / h);
    c.drawImage(img, src.x, src.y, src.width, src.height, 0, 0, w, h);
    c.restore();
    return;
  }
  if (mask.kind === 'strips') {
    const gap = mask.gap * h;
    const band = (h - gap * (mask.count - 1)) / mask.count;
    for (let i = 0; i < mask.count; i++) {
      c.save();
      c.beginPath();
      c.rect(0, i * (band + gap), w, band);
      c.clip();
      c.drawImage(img, src.x, src.y, src.width, src.height, 0, 0, w, h);
      c.restore();
    }
    return;
  }
  // Буквы: рисуем слово в буфер, поверх — фото только там, где есть буквы, и переносим буфер на холст.
  const t = c.getTransform();
  const k = Math.min(Math.hypot(t.a, t.b) || 1, MAX_SIDE / Math.max(w, h));
  const [bw, bh] = [Math.max(1, Math.ceil(w * k)), Math.max(1, Math.ceil(h * k))];
  buffer ??= document.createElement('canvas');
  buffer.width = bw;
  buffer.height = bh;
  const b = buffer.getContext('2d');
  if (!b) return;
  const style = maskStyle(mask);
  const box = measureText(mask.text, style, 100);
  if (!box.items.length) return;
  b.save();
  b.scale(bw / box.width, bh / box.height);
  b.font = textFont(style, 100);
  b.textAlign = 'left';
  b.textBaseline = 'alphabetic';
  b.fillStyle = '#000';
  for (const it of box.items) b.fillText(it.text, it.x, it.y);
  b.restore();
  b.globalCompositeOperation = 'source-in';
  b.drawImage(img, src.x, src.y, src.width, src.height, 0, 0, bw, bh);
  b.globalCompositeOperation = 'source-over';
  c.drawImage(buffer, 0, 0, bw, bh, 0, 0, w, h);
}

/**
 * Притенение для окна кадрирования: тёмная плашка с «дырками» по маске (буквы, полосы) в пропорциях окна
 * aspect (высота / ширина). Видно, какая часть снимка попадёт в буквы. null — нарисовать не вышло.
 */
export function maskOverlay(mask: ImageMask, aspect: number): string | null {
  const w = 600;
  const h = Math.max(1, Math.round(w * aspect));
  const out = document.createElement('canvas');
  out.width = w;
  out.height = h;
  const solid = document.createElement('canvas');
  solid.width = solid.height = 1;
  const s = solid.getContext('2d');
  const c = out.getContext('2d');
  if (!s || !c) return null;
  s.fillStyle = '#fff';
  s.fillRect(0, 0, 1, 1);
  c.fillStyle = 'rgb(0 0 0 / .45)';
  c.fillRect(0, 0, w, h);
  c.globalCompositeOperation = 'destination-out';
  drawMasked(c, solid, { x: 0, y: 0, width: 1, height: 1 }, w, h, mask);
  return out.toDataURL('image/png');
}
