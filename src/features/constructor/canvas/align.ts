/**
 * Выравнивание слоя в зоне печати. Работает с реальным габаритом узла (getClientRect относительно
 * зоны), поэтому учитывает поворот и то, что у текста точка x/y — центр, а у картинки — левый верхний угол.
 */
import { fitInOutline } from '../model/outline';

export type AlignMode = 'centerX' | 'centerY' | 'fit';

export interface Rect { x: number; y: number; width: number; height: number }

/**
 * @param origin точка привязки узла (node.x/y) в пикселях зоны
 * @param rect   габарит узла в пикселях зоны
 * @param area   размер зоны в пикселях
 * @returns новая точка привязки и коэффициент масштаба (1 — размер не меняется)
 */
export function alignLayer(
  mode: AlignMode, origin: { x: number; y: number }, rect: Rect, area: { w: number; h: number }, outline?: Array<[number, number]> | null,
) {
  if (mode === 'centerX') return { x: origin.x + area.w / 2 - (rect.x + rect.width / 2), y: origin.y, scale: 1 };
  if (mode === 'centerY') return { x: origin.x, y: origin.y + area.h / 2 - (rect.y + rect.height / 2), scale: 1 };
  if (outline) {
    // Зона по форме изделия: вписываем в сам контур, а не в прямоугольник вокруг него.
    const to = fitInOutline(rect, area, outline);
    if (to) return placeAt(origin, rect, { left: to.left, top: to.top, k: to.k });
  }
  // Вписать: масштаб относительно точки привязки — габарит растёт от неё, потом ставим его по центру.
  // 0.999 — запас на округление, чтобы край не срезало рамкой зоны.
  const k = 0.999 * Math.min(area.w / rect.width, area.h / rect.height);
  const nx = origin.x + k * (rect.x - origin.x);
  const ny = origin.y + k * (rect.y - origin.y);
  return {
    x: origin.x + (area.w - k * rect.width) / 2 - nx,
    y: origin.y + (area.h - k * rect.height) / 2 - ny,
    scale: k,
  };
}

/**
 * Перенос и масштаб слоя так, чтобы его габарит встал в точку `to.left/to.top` в размере `to.k` (масштаб — относительно точки привязки).
 * Параметры те же, что у alignLayer; результат — новая точка привязки и коэффициент масштаба.
 */
export function placeAt(origin: { x: number; y: number }, rect: Rect, to: { left: number; top: number; k: number }) {
  const nx = origin.x + to.k * (rect.x - origin.x);
  const ny = origin.y + to.k * (rect.y - origin.y);
  return { x: origin.x + (to.left - nx), y: origin.y + (to.top - ny), scale: to.k };
}

/** Прилипание к центру зоны при перетаскивании: сдвиг узла и какие направляющие показать. */
export function snapToCenter(rect: Rect, area: { w: number; h: number }, threshold: number) {
  const dx = area.w / 2 - (rect.x + rect.width / 2);
  const dy = area.h / 2 - (rect.y + rect.height / 2);
  const v = Math.abs(dx) <= threshold;
  const h = Math.abs(dy) <= threshold;
  return { dx: v ? dx : 0, dy: h ? dy : 0, v, h };
}
