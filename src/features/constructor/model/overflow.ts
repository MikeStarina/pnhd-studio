import { sidesFor } from '../config/print-areas';
import { layerZoneRect } from './bounds';
import { cornersInOutline } from './outline';
import type { DesignLayer, Garment } from './types';

/** Допуск на выход за край зоны — доля её размера: микро-сдвиги и округление не считаются нарушением. */
export const OVERFLOW_TOLERANCE = 0.005;

/** Шаг проверки по периметру слоя, доля ширины зоны: вырез горловины уже шага не бывает. */
const EDGE_STEP = 0.006;

/**
 * Выходит ли слой за зону печати своей стороны. Считается по данным слоя (с поворотом; у текста — по
 * `measureText`), без холста. У зон-контуров (перед и спина по форме изделия, рукава) проверяется сам контур:
 * слой, торчащий в вырез горловины или пройму, выходит, даже если лежит в прямоугольнике зоны. Слой целиком вне зоны — тоже выход.
 */
export function layerOverflows(garment: Garment, layer: DesignLayer): boolean {
  const { rect, corners, outline, w, h } = layerZoneRect(garment, layer);
  if (![rect.x1, rect.y1, rect.x2, rect.y2].every(Number.isFinite)) return false;
  const tx = w * OVERFLOW_TOLERANCE;
  const ty = h * OVERFLOW_TOLERANCE;
  if (rect.x1 < -tx || rect.y1 < -ty || rect.x2 > w + tx || rect.y2 > h + ty) return true;
  if (!outline) return false;
  return !cornersInOutline(corners, outline, tx, w * EDGE_STEP);
}

/**
 * Видимые слои, выходящие за зону печати, — на любой стороне модели. Место под фото из готового принта
 * (оно в печать не идёт) не считается. Зависит от загруженных шрифтов (`fontTick`), если речь о тексте.
 */
export function overflowingLayers(state: { garments: Garment[]; garmentId: string | null; layers: DesignLayer[] }): DesignLayer[] {
  const garment = state.garments.find((g) => g.id === state.garmentId);
  if (!garment) return [];
  const sides = sidesFor(garment);
  return state.layers.filter((l) => !l.hidden && !(l.kind === 'image' && l.placeholder) && sides.includes(l.side) && layerOverflows(garment, l));
}
