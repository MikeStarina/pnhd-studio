import type { DesignLayer, Side } from './types';

/**
 * Слои, которые участвуют в дизайне: скрытые не рисуются, не попадают в превью, файл печати, габарит и цену.
 * Везде, где сторона считается «заполненной» или слои идут в заявку, берём слои через этот фильтр.
 */
export const visibleLayers = <T extends { hidden?: boolean }>(layers: T[]): T[] => layers.filter((l) => !l.hidden);

/** Есть ли на стороне хотя бы один видимый слой. */
export const sideHasLayers = (layers: DesignLayer[], side: Side) => layers.some((l) => l.side === side && !l.hidden);
