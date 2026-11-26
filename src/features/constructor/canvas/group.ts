import type Konva from 'konva';
import type { DesignLayer } from '../model/types';

/** Префикс id узла группы готового принта на холсте. */
export const GROUP_ID = 'g-';

/**
 * Перенос положения, поворота и масштаба узла группы в слои (доли зоны печати) и сброс узла группы.
 * Группа поворачивается и масштабируется целиком: точка привязки каждого слоя переносится преобразованием
 * группы, поворот складывается, размер умножается на масштаб группы.
 */
export function commitGroup(groupNode: Konva.Node, layers: DesignLayer[], area: { w: number; h: number }) {
  const t = groupNode.getTransform();
  const rot = groupNode.rotation();
  const k = groupNode.scaleX() || 1;
  const patches: Record<string, Partial<DesignLayer>> = {};
  for (const l of layers) {
    const p = t.point({ x: l.x * area.w, y: l.y * area.h });
    const base = { x: p.x / area.w, y: p.y / area.h, rotation: (((l.rotation + rot) % 360) + 360) % 360 };
    patches[l.id] = l.kind === 'image' ? { ...base, width: l.width * k } : { ...base, fontSize: l.fontSize * k };
  }
  groupNode.position({ x: 0, y: 0 });
  groupNode.rotation(0);
  groupNode.scale({ x: 1, y: 1 });
  return patches;
}

/** Имя узлов-групп на холсте (для жеста двумя пальцами). */
export const DESIGN_GROUP = 'designGroup';

/** Слои стороны, разбитые на подряд идущие куски: слои одной группы — один кусок, остальные — по одному. */
export function runs(layers: DesignLayer[], groupOf: (l: DesignLayer) => string | undefined) {
  const out: Array<{ group?: string; layers: DesignLayer[] }> = [];
  for (const l of layers) {
    const g = groupOf(l);
    const last = out[out.length - 1];
    if (g && last?.group === g) last.layers.push(l);
    else out.push({ group: g, layers: [l] });
  }
  return out;
}
