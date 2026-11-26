/**
 * Тримминг — пустые поля не должны попадать в размер принта: от него зависят сантиметры,
 * формат печати и цена.
 *   • Картинка: прозрачные края, а у непрозрачной картинки на белом фоне — белые края.
 *   • Текст: габарит по самим буквам, а не по строке шрифта с запасом под выносные элементы.
 */

export interface CropRect { x: number; y: number; width: number; height: number }

/** Картинку анализируем уменьшенной: границы точны до доли процента, а большие фото не тормозят. */
const SAMPLE = 800;
const ALPHA_MIN = 8;
const WHITE_MIN = 245;
/** Если поля меньше 2% — не обрезаем, разница незаметна. */
const KEEP_IF = 0.98;

/**
 * Область рисунка без пустых полей в пикселях исходной картинки.
 * null — обрезать нечего (полей нет, картинка пустая или её нельзя прочитать).
 */
export function contentBox(img: HTMLImageElement): CropRect | null {
  const nw = img.naturalWidth;
  const nh = img.naturalHeight;
  if (!nw || !nh) return null; // SVG без размеров
  const k = Math.min(1, SAMPLE / Math.max(nw, nh));
  const w = Math.max(1, Math.round(nw * k));
  const h = Math.max(1, Math.round(nh * k));
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  let d: Uint8ClampedArray;
  try {
    ctx.drawImage(img, 0, 0, w, h);
    d = ctx.getImageData(0, 0, w, h).data;
  } catch {
    return null;
  }

  const at = (x: number, y: number) => (y * w + x) * 4;
  const isWhite = (i: number) => d[i] >= WHITE_MIN && d[i + 1] >= WHITE_MIN && d[i + 2] >= WHITE_MIN;
  // Белый срезаем, только если вся картинка лежит на белом фоне: углы непрозрачные и белые.
  const whiteBg = [at(0, 0), at(w - 1, 0), at(0, h - 1), at(w - 1, h - 1)].every((i) => d[i + 3] >= 250 && isWhite(i));
  const empty = (i: number) => d[i + 3] < ALPHA_MIN || (whiteBg && isWhite(i));

  let [x1, y1, x2, y2] = [w, h, -1, -1];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (empty(at(x, y))) continue;
      if (x < x1) x1 = x;
      if (x > x2) x2 = x;
      if (y < y1) y1 = y;
      if (y > y2) y2 = y;
    }
  }
  if (x2 < 0) return null;

  // Запас в один пиксель выборки: на краю уменьшенной картинки цвета смешаны.
  const rx = Math.max(0, Math.floor((x1 - 1) / k));
  const ry = Math.max(0, Math.floor((y1 - 1) / k));
  const rw = Math.min(nw, Math.ceil((x2 + 2) / k)) - rx;
  const rh = Math.min(nh, Math.ceil((y2 + 2) / k)) - ry;
  if (rw >= nw * KEEP_IF && rh >= nh * KEEP_IF) return null;
  return { x: rx, y: ry, width: rw, height: rh };
}

/** Параметры начертания текста, влияющие на габарит. */
export interface TextStyle {
  fontFamily: string;
  bold: boolean;
  italic: boolean;
  align: 'left' | 'center' | 'right';
  /** Межстрочный шаг в долях кегля. */
  lineHeight: number;
  /** Толщина обводки наружу в долях кегля; 0 — нет. */
  strokeWidth: number;
  /** Изгиб дугой −100…+100. */
  arc: number;
  /** Повтор надписи столбиком: сколько раз. */
  repeat?: number;
}

/** Что и как рисовать: строка (прямой текст) или одна буква (дуга), точка — базовая линия. */
export interface TextItem { text: string; x: number; y: number; rot: number }

export interface TextBox {
  width: number;
  height: number;
  /** Элементы с координатами относительно левого верхнего угла габарита. */
  items: TextItem[];
  /** true — элементы рисуются с выравниванием по центру точки (буквы на дуге), иначе по левому краю. */
  centered: boolean;
  /** Толщина обводки наружу, px. */
  stroke: number;
}

let measureCtx: CanvasRenderingContext2D | null | undefined;
const textCache = new Map<string, TextBox>();

export const clearTextCache = () => textCache.clear();

const FALLBACK = 'Arial, sans-serif';
export const textFont = (st: Pick<TextStyle, 'fontFamily' | 'bold' | 'italic'>, fontPx: number) =>
  `${st.italic ? 'italic' : 'normal'} ${st.bold ? 700 : 400} ${fontPx}px "${st.fontFamily}", ${FALLBACK}`;

/** Предел угла дуги для самой длинной строки при изгибе 100: полукруг. */
const MAX_SWEEP = Math.PI;

