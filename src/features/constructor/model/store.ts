'use client';
import { create } from 'zustand';
import { DEFAULT_FONT } from '../config/fonts';
import { printAreaFor, sidesFor } from '../config/print-areas';
import { startPlace, startTop } from './placement';
import type {
  DesignLayer, Garment, ImageLayer, PrintMethod, Side, SizeQuantities, TextLayer,
} from './types';

const uid = () => Math.random().toString(36).slice(2, 10);

type NewImage = Pick<ImageLayer, 'src' | 'fileName' | 'isVector' | 'naturalWidth' | 'naturalHeight' | 'crop' | 'width'>;

/** Шаг истории: дизайн до действия и сторона, на которой оно было сделано. */
interface Snapshot {
  layers: DesignLayer[];
  selectedLayerId: string | null;
  selectedGroup?: string | null;
  side: Side;
}

const HISTORY_LIMIT = 50;
/** Правки подряд с одним ключом (набор текста, протяжка палитры) склеиваются в один шаг. */
const MERGE_MS = 400;

/**
 * Как правка попадает в историю:
 * - 'commit' — отдельный шаг (конец перетаскивания, трансформации, выбор шрифта);
 * - 'merge'  — склеивается с предыдущей правкой того же поля, если пауза меньше MERGE_MS (ввод текста).
 */
export type HistoryMode = 'commit' | 'merge';

interface ConstructorState {
  garments: Garment[];
  garmentId: string | null;
  variantId: string | null;
  side: Side;
  layers: DesignLayer[];
  selectedLayerId: string | null;
  /** Выбран готовый принт целиком (группа слоёв); тогда selectedLayerId — null. */
  selectedGroup: string | null;
  method: PrintMethod;
  /**
   * Количество по размерам для каждого цвета (ключ — productId). Принт один, а размеры у каждого цвета свои:
   * в заявку идут все цвета текущей модели, по которым что-то набрано. Количество у цветов других моделей
   * сохраняется, чтобы при возврате к модели оно было на месте, но в заявку не идёт.
   */
  quantities: Record<string, SizeQuantities>;
  past: Snapshot[];
  future: Snapshot[];
  /** Растёт, когда загрузился шрифт: слои и цена перерисовываются с настоящими метриками. */
  fontTick: number;
  bumpFonts: () => void;

  setCatalog: (g: Garment[]) => void;
  /** Вернуть дизайн из черновика: изделие, цвет, слои, размеры. История начинается заново. */
  hydrate: (d: import('./draft').DraftState) => void;
  selectGarment: (id: string) => void;
  selectVariant: (productId: string) => void;
  setSide: (s: Side) => void;
  addImage: (img: NewImage) => void;
  addText: (fill: string, text?: string) => void;
  /** Заменить слои текущей стороны слоями шаблона одним шагом истории; слои других сторон не меняются, выбор снимается. */
  applyTemplate: (layers: Array<Omit<TextLayer, 'id' | 'side'> | Omit<ImageLayer, 'id' | 'side'>>) => void;
  updateLayer: (id: string, patch: Partial<DesignLayer>, mode?: HistoryMode) => void;
  /** Правка нескольких слоёв одним шагом истории (группа готового принта). */
  updateLayers: (patches: Record<string, Partial<DesignLayer>>) => void;
  /** Выбрать готовый принт целиком. */
  selectGroup: (group: string | null) => void;
  /** Удалить группу целиком / дублировать её / разъединить на отдельные слои. */
  removeGroup: (group: string) => void;
  duplicateGroup: (group: string) => void;
  ungroup: (group: string) => void;
  /** Заменить слои группы новыми на месте первого из них (новое слово «снимка в каждой букве»); набор склеивается. */
  replaceInGroup: (group: string, removeIds: string[], add: Array<Omit<ImageLayer, 'id' | 'side'>>) => void;
  removeLayer: (id: string) => void;
  /** Скрыть слой или показать снова; шаг истории. Скрытый слой с выбора снимается. */
  toggleHidden: (id: string) => void;
  /** Удалить все слои всех сторон одним шагом истории; изделие, цвет и размеры остаются. */
  clearAll: () => void;
  duplicateLayer: (id: string) => void;
  /** Поднять (+1) или опустить (−1) слой среди слоёв его стороны. */
  moveLayer: (id: string, dir: 1 | -1) => void;
  selectLayer: (id: string | null) => void;
  undo: () => void;
  redo: () => void;
  setMethod: (m: PrintMethod) => void;
  /** Количество размера у выбранного цвета. */
  setSizeQty: (size: string, qty: number) => void;
  /** Прибавить/убавить от текущего значения — безопасно при быстрых нажатиях. */
  incSize: (size: string, delta: number) => void;
  /** Взять размеры другого цвета для выбранного: только те, что есть у выбранного. */
  copySizes: (fromProductId: string) => void;
  /** Убрать цвет из заявки — обнулить его количество. */
  clearSizes: (productId: string) => void;
}

