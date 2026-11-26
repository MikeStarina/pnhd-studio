export type Pt = [number, number];

/** Расстояние от точки до отрезка. */
function distToSegment([px, py]: Pt, [ax, ay]: Pt, [bx, by]: Pt) {
  const [dx, dy] = [bx - ax, by - ay];
  const t = dx || dy ? Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / (dx * dx + dy * dy))) : 0;
  return Math.hypot(px - (ax + t * dx), py - (ay + t * dy));
}

/** Точка внутри многоугольника или не дальше `tol` от его границы. */
function insideOutline(p: Pt, poly: Pt[], tol: number) {
  let inside = false;
  let near = false;
  poly.forEach((a, i) => {
    const b = poly[(i + 1) % poly.length];
    if (a[1] > p[1] !== b[1] > p[1] && p[0] < ((b[0] - a[0]) * (p[1] - a[1])) / (b[1] - a[1]) + a[0]) inside = !inside;
    near ||= distToSegment(p, a, b) <= tol;
  });
  return inside || near;
}

/**
 * Лежит ли выпуклый контур слоя (его углы по порядку обхода) внутри многоугольника зоны. Простой многоугольник без дыр:
 * если весь периметр слоя внутри (с допуском `tol`), внутри и сам слой. `step` — шаг проверки по периметру: вырез уже шага не бывает.
 */
export function cornersInOutline(corners: Pt[], poly: Pt[], tol: number, step: number) {
  return corners.every((a, i) => {
    const b = corners[(i + 1) % corners.length];
    const n = Math.max(1, Math.ceil(Math.hypot(b[0] - a[0], b[1] - a[1]) / step));
    return Array.from({ length: n }, (_, j): Pt => [a[0] + ((b[0] - a[0]) * j) / n, a[1] + ((b[1] - a[1]) * j) / n])
      .every((p) => insideOutline(p, poly, tol));
  });
}

/** Шаг проверки по периметру при вписывании в контур, px: вырез горловины и пройма заметно шире. */
const FIT_STEP = 3;
/** Сетка положений при поиске места под принт в контуре: чем больше, тем точнее и дольше. */
const FIT_GRID = 24;

/**
 * Самый большой принт той же формы, который целиком лежит внутри контура зоны, и его место: из подходящих положений
 * берётся ближайшее к центру рамки зоны. Размер ищется делением пополам: чем меньше принт, тем больше мест для него.
 */
export function fitInOutline(rect: { x: number; y: number; width: number; height: number }, area: { w: number; h: number }, outline: Array<[number, number]>) {
  const spot = (k: number) => {
    const [w, h] = [rect.width * k, rect.height * k];
    let best: { left: number; top: number; d: number } | null = null;
    for (let i = 0; i <= FIT_GRID; i++) {
      for (let j = 0; j <= FIT_GRID; j++) {
        const left = ((area.w - w) * i) / FIT_GRID;
        const top = ((area.h - h) * j) / FIT_GRID;
        const d = Math.hypot(left + w / 2 - area.w / 2, top + h / 2 - area.h / 2);
        if (best && d >= best.d) continue;
        const corners: Array<[number, number]> = [[left, top], [left + w, top], [left + w, top + h], [left, top + h]];
        if (cornersInOutline(corners, outline, 0, FIT_STEP)) best = { left, top, d };
      }
    }
    return best;
  };
  let [lo, hi] = [0, 0.999 * Math.min(area.w / rect.width, area.h / rect.height)];
  const top = spot(hi);
  if (top) return { k: hi, ...top };
  let found: { k: number; left: number; top: number } | null = null;
  for (let i = 0; i < 14; i++) {
    const mid = (lo + hi) / 2;
    const at = spot(mid);
    if (at) { found = { k: mid, ...at }; lo = mid; } else hi = mid;
  }
  return found;
}