/**
 * Габарит текста по буквам (вместе с обводкой и изгибом). Единственный источник геометрии текста:
 * по нему рисует холст, считаются сантиметры, формат и цена, снимается файл печати.
 * Вне браузера — нулевой.
 */
export function measureText(text: string, st: TextStyle, fontPx: number): TextBox {
  const empty: TextBox = { width: 0, height: 0, items: [], centered: false, stroke: 0 };
  const key = `${st.fontFamily}|${st.bold}|${st.italic}|${st.align}|${st.lineHeight}|${st.strokeWidth}|${st.arc}|${st.repeat ?? 1}|${fontPx}|${text}`;
  const hit = textCache.get(key);
  if (hit) return hit;
  if (typeof document === 'undefined') return empty;
  if (measureCtx === undefined) measureCtx = document.createElement('canvas').getContext('2d');
  if (!measureCtx) return empty;
  const ctx = measureCtx;
  ctx.font = textFont(st, fontPx);

  const stroke = st.strokeWidth * fontPx;
  const step = fontPx * st.lineHeight;
  const once = text.split('\n').map((t) => ({ t, m: ctx.measureText(t) }));
  const times = Math.max(1, Math.min(12, Math.round(st.repeat ?? 1)));
  const rows = Array.from({ length: times }, () => once).flat();
  const maxAdv = Math.max(0, ...rows.map((r) => r.m.width));
  const arc = Math.max(-100, Math.min(100, st.arc));

  const items: TextItem[] = [];
  let [minX, minY, maxX, maxY] = [Infinity, Infinity, -Infinity, -Infinity];
  const grow = (x: number, y: number) => {
    minX = Math.min(minX, x); maxX = Math.max(maxX, x); minY = Math.min(minY, y); maxY = Math.max(maxY, y);
  };

  if (Math.abs(arc) < 1) {
    rows.forEach((r, i) => {
      const x0 = st.align === 'left' ? 0 : st.align === 'center' ? (maxAdv - r.m.width) / 2 : maxAdv - r.m.width;
      const base = i * step;
      items.push({ text: r.t, x: x0, y: base, rot: 0 });
      if (r.t.trim()) {
        grow(x0 - r.m.actualBoundingBoxLeft, base - r.m.actualBoundingBoxAscent);
        grow(x0 + r.m.actualBoundingBoxRight, base + r.m.actualBoundingBoxDescent);
      }
    });
  } else {
    // Текст по дуге: самая длинная строка занимает |arc|% полукруга, остальные идут на концентрических дугах.
    const up = arc > 0; // горбом вверх: центр круга ниже текста
    const R = maxAdv / ((Math.abs(arc) / 100) * MAX_SWEEP);
    rows.forEach((r, i) => {
      const rho = up ? R - i * step : R + i * step;
      if (rho <= fontPx * 0.2) return; // строки внутри круга, дальше центра, не рисуем
      const lineW = r.m.width;
      const lineStart = st.align === 'left' ? 0 : st.align === 'center' ? (maxAdv - lineW) / 2 : maxAdv - lineW;
      // Позиция середины буквы вдоль дуги, считая от вершины (середины самой длинной строки).
      let pos = lineStart - maxAdv / 2;
      for (const ch of [...r.t]) {
        const m = ctx.measureText(ch);
        const mid = pos + m.width / 2;
        pos += m.width;
        if (!ch.trim()) continue;
        const phi = mid / rho;
        const px = rho * Math.sin(phi);
        const py = up ? R - rho * Math.cos(phi) : -R + rho * Math.cos(phi);
        const rot = up ? phi : -phi;
        items.push({ text: ch, x: px, y: py, rot });
        // Прямоугольник буквы, повёрнутый вместе с ней.
        const [cos, sin] = [Math.cos(rot), Math.sin(rot)];
        for (const [cx, cy] of [
          [-m.width / 2, -m.actualBoundingBoxAscent], [m.width / 2, -m.actualBoundingBoxAscent],
          [m.width / 2, m.actualBoundingBoxDescent], [-m.width / 2, m.actualBoundingBoxDescent],
        ]) grow(px + cx * cos - cy * sin, py + cx * sin + cy * cos);
      }
    });
  }

  let box: TextBox;
  if (minX === Infinity) {
    // Пустая надпись: оставляем рамку, за которую её можно взять.
    box = { width: fontPx * 0.5, height: fontPx, items: [], centered: false, stroke };
  } else {
    // Обводка выходит за буквы на свою толщину.
    minX -= stroke; minY -= stroke; maxX += stroke; maxY += stroke;
    box = {
      width: maxX - minX,
      height: maxY - minY,
      items: items.map((l) => ({ ...l, x: l.x - minX, y: l.y - minY })),
      centered: Math.abs(arc) >= 1,
      stroke,
    };
  }
  if (textCache.size > 500) textCache.clear();
  textCache.set(key, box);
  return box;
}
