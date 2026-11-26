import type Konva from 'konva';

/** Прилипание поворота к 0/90/180/270°, градусы (общее для ручки поворота и жеста двумя пальцами). */
export const SNAP_DEG = 5;

export interface Pt { x: number; y: number }

const deg = (rad: number) => (rad * 180) / Math.PI;

/**
 * Прямоугольник узла в его собственных осях (до поворота и масштаба). У фото и текста это 0,0,width,height;
 * у группы готового принта своей ширины нет — берём габарит её слоёв в осях группы.
 */
export function localRect(node: Konva.Node): { x: number; y: number; width: number; height: number } {
  if (node.getType() === 'Group') return node.getClientRect({ relativeTo: node as Konva.Container, skipShadow: true, skipStroke: true });
  return { x: 0, y: 0, width: node.width(), height: node.height() };
}

/** Точка середины узла в координатах холста. */
export function centerOf(node: Konva.Node): Pt {
  const r = localRect(node);
  return node.getAbsoluteTransform().point({ x: r.x + r.width / 2, y: r.y + r.height / 2 });
}

/** Сдвигает узел так, чтобы его середина вернулась в точку `center` (после поворота или масштаба). */
export function keepCenter(node: Konva.Node, center: Pt) {
  const parent = node.getParent();
  if (!parent) return;
  const inv = parent.getAbsoluteTransform().copy().invert();
  const now = inv.point(centerOf(node));
  const want = inv.point(center);
  node.position({ x: node.x() + want.x - now.x, y: node.y() + want.y - now.y });
}

/** Поворот в (-180, 180] с мягкой привязкой к прямым углам. */
export function snapRotation(r: number): number {
  let v = ((r % 360) + 540) % 360 - 180;
  for (const s of [-180, -90, 0, 90, 180]) if (Math.abs(v - s) <= SNAP_DEG) v = s === -180 ? 180 : s;
  return v;
}

/** Множитель масштаба, ниже которого принт не сжимается (minPx на экране по меньшей стороне). */
export function minScale(node: Konva.Node, minPx: number): number {
  const view = node.getAbsoluteScale().x / (node.scaleX() || 1);
  const r = localRect(node);
  return minPx / Math.max(1e-6, Math.min(r.width, r.height) * view);
}

/**
 * Жест двумя пальцами над узлом: расстояние между пальцами — масштаб, угол между ними — поворот.
 * Пишет только в узел (как ручки), центр принта остаётся на месте. Точки — в координатах контейнера холста.
 * Возвращает функцию обновления по текущим позициям пальцев.
 */
export function startPinch(node: Konva.Node, a: Pt, b: Pt, minPx: number) {
  const center = centerOf(node);
  const dist0 = Math.max(1, Math.hypot(b.x - a.x, b.y - a.y));
  const angle0 = deg(Math.atan2(b.y - a.y, b.x - a.x));
  const rotation0 = node.rotation();
  const scale0 = node.scaleX() || 1;
  return (p: Pt, q: Pt) => {
    const k = Math.hypot(q.x - p.x, q.y - p.y) / dist0;
    const s = Math.max(scale0 * k, minScale(node, minPx) * scale0);
    node.scale({ x: s, y: s });
    node.rotation(snapRotation(rotation0 + deg(Math.atan2(q.y - p.y, q.x - p.x)) - angle0));
    keepCenter(node, center);
    node.getLayer()?.batchDraw();
    node.fire('pinch');
  };
}