let lastMerge: { key: string; at: number } | null = null;

const snapshot = (s: ConstructorState): Snapshot => ({ layers: s.layers, selectedLayerId: s.selectedLayerId, selectedGroup: s.selectedGroup, side: s.side });

/** Запомнить текущий дизайн перед действием; новое действие сбрасывает «повтор». */
const record = (s: ConstructorState) => {
  lastMerge = null;
  return { past: [...s.past, snapshot(s)].slice(-HISTORY_LIMIT), future: [] as Snapshot[] };
};

export const useConstructor = create<ConstructorState>((set, get) => {
  /** Вернуть снимок из одной стопки истории, текущее состояние положить в другую. */
  const travel = (from: 'past' | 'future') => {
    const s = get();
    const stack = s[from];
    const target = stack[stack.length - 1];
    if (!target) return;
    lastMerge = null;
    const to = from === 'past' ? 'future' : 'past';
    // Показываем сторону, на которой было действие; если у текущей модели её нет — перед.
    const side = sidesFor(selectGarment(s)).includes(target.side) ? target.side : 'front';
    // В обратную стопку кладём текущий дизайн с той же стороной — повтор вернёт туда же.
    const current = { ...snapshot(s), side: target.side };
    set({
      layers: target.layers,
      selectedLayerId: target.layers.some((l) => l.id === target.selectedLayerId) ? target.selectedLayerId : null,
      selectedGroup: target.selectedGroup && target.layers.some((l) => l.group === target.selectedGroup) ? target.selectedGroup : null,
      side,
      [from]: stack.slice(0, -1),
      [to]: [...s[to], current],
    });
  };

  return {
    garments: [],
    garmentId: null,
    variantId: null,
    side: 'front',
    layers: [],
    selectedLayerId: null,
    selectedGroup: null,
    method: 'dtf',
    quantities: {},
    past: [],
    future: [],
    fontTick: 0,
    bumpFonts: () => set((s) => ({ fontTick: s.fontTick + 1 })),

    setCatalog: (garments) => {
      const first = garments[0];
      set({ garments, garmentId: first?.id ?? null, variantId: first?.variants[0]?.productId ?? null });
    },
    hydrate: (d) => {
      const g = get().garments.find((x) => x.id === d.garmentId) ?? selectGarment(get());
      const v = g?.variants.find((x) => x.productId === d.variantId) ?? g?.variants[0];
      const sideOk = sidesFor(g).includes(d.side);
      set({
        garmentId: g?.id ?? null,
        variantId: v?.productId ?? null,
        side: sideOk ? d.side : 'front',
        method: d.method,
        quantities: d.quantities,
        layers: d.layers,
        selectedLayerId: null,
        selectedGroup: null,
        past: [],
        future: [],
      });
      lastMerge = null;
    },
    // Дизайн при смене модели и цвета сохраняется — меняется только изделие под ним. В историю не входит.
    selectGarment: (id) => {
      const g = get().garments.find((x) => x.id === id) ?? null;
      const side = sidesFor(g).includes(get().side) ? get().side : 'front';
      // Открываем цвет, по которому уже что-то набрано, — иначе первый.
      const q = get().quantities;
      const v = g?.variants.find((x) => Object.values(q[x.productId] ?? {}).some((n) => n > 0)) ?? g?.variants[0];
      set({ garmentId: id, variantId: v?.productId ?? null, side });
    },
    // Размеры у каждого цвета свои: при смене цвета ничего не переносим, скопировать можно кнопкой (copySizes).
    selectVariant: (variantId) => set({ variantId }),
    setSide: (side) => set({ side, selectedLayerId: null, selectedGroup: null }),

    addImage: (img) => {
      const id = uid();
      set((s) => {
        const garment = selectGarment(s);
        // Новая картинка встаёт на грудь (на спине — под воротник), но целиком внутри зоны.
        const at = garment ? startPlace(printAreaFor(garment, s.side), s.side, img) : { x: (1 - img.width) / 2, y: 0.03, width: img.width };
        return {
          ...record(s),
          layers: [...s.layers, { ...img, id, kind: 'image', side: s.side, x: at.x, y: at.y, width: at.width, rotation: 0 }],
          selectedLayerId: id,
        };
      });
    },
    addText: (fill, text = 'Твой текст') => {
      const id = uid();
      const layer: TextLayer = {
        id, kind: 'text', side: get().side, text, fontFamily: DEFAULT_FONT, fontSize: 0.12,
        // у текста x/y — центр надписи
        fill, align: 'center', x: 0.5, y: textTop(get()), rotation: 0,
        bold: true, italic: false, lineHeight: 1.1, strokeWidth: 0, strokeColor: fill === '#ffffff' ? '#111111' : '#ffffff', arc: 0,
      };
      set((s) => ({ ...record(s), layers: [...s.layers, layer], selectedLayerId: id }));
    },
    applyTemplate: (layers) =>
      set((s) => {
        // Несколько слоёв шаблона — одна группа: принт двигается целиком.
        const group = layers.length > 1 ? uid() : undefined;
        return {
          ...record(s),
          layers: [
            ...s.layers.filter((l) => l.side !== s.side),
            ...layers.map((l) => ({ ...l, id: uid(), side: s.side, group }) as DesignLayer),
          ],
          selectedLayerId: null,
          selectedGroup: null,
        };
      }),
    updateLayers: (patches) =>
      set((s) => ({
        ...record(s),
        layers: s.layers.map((l) => (patches[l.id] ? ({ ...l, ...patches[l.id] } as DesignLayer) : l)),
      })),
    selectGroup: (selectedGroup) => set({ selectedGroup, selectedLayerId: null }),
    removeGroup: (group) =>
      set((s) => ({ ...record(s), layers: s.layers.filter((l) => l.group !== group), selectedLayerId: null, selectedGroup: null })),
    duplicateGroup: (group) =>
      set((s) => {
        const members = s.layers.filter((l) => l.group === group);
        if (!members.length) return {};
        const copyGroup = uid();
        const copies = members.map((l) => ({ ...l, id: uid(), group: copyGroup, x: l.x + 0.04, y: l.y + 0.04 }) as DesignLayer);
        // Копия — сразу за последним слоем исходной группы, тоже подряд.
        let last = -1;
        s.layers.forEach((l, n) => { if (l.group === group) last = n; });
        const layers = [...s.layers.slice(0, last + 1), ...copies, ...s.layers.slice(last + 1)];
        return { ...record(s), layers, selectedLayerId: null, selectedGroup: copyGroup };
      }),
    replaceInGroup: (group, removeIds, add) =>
      set((s) => {
        const at = s.layers.findIndex((l) => removeIds.includes(l.id));
        if (at < 0) return {};
        const key = `${group}:replace`;
        const now = Date.now();
        const history = lastMerge?.key === key && now - lastMerge.at < MERGE_MS * 3 ? {} : record(s);
        lastMerge = { key, at: now };
        const side = s.layers[at].side;
        const fresh = add.map((l) => ({ ...l, id: uid(), side, group }) as DesignLayer);
        const rest = s.layers.filter((l) => !removeIds.includes(l.id));
        const pos = s.layers.slice(0, at).filter((l) => !removeIds.includes(l.id)).length;
        return { ...history, layers: [...rest.slice(0, pos), ...fresh, ...rest.slice(pos)], selectedLayerId: null, selectedGroup: group };
      }),
    ungroup: (group) =>
      set((s) => ({
        ...record(s),
        layers: s.layers.map((l) => (l.group === group ? ({ ...l, group: undefined } as DesignLayer) : l)),
        selectedGroup: null,
      })),
    updateLayer: (id, patch, mode = 'commit') =>
      set((s) => {
        let history = {};
        if (mode === 'merge') {
          const key = `${id}:${Object.keys(patch).sort().join(',')}`;
          const now = Date.now();
          const continues = lastMerge?.key === key && now - lastMerge.at < MERGE_MS;
          if (!continues) history = record(s);
          lastMerge = { key, at: now };
        } else {
          history = record(s);
        }
        return { ...history, layers: s.layers.map((l) => (l.id === id ? ({ ...l, ...patch } as DesignLayer) : l)) };
      }),
    removeLayer: (id) =>
      set((s) => {
        const layers = s.layers.filter((l) => l.id !== id);
        return { ...record(s), layers, selectedLayerId: null, selectedGroup: null };
      }),
    toggleHidden: (id) =>
      set((s) => {
        const l = s.layers.find((x) => x.id === id);
        if (!l) return {};
        const hidden = !l.hidden;
        return {
          ...record(s),
          layers: s.layers.map((x) => (x.id === id ? ({ ...x, hidden: hidden || undefined } as DesignLayer) : x)),
          selectedLayerId: hidden && s.selectedLayerId === id ? null : s.selectedLayerId,
          // Выбран готовый принт, из которого скрыли слой: в нём должно остаться хотя бы два видимых слоя.
          selectedGroup: hidden && l.group && s.selectedGroup === l.group && s.layers.filter((x) => x.group === l.group && !x.hidden && x.id !== id).length < 2
            ? null : s.selectedGroup,
        };
      }),
    clearAll: () =>
      set((s) => (s.layers.length ? { ...record(s), layers: [], selectedLayerId: null, selectedGroup: null } : {})),
    duplicateLayer: (id) =>
      set((s) => {
        const i = s.layers.findIndex((l) => l.id === id);
        if (i < 0) return {};
        const src = s.layers[i];
        // Копия скрытого слоя — видимая: дублируют, чтобы её увидеть.
        const copy = { ...src, id: uid(), hidden: undefined, x: src.x + 0.04, y: src.y + 0.04 } as DesignLayer;
        const layers = [...s.layers.slice(0, i + 1), copy, ...s.layers.slice(i + 1)];
        return { ...record(s), layers, selectedLayerId: copy.id };
      }),
    moveLayer: (id, dir) =>
      set((s) => {
        const i = s.layers.findIndex((l) => l.id === id);
        if (i < 0) return {};
        // Соседний слой той же стороны в нужном направлении: слои других сторон порядок не задают.
        let j = i + dir;
        while (j >= 0 && j < s.layers.length && s.layers[j].side !== s.layers[i].side) j += dir;
        if (j < 0 || j >= s.layers.length) return {};
        const me = s.layers[i];
        const next = s.layers[j];
        // Внутри своей группы — обычный обмен местами.
        if (me.group && next.group === me.group) {
          const layers = [...s.layers];
          [layers[i], layers[j]] = [layers[j], layers[i]];
          return { ...record(s), layers };
        }
        // Слой выходит за край группы — он из неё выходит; чужую группу перепрыгивает целиком,
        // чтобы её слои остались подряд.
        let k = j;
        if (next.group) while (s.layers[k + dir]?.group === next.group) k += dir;
        const moved = (me.group ? { ...me, group: undefined } : me) as DesignLayer;
        const rest = s.layers.filter((_, n) => n !== i);
        const at = rest.indexOf(s.layers[k]) + (dir > 0 ? 1 : 0);
        return { ...record(s), layers: [...rest.slice(0, at), moved, ...rest.slice(at)] };
      }),
    // Скрытый слой выбрать нельзя: его нет на холсте.
    selectLayer: (selectedLayerId) =>
      set((s) => (selectedLayerId && s.layers.find((l) => l.id === selectedLayerId)?.hidden ? {} : { selectedLayerId, selectedGroup: null })),
    undo: () => travel('past'),
    redo: () => travel('future'),

    setMethod: (method) => set({ method }),
    setSizeQty: (size, qty) => set((s) => withSize(s, size, () => qty)),
    incSize: (size, delta) => set((s) => withSize(s, size, (cur) => cur + delta)),
    copySizes: (from) =>
      set((s) => {
        const v = selectVariant(s);
        if (!v) return {};
        const src = s.quantities[from] ?? {};
        const sizes = Object.fromEntries(v.sizes.filter((k) => (src[k] ?? 0) > 0).map((k) => [k, src[k]]));
        return { quantities: { ...s.quantities, [v.productId]: sizes } };
      }),
    clearSizes: (productId) =>
      set((s) => {
        const quantities = { ...s.quantities };
        delete quantities[productId];
        return { quantities };
      }),
  };
});

