import { photoPlaceholder } from '../config/template-art';
import { measureText, textFont } from './trim';
import type { ImageLayer, ImageMask } from './types';

/** Обрезка снимка iw×ih по центру под окно с пропорциями aspect (высота в долях ширины). */
export function coverCrop(iw: number, ih: number, aspect: number) {
  const cw = Math.min(iw, ih / aspect);
  const ch = cw * aspect;
  return { x: Math.round((iw - cw) / 2), y: Math.round((ih - ch) / 2), width: Math.round(cw), height: Math.round(ch) };
}

/** Начертание слова-маски для измерения и отрисовки. */
export const maskStyle = (m: Extract<ImageMask, { kind: 'text' }>) =>
  ({ fontFamily: m.fontFamily, bold: m.bold, italic: false, align: 'center' as const, lineHeight: 1, strokeWidth: 0, arc: 0 });

/** Пропорции окна под слово: высота букв в долях ширины слова. */
export function maskAspect(m: Extract<ImageMask, { kind: 'text' }>): number {
  const box = measureText(m.text, maskStyle(m), 100);
  return box.width > 0 ? box.height / box.width : 1;
}

/**
 * Поля слоя после смены пропорций окна (например, поменяли слово-маску): заглушка перерисовывается,
 * а вставленный снимок заново обрезается по центру.
 */
export function refitSlot(layer: ImageLayer, aspect: number): Partial<ImageLayer> {
  if (layer.placeholder || !layer.srcSize) return { slot: aspect, ...photoPlaceholder(aspect, !!layer.mask) };
  const crop = coverCrop(layer.srcSize.w, layer.srcSize.h, aspect);
  return { slot: aspect, crop, naturalWidth: crop.width, naturalHeight: crop.height };
}

/** Габарит одной буквы слова: x, y, w, h — в долях ширины всего слова (по буквам, без пустых полей). */
export interface LetterBox { ch: string; x: number; y: number; w: number; h: number }

/**
 * Раскладка слова по буквам — для «своего снимка в каждой букве»: где стоит каждая буква и какого она размера.
 * Позиция буквы — по ширине предыдущей части слова (с кернингом шрифта). Пробелы мест под фото не дают.
 */
export function letterBoxes(text: string, m: { fontFamily: string; bold: boolean }): LetterBox[] {
  if (typeof document === 'undefined') return [];
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return [];
  ctx.font = textFont({ fontFamily: m.fontFamily, bold: m.bold, italic: false }, 100);
  const chars = [...text];
  const raw: Array<{ ch: string; l: number; t: number; r: number; b: number }> = [];
  chars.forEach((ch, i) => {
    if (!ch.trim()) return;
    const adv = ctx.measureText(chars.slice(0, i).join('')).width;
    const mc = ctx.measureText(ch);
    raw.push({ ch, l: adv - mc.actualBoundingBoxLeft, t: -mc.actualBoundingBoxAscent, r: adv + mc.actualBoundingBoxRight, b: mc.actualBoundingBoxDescent });
  });
  if (!raw.length) return [];
  const [l, t, r] = [Math.min(...raw.map((x) => x.l)), Math.min(...raw.map((x) => x.t)), Math.max(...raw.map((x) => x.r))];
  const W = Math.max(1e-6, r - l);
  return raw.map((x) => ({ ch: x.ch, x: (x.l - l) / W, y: (x.t - t) / W, w: (x.r - x.l) / W, h: (x.b - x.t) / W }));
}

/** Место под фото «снимка в каждой букве»: маска из одной буквы. */
export const isLetterSlot = (l: { kind: string; slot?: number; mask?: ImageMask }) =>
  l.kind === 'image' && l.slot !== undefined && l.mask?.kind === 'text' && [...l.mask.text].length === 1;
