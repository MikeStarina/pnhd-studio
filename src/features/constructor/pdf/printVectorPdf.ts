import type { Font, Glyph } from 'fontkit';
import { FONT_BASE_URL, FONT_FILES } from '../config/font-files';
import { measureText, textFont } from '../model/trim';
import type { TextLayer } from '../model/types';

/** Надпись в файле печати: слой и матрица из его координат (пиксели холста) в пиксели файла печати. */
export interface PrintText {
  layer: TextLayer;
  fontPx: number;
  /** [a, b, c, d, e, f] — как у canvas setTransform. */
  matrix: number[];
}

/** Размер файла печати в пикселях и его точное разрешение (dpi в имени файла округлён). */
export interface PrintSize { w: number; h: number; dpi: number }

type M = [number, number, number, number, number, number];
const mul = (m: M, n: M): M => [
  m[0] * n[0] + m[2] * n[1], m[1] * n[0] + m[3] * n[1],
  m[0] * n[2] + m[2] * n[3], m[1] * n[2] + m[3] * n[3],
  m[0] * n[4] + m[2] * n[5] + m[4], m[1] * n[4] + m[3] * n[5] + m[5],
];
const move = (x: number, y: number): M => [1, 0, 0, 1, x, y];
const turn = (r: number): M => [Math.cos(r), Math.sin(r), -Math.sin(r), Math.cos(r), 0, 0];
const scale = (sx: number, sy: number): M => [sx, 0, 0, sy, 0, 0];

const hex = (color: string) => {
  const h = color.replace('#', '');
  const full = h.length === 3 ? [...h].map((c) => c + c).join('') : h.slice(0, 6);
  const n = Number.parseInt(full, 16) || 0;
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => v / 255) as [number, number, number];
};

const inRange = (range: string, cp: number) => range.split(',').some((part) => {
  const [a, b] = part.trim().replace(/^U\+/i, '').split('-').map((x) => Number.parseInt(x, 16));
  return cp >= a && cp <= (b ?? a);
});

const fonts = new Map<string, Promise<Font>>();
/** Файл шрифта, в котором есть буква: Google Fonts режет начертание на куски по алфавитам. */
async function fontFor(layer: TextLayer, cp: number): Promise<Font | null> {
  const style = layer.italic ? 'italic' : 'normal';
  const weight = layer.bold ? '700' : '400';
  const own = FONT_FILES.filter((f) => f.family === layer.fontFamily && inRange(f.unicodeRange, cp));
  // Нет нужного начертания (у Lobster только обычное) — берём ближайшее, как и браузер.
  const file = own.find((f) => f.style === style && f.weight === weight) ?? own.find((f) => f.style === style) ?? own[0];
  if (!file) return null;
  // Статичный TTF начертания (scripts/fonts-outline.py): из woff2 и переменных шрифтов контуры не достать.
  const url = `${FONT_BASE_URL}outline/${file.file.replace(/\.woff2$/, '')}-${file.weight}.ttf`;
  if (!fonts.has(url)) {
    fonts.set(url, (async () => {
      const { create } = await import('fontkit');
      const res = await fetch(url);
      if (!res.ok) throw new Error(`font_${res.status}`);
      return create(new Uint8Array(await res.arrayBuffer()) as unknown as Buffer) as Font;
    })().catch((e) => { fonts.delete(url); throw e; }));
  }
  return fonts.get(url)!;
}

/** Контур буквы в SVG-путь: координаты шрифта (ось y вверх) → пиксели файла печати через матрицу. */
function glyphPath(glyph: Glyph, m: M): string {
  const p = (x: number, y: number) => `${(m[0] * x + m[2] * y + m[4]).toFixed(2)} ${(m[1] * x + m[3] * y + m[5]).toFixed(2)}`;
  return glyph.path.commands.map(({ command, args }) => {
    const pts: string[] = [];
    for (let i = 0; i < args.length; i += 2) pts.push(p(args[i], args[i + 1]));
    const op = { moveTo: 'M', lineTo: 'L', quadraticCurveTo: 'Q', bezierCurveTo: 'C', closePath: 'Z' }[command];
    return `${op}${pts.join(' ')}`;
  }).join('');
}

/**
 * Файл печати для DTF в PDF: страница в размер принта, снизу картинки клиента (растр, как в PNG),
 * сверху надписи векторными кривыми. Дизайнер открывает его в Illustrator или CorelDRAW, правит текст
 * как контуры и кладёт под него подложку. Геометрия надписей — та же measureText, что рисует холст.
 *
 * @param art   PNG картинок без надписей, в размер файла печати; null — картинок нет
 */
export async function printVectorPdf(art: Blob | null, size: PrintSize, texts: PrintText[]): Promise<Blob> {
  const { PDFDocument, rgb } = await import('pdf-lib');
  const k = 72 / size.dpi;
  const doc = await PDFDocument.create();
  const page = doc.addPage([size.w * k, size.h * k]);
  if (art) {
    const image = await doc.embedPng(new Uint8Array(await art.arrayBuffer()));
    page.drawImage(image, { x: 0, y: 0, width: size.w * k, height: size.h * k });
  }
  const canvas = document.createElement('canvas').getContext('2d');

  for (const { layer, fontPx, matrix } of texts) {
    const box = measureText(layer.text, layer, fontPx);
    // Отражение — как mirror() в LayerNode; затем точка слоя в пиксели файла и в пункты PDF.
    let base = mul(scale(k, k), matrix as M);
    if (layer.flipX) base = mul(base, mul(move(box.width, 0), scale(-1, 1)));
    if (layer.flipY) base = mul(base, mul(move(0, box.height), scale(1, -1)));
    let d = '';
    for (const it of box.items) {
      if (canvas) canvas.font = textFont(layer, fontPx);
      const chars = [...it.text];
      // Позиции букв — по измерению браузера, с его кернингом: как на холсте.
      const width = canvas?.measureText(it.text).width ?? 0;
      let prefix = '';
      for (const ch of chars) {
        const x = (canvas?.measureText(prefix).width ?? 0) - (box.centered ? width / 2 : 0);
        prefix += ch;
        const cp = ch.codePointAt(0)!;
        if (!ch.trim()) continue;
        const font = await fontFor(layer, cp);
        if (!font) continue;
        const s = fontPx / font.unitsPerEm;
        const m = mul(base, mul(move(it.x, it.y), mul(turn(it.rot), mul(move(x, 0), scale(s, -s)))));
        d += glyphPath(font.glyphForCodePoint(cp), m);
      }
    }
    if (!d) continue;
    // Обводка — под заливкой, как на холсте; линия по контуру делится пополам, поэтому толщина вдвое.
    const lineScale = Math.sqrt(Math.abs(base[0] * base[3] - base[1] * base[2]));
    if (box.stroke > 0) {
      page.drawSvgPath(d, { x: 0, y: size.h * k, borderColor: rgb(...hex(layer.strokeColor)), borderWidth: box.stroke * 2 * lineScale });
    }
    page.drawSvgPath(d, { x: 0, y: size.h * k, color: rgb(...hex(layer.fill)) });
  }
  return new Blob([new Uint8Array(await doc.save())], { type: 'application/pdf' });
}
