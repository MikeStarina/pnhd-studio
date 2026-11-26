import { SIDES, type Garment, type GarmentType, type PrintArea, type Side } from '../model/types';
import { SHAPES } from './garment-shapes';

/**
 * Зоны печати по типам изделий.
 * ВРЕМЕННО: прикидка по мокапам. Реальные размеры зон (см) — от производства Pinhead
 * (уточняются у производства).
 */
type FlatSide = 'front' | 'back';

const TEE: Record<FlatSide, PrintArea> = {
  front: { x: 0.3, y: 0.22, width: 0.4, height: 0.5, widthCm: 30 },
  back: { x: 0.3, y: 0.18, width: 0.4, height: 0.55, widthCm: 30 },
};

export const PRINT_AREAS: Record<GarmentType, Record<FlatSide, PrintArea>> = {
  tshirt: TEE,
  longsleeve: TEE,
  sweatshirt: TEE,
  hoodie: {
    front: { x: 0.32, y: 0.3, width: 0.36, height: 0.3, widthCm: 28 },
    back: { x: 0.3, y: 0.24, width: 0.4, height: 0.5, widthCm: 30 },
  },
  totebag: {
    front: { x: 0.25, y: 0.38, width: 0.5, height: 0.48, widthCm: 30 },
    back: { x: 0.25, y: 0.38, width: 0.5, height: 0.48, widthCm: 30 },
  },
  cap: {
    front: { x: 0.35, y: 0.35, width: 0.3, height: 0.2, widthCm: 10 },
    back: { x: 0.4, y: 0.4, width: 0.2, height: 0.12, widthCm: 6 },
  },
};

/** Стороны, доступные модели: те, у которых на мокапе размечена зона (рукава — у одежды, карман — у худи); без мокапа — перед и спина. */
export function sidesFor(garment: Garment | null): Side[] {
  const shape = garment?.shapeId ? SHAPES[garment.shapeId] : null;
  return SIDES.filter((s) => (shape ? !!shape.areas[s] : s === 'front' || s === 'back'));
}

/** Зона печати модели: с мокапа, если он есть, иначе — общая по типу изделия. */
export function printAreaFor(garment: Garment, side: Side): PrintArea {
  const own = garment.shapeId ? SHAPES[garment.shapeId].areas[side] : undefined;
  if (own) return own;
  return PRINT_AREAS[garment.type][side === 'back' ? 'back' : 'front'];
}
