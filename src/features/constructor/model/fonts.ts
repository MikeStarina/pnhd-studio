import { fontDef } from '../config/fonts';
import { FONT_BASE_URL, FONT_FILES } from '../config/font-files';
import { clearTextCache } from './trim';

/**
 * Загрузка шрифтов для холста. Konva рисует на canvas, а canvas не ждёт шрифт: пока он не загружен,
 * текст рисуется запасным, и габарит (цена, формат) считается по нему. Поэтому шрифт грузим через FontFace API,
 * после загрузки сбрасываем кэш измерений и просим интерфейс перерисоваться (см. onFontLoaded).
 */
const ready = new Set<string>();
const listeners = new Set<() => void>();

/** Подписка на «загрузился шрифт» — чтобы перерисовать слои и пересчитать габарит. */
export function onFontLoaded(fn: () => void) {
  listeners.add(fn);
  return () => { listeners.delete(fn); };
}

/** CSS-описание шрифта для canvas и document.fonts. */
export const fontSpec = (family: string, bold: boolean, italic: boolean, px = 32) =>
  `${italic ? 'italic' : 'normal'} ${bold ? 700 : 400} ${px}px "${family}"`;

/** Регистрирует начертания семейства как FontFace из локальных файлов (подгружаются по unicode-range). */
function registerFamily(family: string) {
  if (ready.has(family) || !fontDef(family)) return;
  for (const f of FONT_FILES) {
    if (f.family !== family) continue;
    document.fonts.add(new FontFace(family, `url(${FONT_BASE_URL}${f.file}) format('woff2')`, {
      style: f.style, weight: f.weight, unicodeRange: f.unicodeRange,
    }));
  }
  ready.add(family);
}

/** Дожидается шрифта для заданного текста. Системные шрифты (не из списка) готовы сразу. */
export async function ensureFont(family: string, bold: boolean, italic: boolean, text: string): Promise<void> {
  if (!fontDef(family) || typeof document === 'undefined') return;
  if (ready.has(family) && document.fonts.check(fontSpec(family, bold, italic), text || 'Аа')) return;
  registerFamily(family);
  await document.fonts.load(fontSpec(family, bold, italic), text || 'Аа');
  const refresh = () => { clearTextCache(); listeners.forEach((fn) => fn()); };
  refresh();
  // Safari сообщает о загрузке раньше, чем шрифт начинает работать в canvas: первое измерение выходит
  // по запасному шрифту и остаётся в кэше, а рисуется текст уже настоящим — надпись съезжает от своей рамки.
  // Поэтому ждём, пока canvas действительно применит шрифт, и пересчитываем ещё раз.
  if (canvasUses(family, bold, italic, text || 'Аа')) return;
  for (let i = 0; i < CANVAS_RETRIES; i++) {
    await new Promise((r) => setTimeout(r, CANVAS_RETRY_MS));
    if (canvasUses(family, bold, italic, text || 'Аа')) break;
  }
  refresh();
}

const CANVAS_RETRIES = 12;
const CANVAS_RETRY_MS = 150;
let probeCtx: CanvasRenderingContext2D | null | undefined;

/** Применяет ли canvas этот шрифт: ширина текста с ним отличается от ширины запасным шрифтом. */
function canvasUses(family: string, bold: boolean, italic: boolean, text: string): boolean {
  if (probeCtx === undefined) probeCtx = document.createElement('canvas').getContext('2d');
  if (!probeCtx) return true;
  const style = `${italic ? 'italic' : 'normal'} ${bold ? 700 : 400} 64px`;
  probeCtx.font = `${style} monospace`;
  const fallback = probeCtx.measureText(text).width;
  probeCtx.font = `${style} "${family}", monospace`;
  return Math.abs(probeCtx.measureText(text).width - fallback) > 0.5;
}

/** Загружен ли шрифт под этот текст (для проверки перед снимком холста). */
export function fontReady(family: string, bold: boolean, italic: boolean, text: string): boolean {
  if (!fontDef(family) || typeof document === 'undefined') return true;
  return ready.has(family) && document.fonts.check(fontSpec(family, bold, italic), text || 'Аа');
}
