'use client';
import { useEffect, useLayoutEffect, useReducer, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import type Konva from 'konva';
import type { DesignLayer } from '../model/types';
import c from './controls.module.css';
import { centerOf, keepCenter, localRect, minScale, snapRotation, type Pt } from './gestures';
import { DESIGN_NODE } from './LayerNode';
import { GROUP_ID } from './group';

/**
 * Кнопки выбранного слоя поверх холста: поворот (сверху, на «ножке»), размер (правый нижний угол),
 * удаление (правый верхний угол), дубль (левый верхний угол). Это HTML, а не узлы Konva: кнопки крупные, с иконками,
 * не поворачиваются вместе с принтом и не попадают ни в превью, ни в файл печати.
 * Пока кнопку тянут, меняется только узел холста; в стор правка уходит одним шагом при отпускании.
 */

/** Сенсорный экран: ножка короче; кнопки те же 32 px, область нажатия растянута до 44 px в CSS. */
const COARSE = typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;
/** Размер кнопки, px — как в controls.module.css. */
const BTN = 32;
/** Длина «ножки» от верхнего края принта до центра кнопки поворота, px. */
const STEM = COARSE ? 44 : 48;
/** Угловые кнопки вынесены наружу на столько по каждой оси — не закрывают принт и не налезают друг на друга. */
const OUT = BTN / 2 + 2;
/** Половина размера подписи «см · формат» для проверки наложения, px (оценка с запасом). */
const LABEL_HALF = { w: 62, h: 11 };

interface Props {
  stage: Konva.Stage | null;
  layer: DesignLayer | undefined;
  /** Размер зоны печати в пикселях холста (без приближения). */
  area: { w: number; h: number };
  /** Размер холста — кнопки не выходят за его края. */
  size: { w: number; h: number };
  /** Меньше этого размера (px экрана) принт не сжимается. */
  minPx: number;
  /** Цвет «ножки» — контрастный к ткани. */
  accent: string;
  /** Подпись под рамкой: размер принта и формат. */
  caption?: string;
  onCommit: (patch: Partial<DesignLayer>) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  /** Кадрировать картинку; без пропа кнопки нет (левый нижний угол). */
  onCrop?: () => void;
  /** Выбран готовый принт целиком: id группы; тогда layer не задан, а правка уходит в onCommitGroup. */
  group?: string;
  onCommitGroup?: (node: Konva.Node) => void;
}

interface Geo { top: Pt; rotate: Pt; resize: Pt; remove: Pt; duplicate: Pt; crop: Pt; label: Pt }

type Gesture =
  | { mode: 'rotate'; center: Pt; startAngle: number; rotation0: number }
  | { mode: 'resize'; center: Pt; dist0: number };

const deg = (rad: number) => (rad * 180) / Math.PI;

function geometry(node: Konva.Node, size: { w: number; h: number }): Geo {
  const t = node.getAbsoluteTransform();
  // Прямоугольник узла в его осях: у группы готового принта начало не в нуле.
  const { x: x0, y: y0, width: w, height: h } = localRect(node);
  const top = t.point({ x: x0 + w / 2, y: y0 });
  // Смещения считаются в осях принта и поворачиваются вместе с ним.
  const a = (node.getAbsoluteRotation() * Math.PI) / 180;
  const turn = (p: Pt, dx: number, dy: number): Pt => ({
    x: p.x + dx * Math.cos(a) - dy * Math.sin(a),
    y: p.y + dx * Math.sin(a) + dy * Math.cos(a),
  });
  const clamp = (p: Pt): Pt => ({
    x: Math.min(size.w - BTN / 2, Math.max(BTN / 2, p.x)),
    y: Math.min(size.h - BTN / 2, Math.max(BTN / 2, p.y)),
  });
  const box = node.getClientRect({ skipShadow: true, skipStroke: true });
  const resize = clamp(turn(t.point({ x: x0 + w, y: y0 + h }), OUT, OUT));
  // Бейдж — под кнопкой размера, а не под самим принтом: на узком рукаве он иначе налезал бы на неё.
  const below = Math.max(box.y + box.height + 12, resize.y + BTN / 2 + 8);
  const rotate = clamp(turn(top, 0, -STEM));
  const remove = clamp(turn(t.point({ x: x0 + w, y: y0 }), OUT, -OUT));
  const duplicate = clamp(turn(t.point({ x: x0, y: y0 }), -OUT, -OUT));
  // Подпись не должна закрывать соседний принт: если снизу она на него ложится, ставим её над кнопками сверху.
  const lx = Math.min(size.w - 40, Math.max(40, box.x + box.width / 2));
  const above = Math.min(box.y, rotate.y - BTN / 2, remove.y - BTN / 2, duplicate.y - BTN / 2) - 12;
  const others = (node.getStage()?.find(`.${DESIGN_NODE}`) ?? []).filter((n) => n !== node && n.isVisible() && !(node.getType() === 'Group' && (node as Konva.Container).isAncestorOf(n)))
    .map((n) => n.getClientRect({ skipShadow: true, skipStroke: true }));
  const hits = (y: number) => others.some((r) =>
    r.x < lx + LABEL_HALF.w && r.x + r.width > lx - LABEL_HALF.w && r.y < y + LABEL_HALF.h && r.y + r.height > y - LABEL_HALF.h);
  const ly = hits(below) && above >= 14 && !hits(above) ? above : Math.min(size.h - 14, below);
  return {
    top,
    label: { x: lx, y: ly },
    rotate,
    resize,
    remove,
    duplicate,
    crop: clamp(turn(t.point({ x: x0, y: y0 + h }), -OUT, OUT)),
  };
}

const same = (a: Geo | null, b: Geo | null) => JSON.stringify(a) === JSON.stringify(b);

export function SelectionControls({ stage, layer, area, size, minPx, accent, caption, onCommit, onRemove, onDuplicate, onCrop, group, onCommitGroup }: Props) {
  const targetId = group ? `${GROUP_ID}${group}` : layer?.id;
  const [geo, setGeo] = useState<Geo | null>(null);
  const [, bump] = useReducer((n: number) => n + 1, 0);
  const gesture = useRef<Gesture | null>(null);
  const node = targetId && stage ? stage.findOne(`#${targetId}`) : undefined;

  // Холст обновляется в эффекте Stage (он выше в дереве) — здесь узел уже на месте.
  // Без списка зависимостей намеренно: узел меняется вне React. Цикла нет — setGeo только при изменении.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useLayoutEffect(() => {
    // Узел ищем заново: новый слой мог появиться на холсте уже после рендера этого компонента.
    const n = targetId && stage ? stage.findOne(`#${targetId}`) : undefined;
    const next = n && n.isVisible() ? geometry(n, size) : null;
    if (!same(next, geo)) setGeo(next);
    // Слой выбран, а узла ещё нет — проверим снова чуть позже.
    if (targetId && !n) {
      const t = setTimeout(bump, 50);
      return () => clearTimeout(t);
    }
  });

  // Перетаскивание самого принта и жест двумя пальцами двигают и кнопки.
  useEffect(() => {
    if (!node) return;
    node.on('dragmove.controls dragend.controls pinch.controls', bump);
    return () => { node.off('.controls'); };
  }, [node]);

  if (!targetId || !node || !geo) return null;

  const pointer = (e: ReactPointerEvent): Pt => {
    const r = stage!.container().getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const start = (mode: Gesture['mode']) => (e: ReactPointerEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    try { e.currentTarget.setPointerCapture(e.pointerId); } catch { /* указатель уже отпущен */ }
    const center = centerOf(node);
    const p = pointer(e);
    gesture.current = mode === 'rotate'
      ? { mode, center, startAngle: deg(Math.atan2(p.y - center.y, p.x - center.x)), rotation0: node.rotation() }
      : { mode, center, dist0: Math.max(1, Math.hypot(p.x - center.x, p.y - center.y)) };
  };

  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const g = gesture.current;
    if (!g) return;
    const p = pointer(e);
    if (g.mode === 'rotate') {
      let r = g.rotation0 + deg(Math.atan2(p.y - g.center.y, p.x - g.center.x)) - g.startAngle;
      node.rotation(snapRotation(r));
    } else {
      const k = Math.hypot(p.x - g.center.x, p.y - g.center.y) / g.dist0;
      // Не меньше minPx на экране по обеим сторонам.
      const s = Math.max(k, minScale(node, minPx));
      node.scale({ x: s, y: s });
    }
    keepCenter(node, g.center);
    node.getLayer()?.batchDraw();
    bump();
  };

  const end = () => {
    const g = gesture.current;
    if (!g) return;
    gesture.current = null;
    if (group) { onCommitGroup?.(node); return; }
    if (!layer) return;
    const sx = node.scaleX();
    node.scale({ x: 1, y: 1 });
    const base = { x: node.x() / area.w, y: node.y() / area.h, rotation: node.rotation() };
    if (g.mode === 'rotate') return onCommit(base);
    onCommit(layer.kind === 'image' ? { ...base, width: (node.width() * sx) / area.w } : { ...base, fontSize: layer.fontSize * sx });
  };

  // Кнопка центрируется на точке через CSS (translate -50%).
  const at = (p: Pt) => ({ left: p.x, top: p.y });
  const handlers = (mode: Gesture['mode']) => ({
    onPointerDown: start(mode), onPointerMove: move, onPointerUp: end, onPointerCancel: end,
  });

  return (
    <div className={c.overlay}>
      <svg className={c.stem} width={size.w} height={size.h} aria-hidden>
        <line x1={geo.top.x} y1={geo.top.y} x2={geo.rotate.x} y2={geo.rotate.y} stroke={accent} />
      </svg>
      {caption && <div className={c.caption} style={at(geo.label)}>{caption}</div>}
      <button type="button" className={c.btn} style={at(geo.rotate)} aria-label="Повернуть" title="Повернуть" {...handlers('rotate')}>
        <svg viewBox="0 0 24 24" aria-hidden><path d="M21 12a9 9 0 1 1-2.64-6.36L21 8" /><path d="M21 3v5h-5" /></svg>
      </button>
      <button type="button" className={c.btnAccent} style={at(geo.resize)} aria-label="Изменить размер" title="Изменить размер" {...handlers('resize')}>
        <svg viewBox="0 0 24 24" aria-hidden><path d="M5 5 19 19M5 5h5M5 5v5M14 19h5M19 19v-5" /></svg>
      </button>
      <button
        type="button" className={c.btn} style={at(geo.duplicate)} aria-label="Дублировать" title="Дублировать"
        onPointerDown={(e) => e.stopPropagation()} onClick={onDuplicate}
      >
        <svg viewBox="0 0 24 24" aria-hidden><rect x="8" y="8" width="12" height="12" rx="2" /><path d="M16 8V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h2" /></svg>
      </button>
      {onCrop && (
        <button
          type="button" className={c.btn} style={at(geo.crop)} aria-label="Кадрировать" title="Кадрировать"
          onPointerDown={(e) => e.stopPropagation()} onClick={onCrop}
        >
          <svg viewBox="0 0 24 24" aria-hidden><path d="M6 2v12a4 4 0 0 0 4 4h12M2 6h12a4 4 0 0 1 4 4v12" /></svg>
        </button>
      )}
      <button
        type="button" className={c.btnDanger} style={at(geo.remove)} aria-label="Удалить" title="Удалить"
        onPointerDown={(e) => e.stopPropagation()} onClick={onRemove}
      >
        <svg viewBox="0 0 24 24" aria-hidden><path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13M10 11v6M14 11v6" /></svg>
      </button>
    </div>
  );
}