/** Новое количество размера у выбранного цвета: целое 0…999. */
function withSize(s: ConstructorState, size: string, next: (cur: number) => number) {
  if (!s.variantId) return {};
  const cur = s.quantities[s.variantId] ?? {};
  const qty = Math.max(0, Math.min(999, Math.round(next(cur[size] ?? 0)) || 0));
  return { quantities: { ...s.quantities, [s.variantId]: { ...cur, [size]: qty } } };
}

const NO_SIZES: SizeQuantities = {};

/** Удобные селекторы. */
/** Центр нового текста по вертикали: у верха места нанесения, где встаёт картинка (у текста x/y — центр надписи). */
function textTop(s: ConstructorState) {
  const garment = selectGarment(s);
  const pa = garment && printAreaFor(garment, s.side);
  if (s.side === 'pocket') return 0.5;
  return pa && pa.collar ? startTop(pa, s.side) + 0.05 : 0.12;
}

export function selectGarment(s: Pick<ConstructorState, 'garments' | 'garmentId'>) {
  return s.garments.find((g) => g.id === s.garmentId) ?? null;
}
export const selectVariant = (s: ConstructorState) =>
  selectGarment(s)?.variants.find((v) => v.productId === s.variantId) ?? null;
/** Количество по размерам у выбранного цвета. */
export const selectSizes = (s: ConstructorState) => (s.variantId && s.quantities[s.variantId]) || NO_SIZES;
/** Сколько штук набрано у цвета — только по размерам, которые у него есть. */
export const variantQty = (q: Record<string, SizeQuantities>, v: { productId: string; sizes: string[] }) =>
  v.sizes.reduce((sum, k) => sum + (q[v.productId]?.[k] ?? 0), 0);
/** Видимые слои, выходящие за зону печати (см. model/overflow): пока они есть, заявку оформить нельзя. */
export { overflowingLayers } from './overflow';
export { sideHasLayers, visibleLayers } from './visibility';
export const canUndo = (s: ConstructorState) => s.past.length > 0;
export const canRedo = (s: ConstructorState) => s.future.length > 0;
