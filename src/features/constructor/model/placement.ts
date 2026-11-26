import { FRAME } from '../config/garment-shapes';
import { cornersInOutline, fitInOutline } from './outline';
import type { PlaceSpot, PrintArea, Side } from './types';

export const PLACE_LABEL: Record<PlaceSpot, string> = { heart: 'На сердце', chest: 'По центру груди', back: 'На спине' };

/** Стартовая ширина нового принта на большой зоне, см: обычный принт на груди, а не на всё изделие. */
export const START_MAX_CM = 28;

/** Отступ верха принта от шва горловины, см. */
const TOP_CM: Record<PlaceSpot, number> = { heart: 7, chest: 7, back: 10 };
/** Принт на сердце: не шире, и центр правее оси изделия (на виде спереди — левая грудь носящего), см. */
const HEART_MAX_CM = 9;
const HEART_OFFSET_CM = 10;
/** Запас на округление, чтобы край принта не срезало рамкой зоны. */
const FIT = 0.999;

/** Места нанесения зоны: кнопки показываются только там, где известен шов горловины. */
export const placesOf = (pa: PrintArea): PlaceSpot[] => (pa.collar ? pa.places ?? [] : []);

/** Шов горловины по центру в пикселях зоны. */
function collarInArea(pa: PrintArea, area: { w: number; h: number }) {
  const c = pa.collar!;
  return { x: ((c.x - pa.x) / pa.width) * area.w, y: ((c.y - pa.y) / pa.height) * area.h };
}

/**
 * Куда поставить принт: левый верхний угол габарита и коэффициент масштаба (1 — размер не меняется).
 * rect — габарит принта в пикселях зоны, area — размер зоны в пикселях. Принт крупнее места уменьшается:
 * на сердце — до 9 см, на груди и спине — до границ зоны.
 */
export function placeRect(pa: PrintArea, spot: PlaceSpot, rect: { width: number; height: number }, area: { w: number; h: number }) {
  const pxPerCm = area.w / pa.widthCm;
  const collar = collarInArea(pa, area);
  const top = collar.y + TOP_CM[spot] * pxPerCm;
  const k = Math.min(
    1,
    spot === 'heart' ? (HEART_MAX_CM * pxPerCm) / rect.width : Infinity,
    (FIT * area.w) / rect.width,
    (FIT * (area.h - top)) / rect.height,
  );
  const centerX = collar.x + (spot === 'heart' ? HEART_OFFSET_CM * pxPerCm : 0);
  return { left: centerX - (k * rect.width) / 2, top, k };
}

/**
 * Верх нового слоя в долях высоты зоны: на 7 см ниже шва горловины на переде, на 10 см — на спине.
 * Зоны без шва горловины (шоппер, рукава) — небольшой отступ от верха.
 */
export function startTop(pa: PrintArea, side: Side): number {
  if (!pa.collar) return 0.03;
  const heightCm = (pa.widthCm * pa.height * FRAME.h) / (pa.width * FRAME.w);
  const collarY = (pa.collar.y - pa.y) / pa.height;
  return collarY + TOP_CM[side === 'back' ? 'back' : 'chest'] / heightCm;
}

/**
 * Где и каким по ширине встаёт новая картинка (доли зоны): на 7 см ниже шва горловины, по центру; если в зоне-контуре
 * там не помещается (карман, узкая зона) — вписывается в контур. width — желаемая ширина, naturalHeight/naturalWidth — пропорции картинки.
 */
export function startPlace(pa: PrintArea, side: Side, img: { width: number; naturalWidth: number; naturalHeight: number }) {
  const W = 1000;
  const H = (W * pa.height * FRAME.h) / (pa.width * FRAME.w);
  const wPx = img.width * W;
  const hPx = (wPx * img.naturalHeight) / img.naturalWidth;
  const top = startTop(pa, side) * H;
  const x = (W - wPx) / 2;
  const y = Math.max(0.03 * H, Math.min(top, H - hPx));
  const outline = pa.outline && pa.outline.length >= 3 ? pa.outline.map(([px, py]): [number, number] => [px * W, py * H]) : null;
  const rect = { x, y, width: wPx, height: hPx };
  const corners: Array<[number, number]> = [[x, y], [x + wPx, y], [x + wPx, y + hPx], [x, y + hPx]];
  if (!outline || cornersInOutline(corners, outline, 0, 3)) return { x: x / W, y: y / H, width: img.width };
  const to = fitInOutline(rect, { w: W, h: H }, outline);
  return to ? { x: to.left / W, y: to.top / H, width: (img.width * to.k) } : { x: x / W, y: y / H, width: img.width };
}
