'use client';
import { useEffect, useImperativeHandle, useLayoutEffect, useRef, useState, type Dispatch, type RefObject, type SetStateAction } from 'react';
import { Group, Image as KImage, Layer, Line, Path, Rect, Stage, Transformer } from 'react-konva';
import type Konva from 'konva';
import { appearNode } from './appear';
import { FRAME, SHAPES } from '../config/garment-shapes';
import { MAX_USER_ZOOM } from './zoom';
import { printAreaFor } from '../config/print-areas';
import { priceListFor } from '../config/pricing';
import { layerSizeCm } from '../model/bounds';
import { formatFor } from '../model/pricing';
import { fontReady } from '../model/fonts';
import { selectGarment, selectVariant, useConstructor } from '../model/store';
import { isSleeve, type DesignLayer, type PlaceSpot, type Side } from '../model/types';
import { alignLayer, placeAt, snapToCenter, type AlignMode } from './align';
import { placeRect } from '../model/placement';
import { DESIGN_NODE, LayerNode } from './LayerNode';
import { commitGroup, DESIGN_GROUP, GROUP_ID, runs } from './group';
import { SelectionControls } from './SelectionControls';
import { startPinch, type Pt } from './gestures';
import c from './controls.module.css';
import { SILHOUETTES, SILHOUETTE_VIEWBOX } from './silhouettes';
import { isLight, prefetchTints, zoneTone, useTintedMockup } from './tint';
import { EmptyZone, ZoneBadge } from './EmptyZone';
import { isHalfTurn, playTurn, prefersReducedMotion, sameView, turnSign } from './turn';
import KonvaLib from 'konva';
import type { PrintSize, PrintText } from '../pdf/printVectorPdf';

// Холст на экране — не плотнее 2×: на iPhone (3×) каждая перерисовка при повороте и жестах в 2,25 раза тяжелее,
// а разницы на глаз нет. Превью и файл печати задают pixelRatio явно и от этого не зависят.
if (typeof window !== 'undefined') KonvaLib.pixelRatio = Math.min(2, window.devicePixelRatio || 1);

export interface DesignStageHandle {
  /** PNG текущей стороны с изделием — превью для клиента и менеджера. */
  exportPreview: () => string | null;
  /**
   * PNG принта (без изделия, прозрачный фон), обрезанный по габариту рисунка: 300 dpi,
   * для принтов почти во всю большую зону — меньше, чтобы файл уложился в предел размера canvas.
   */
  exportPrint: () => { dataUrl: string; dpi: number; size: PrintSize; art: string | null; texts: PrintText[] } | null;
  /** Ждёт, пока холст покажет текущую сторону целиком: мокап и все картинки слоёв загружены. */
  whenReady: (timeoutMs?: number) => Promise<void>;
  /** Выровнять слой в зоне печати (одним шагом истории). */
  align: (id: string, mode: AlignMode) => void;
  /** Поставить слой или готовый принт (id группы) на стандартное место нанесения; одним шагом истории. */
  place: (id: string, spot: PlaceSpot) => void;
  /** Без анимации поворота — на время программного перебора сторон (снимки для заявки). */
  setTurnEnabled: (on: boolean) => void;
}

const DPI = 300;
/** Предел площади canvas в мобильных браузерах — около 16,7 Мп; больше — снимок выйдет пустым. */
const MAX_EXPORT_AREA = 16_000_000;
/** Меньше этого размера (px экрана) кнопка размера слой не сжимает. */
const MIN_NODE_PX = 12;
/**
 * Автоприближение к зоне рукава (вид сбоку) выводится из размера зоны: зона занимает ~SLEEVE_FILL холста,
 * но не больше MAX_ZOOM. Зоны крупные, поэтому приближение ≈ 1–1,1 (изделие почти целиком), а у футболок
 * (крупный план рукава) — 1. Мокапы 1200×1380: на таком приближении картинка остаётся чёткой на ретине.
 */
const MAX_ZOOM = 1.3;
const SLEEVE_FILL = 0.5;
/** Предел приближения кнопками (вместе с приближением рукава) и шаг одного нажатия. */
const MAX_TOTAL_ZOOM = 4;
/**
 * Фокус на выбранном принте (редактирование слоя на телефоне): ширина зоны печати — FOCUS_FILL ширины холста,
 * по высоте камера встаёт на принт. Поля: сверху FOCUS_TOP px под кнопки слоя (поворот, дубль, удалить),
 * снизу FOCUS_BOTTOM. Приближение не больше FOCUS_MAX; вид можно сдвинуть пальцем по фону.
 */
const FOCUS_FILL = 0.94;
const FOCUS_TOP = 48;
const FOCUS_BOTTOM = 14;
const FOCUS_MAX = 3;
/** Длительность наезда/отъезда камеры при входе в фокус и выходе из него, мс. */
const FOCUS_MS = 520;

/** Порог прилипания к центру зоны, в пикселях экрана. */
const SNAP_PX = 6;
/** Фирменный лайм; на светлой ткани он не виден, поэтому рамка и направляющие там чёрные. */
const LIME = '#b4fb53';
const INK = '#000000';

/** apiRef — обычный проп, а не ref: next/dynamic не пробрасывает ref в ленивый компонент. */
export function DesignStage({ apiRef, empty, zoom: zoomProp, onZoom, focus = false, onCrop }: {
  apiRef: RefObject<DesignStageHandle>;
  /** Масштаб, которым управляет родитель (кнопки вне холста). Без него — внутреннее состояние. */
  zoom?: number;
  onZoom?: Dispatch<SetStateAction<number>>;
  /** Действия приглашения на пустой стороне: загрузить картинку / добавить текст. */
  empty?: { onUpload: () => void; dragging?: boolean };
  /** Приблизить холст к зоне печати (пока редактируют слой); переход — плавный. */
  focus?: boolean;
  /** Открыть кадрирование картинки (id слоя) — кнопка в рамке выделения. */
  onCrop?: (id: string) => void;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  const printRef = useRef<Konva.Group>(null);
  const shadeRef = useRef<Konva.Image>(null);
  const guideRef = useRef<Konva.Group>(null);
  const trRef = useRef<Konva.Transformer>(null);
  const vpRef = useRef<HTMLDivElement>(null);
  // Жест двумя пальцами: касания, активность и слой, у которого на время жеста отключено перетаскивание.
  const touches = useRef(new Map<number, Pt>());
  const pinch = useRef<{ update: (a: Pt, b: Pt) => void; ids: [number, number]; id: string } | null>(null);
  const pinchBusy = useRef(false);
  const pinchCtx = useRef<{ area: { w: number; h: number } | null; layer: DesignLayer | undefined; group: string | null; members: DesignLayer[] }>({ area: null, layer: undefined, group: null, members: [] });
  // Перетаскивание узлов до жеста двумя пальцами — после жеста возвращаем как было (у слоёв группы оно выключено).
  const dragState = useRef(new Map<Konva.Node, boolean>());
  // size — кадр изделия (пропорции 400×460), box — весь холст: на телефоне он шире кадра,
  // и в приближении изделие заполняет всю ширину, а не обрезается по краям кадра.
  const [size, setSize] = useState({ w: 400, h: 460 });
  const [box, setBox] = useState({ w: 400, h: 460 });
  const [zoomInner, setZoomInner] = useState(1);
  const zoom = zoomProp ?? zoomInner;
  const setZoom = onZoom ?? setZoomInner;
  const [guides, setGuides] = useState({ v: false, h: false });
  // Поворот при смене стороны: снимок прежней стороны (canvas) и куда поворачиваемся.
  const [turn, setTurn] = useState<{ id: number; snap: HTMLCanvasElement; from: Side; to: Side } | null>(null);
  const turnRef = useRef<HTMLDivElement>(null);
  const turnEnabled = useRef(true);
  // Смена цвета: снимок прежнего кадра растворяется поверх нового (силуэт тот же).
  // Смена изделия (swap): силуэты разные, наложение даёт «двойное» изделие — поэтому прежний кадр
  // сначала гаснет, и только потом проявляется новый.
  const [fade, setFade] = useState<{ id: number; snap: HTMLCanvasElement; base: unknown; swap: boolean } | null>(null);
  const fadeRef = useRef<HTMLDivElement>(null);
  // Появление новых слоёв: id, которые уже встречались (отмена/повтор/черновик не в счёт), ожидающие и идущие.
  const seenIds = useRef(new Set<string>());
  const pendingNew = useRef(new Set<string>());
  const appearing = useRef(new Map<string, { finish: () => void }>());
  // Сдвиг вида пользователем (px экрана) относительно центрирования на зоне; сбрасывается при смене стороны, модели и масштаба.
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const panRef = useRef(pan);
  panRef.current = pan;
  const panLimits = useRef({ bx: 0, by: 0, minX: 0, maxX: 0, minY: 0, maxY: 0, k: 1 });
  const exportView = useRef({ k: 1, x: 0, y: 0, rect: { x: 0, y: 0, width: 400, height: 460 } });
  const baseView = useRef({ x: 0, y: 0 });

  const garment = useConstructor(selectGarment);
  const garmentId = garment?.id;
  const variant = useConstructor(selectVariant);
  const { method, side, layers, selectedLayerId, selectLayer, updateLayer, removeLayer, duplicateLayer } = useConstructor();
  const { selectedGroup, selectGroup, updateLayers, removeGroup, duplicateGroup } = useConstructor();
  // Было ли принт-группа уже выбрана до этого нажатия: второе нажатие по её слою выбирает сам слой.
  const groupWasSelected = useRef(false);

  const shape = garment?.shapeId ? SHAPES[garment.shapeId] : null;
  const hex = variant?.hex ?? '#e4e4e4';
  const mockup = useTintedMockup(shape?.images[side] ?? null, hex);
  // Текущая сторона готова — остальные стороны в этом цвете готовим заранее, чтобы поворот не ждал.
  const mockupReady = !!mockup && mockup.url === shape?.images[side];
  useEffect(() => {
    if (!mockupReady || !shape) return;
    return prefetchTints(Object.values(shape.images).filter((u): u is string => !!u && u !== shape.images[side]), hex);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mockupReady, shape, hex]);
  const light = isLight(hex);
  const accent = light ? INK : LIME;

  // Сторона меняется в сторе синхронно, до перерисовки: в этот момент холст ещё показывает прежнюю сторону —
  // снимаем её для анимации поворота.
  useEffect(() => useConstructor.subscribe((st, prev) => {
    if (st.side === prev.side || sameView(st.side, prev.side) || st.garmentId !== prev.garmentId || !turnEnabled.current || prefersReducedMotion()) return;
    const stage = stageRef.current;
    if (!stage || !stage.width()) return;
    settleAppear();
    const hidden = ([guideRef.current, trRef.current] as Array<Konva.Node | null>).filter((n): n is Konva.Node => !!n && n.visible());
    hidden.forEach((n) => n.visible(false));
    let snap: HTMLCanvasElement;
    try { snap = stage.toCanvas({ pixelRatio: Math.min(2, window.devicePixelRatio || 1) }); } finally { hidden.forEach((n) => n.visible(true)); }
    setTurn({ id: Date.now(), snap, from: prev.side, to: st.side });
  }), []);

  useLayoutEffect(() => {
    const holder = turnRef.current;
    const content = stageRef.current?.content;
    if (!turn || !holder || !content) return;
    turn.snap.style.width = '100%';
    turn.snap.style.height = '100%';
    holder.replaceChildren(turn.snap);
    const anim = playTurn(holder, content, turnSign(turn.from, turn.to), isHalfTurn(turn.from, turn.to), {
      ready: () => isReady.current(),
      draw: () => stageRef.current?.draw(),
    });
    let alive = true;
    anim.finished.then(() => alive && setTurn((t) => (t?.id === turn.id ? null : t))).catch(() => {});
    return () => { alive = false; anim.cancel(); };
  }, [turn]);

  /** Доводит идущие появления слоёв до конца: снимки и экспорт не должны застать полупрозрачный слой. */
  const settleAppear = () => { [...appearing.current.values()].forEach((a) => a.finish()); };

  // Новый слой (добавлен, а не восстановлен отменой/повтором или черновиком) появляется плавно.
  useEffect(() => {
    useConstructor.getState().layers.forEach((l) => seenIds.current.add(l.id));
    return useConstructor.subscribe((st, prev) => {
      const added = st.layers.length === prev.layers.length + 1 && st.past.length === prev.past.length + 1
        ? st.layers.find((l) => !seenIds.current.has(l.id))
        : undefined;
      st.layers.forEach((l) => seenIds.current.add(l.id));
      if (added && added.side === st.side && !prefersReducedMotion()) pendingNew.current.add(added.id);
    });
  }, []);

  useLayoutEffect(() => {
    const g = printRef.current;
    if (!g || !pendingNew.current.size) return;
    for (const id of [...pendingNew.current]) {
      const node = g.findOne(`#${id}`);
      if (!node) continue;
      pendingNew.current.delete(id);
      const layer = useConstructor.getState().layers.find((l) => l.id === id);
      const ready = () => {
        if (!layer) return true;
        if (layer.kind === 'text') return fontReady(layer.fontFamily, layer.bold, layer.italic, layer.text);
        return !!(node as Konva.Image).image();
      };
      appearing.current.set(id, appearNode(node, ready, () => appearing.current.delete(id)));
    }
  });

  // Смена изделия или цвета: снимок прежнего кадра, как только стор поменялся (холст ещё старый).
  const mockupRef = useRef<unknown>(null);
  useEffect(() => useConstructor.subscribe((st, prev) => {
    if ((st.garmentId === prev.garmentId && st.variantId === prev.variantId) || !turnEnabled.current || prefersReducedMotion()) return;
    const stage = stageRef.current;
    if (!stage || !stage.width() || !prev.garmentId) return;
    settleAppear();
    const hidden = ([guideRef.current, trRef.current] as Array<Konva.Node | null>).filter((n): n is Konva.Node => !!n && n.visible());
    hidden.forEach((n) => n.visible(false));
    let snap: HTMLCanvasElement;
    try { snap = stage.toCanvas({ pixelRatio: Math.min(2, window.devicePixelRatio || 1) }); } finally { hidden.forEach((n) => n.visible(true)); }
    setFade({ id: Date.now(), snap, base: mockupRef.current, swap: st.garmentId !== prev.garmentId });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), []);

  const fadeReady = useRef<(base: unknown) => boolean>(() => true);
  useLayoutEffect(() => {
    const holder = fadeRef.current;
    if (!fade || !holder) return;
    fade.snap.style.width = '100%';
    fade.snap.style.height = '100%';
    holder.replaceChildren(fade.snap);
    // Новое изделие не показываем под снимком прежнего: оно проявится, когда снимок погаснет.
    const content = fade.swap ? stageRef.current?.content : undefined;
    if (content) content.style.opacity = '0';
    let alive = true;
    let anim: Animation | null = null;
    let timer = 0;
    const started = Date.now();
    const done = () => alive && setFade((f) => (f?.id === fade.id ? null : f));
    const go = () => {
      if (!alive) return;
      stageRef.current?.draw();
      // Дать браузеру показать новый кадр под снимком, затем растворить снимок.
      timer = window.setTimeout(() => {
        if (!alive) return;
        anim = holder.animate([{ opacity: 1 }, { opacity: 0 }], { duration: content ? 200 : 400, easing: 'cubic-bezier(.3,.1,.3,1)', fill: 'forwards' });
        anim.finished.then(() => {
          if (!alive) return;
          if (content) {
            content.style.opacity = '';
            content.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 260, easing: 'cubic-bezier(.25,.8,.25,1)' });
          }
          done();
        }, () => {});
      }, 50);
    };
    const wait = () => {
      if (!alive) return;
      if (fadeReady.current(fade.base) || Date.now() - started > 800) go();
      else timer = window.setTimeout(wait, 30);
    };
    wait();
    // Страховка: фоновая вкладка не гонит анимации — снимок не должен зависнуть.
    const guard = window.setTimeout(done, 2500);
    return () => {
      alive = false; clearTimeout(timer); clearTimeout(guard); anim?.cancel();
      if (content) content.style.opacity = '';
    };
  }, [fade]);

  // Холст тянется по контейнеру с пропорциями кадра 400×460.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => {
      const { width, height } = e.contentRect;
      const ratio = FRAME.h / FRAME.w;
      // Нижний предел небольшой: над экранной клавиатурой холст ужимается сильно.
      const w = Math.max(120, Math.min(width, height / ratio));
      setSize({ w, h: w * ratio });
      setBox({ w: Math.max(w, width), h: Math.max(w * ratio, height) });
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pa = garment ? printAreaFor(garment, side) : null;
  // Контур зоны в пикселях холста относительно её левого верхнего угла (прямоугольник, если контура нет).
  const outlinePts = pa
    ? (pa.outline && pa.outline.length >= 3 ? pa.outline : [[0, 0], [1, 0], [1, 1], [0, 1]]).map(([px, py]) => [px * pa.width * size.w, py * pa.height * size.h])
    : [];
  const hasOutline = !!pa?.outline && pa.outline.length >= 3;
  // Печатаемые части зоны: у зоны из нескольких частей (половины зип-худи по молнии) — каждая отдельно, иначе весь контур.
  const partsPx = pa?.parts?.length ? pa.parts.map((part) => part.map(([px, py]) => [px * pa.width * size.w, py * pa.height * size.h])) : [outlinePts];
  /** Обрезка слоёв по печатаемым частям зоны (координаты группы печати). */
  const clipOutline = (ctx: Konva.Context) => {
    ctx.beginPath();
    for (const part of partsPx) {
      part.forEach(([px, py], i) => (i ? ctx.lineTo(px, py) : ctx.moveTo(px, py)));
      ctx.closePath();
    }
  };
  const area = pa ? { x: pa.x * size.w, y: pa.y * size.h, w: pa.width * size.w, h: pa.height * size.h } : null;
  // Приближение — на время просмотра одной стороны: при смене стороны и модели возвращаем 100%.
  useEffect(() => setZoom(1), [side, garmentId, setZoom]);
  // Фокус — на конкретном слое: выбор другого слоя тоже плавно переводит камеру.
  // Камера едет, только когда палец/кнопка отпущены: схватил принт и сразу тащишь — вид не уезжает из-под пальца.
  const [pressing, setPressing] = useState(false);
  useEffect(() => {
    // После отпускания — на следующей задаче: конец перетаскивания (mouseup/touchend) успевает записать слой.
    const up = () => { window.setTimeout(() => setPressing(false), 0); };
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => { window.removeEventListener('pointerup', up); window.removeEventListener('pointercancel', up); };
  }, []);
  const focusLatch = useRef<string | null>(null);
  if (!focus || !selectedLayerId) focusLatch.current = null;
  else if (!pressing) focusLatch.current = selectedLayerId;
  const focusKey = focusLatch.current;
  const focusOn = focusKey !== null;
  useEffect(() => setPan({ x: 0, y: 0 }), [side, garmentId, zoom, focusKey]);

  // Плавный переход камеры при смене фокуса: от того, что было на экране, к новому виду.
  // Точку старта берём до первого кадра с новым фокусом; новый вид пересчитывается каждый кадр —
  // холст в это время может менять размер.
  const fromView = useRef<{ k: number; x: number; y: number; t0: number } | null>(null);
  const shownView = useRef({ k: 1, x: 0, y: 0 });
  const prevFocus = useRef(focusKey);
  if (prevFocus.current !== focusKey) {
    prevFocus.current = focusKey;
    fromView.current = prefersReducedMotion() ? null : { ...shownView.current, t0: performance.now() };
  }
  const [, setFrame] = useState(0);
  useEffect(() => {
    if (!fromView.current) return;
    let raf = 0;
    const step = () => {
      const f = fromView.current;
      if (!f) return;
      if (performance.now() - f.t0 >= FOCUS_MS) fromView.current = null;
      setFrame((n) => n + 1);
      if (fromView.current) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [focusKey]);

  // Скрытые слои на холст не попадают: ни в рисунок, ни в выбор, ни в снимки.
  const sideLayers = layers.filter((l) => l.side === side && !l.hidden);

  // Подпись под выделенным принтом: «26 × 5 см · A4».
  const selectedLayer = sideLayers.find((l) => l.id === selectedLayerId);
  // Группы готовых принтов на этой стороне: в группе должно остаться хотя бы два слоя.
  const groupSize = new Map<string, number>();
  for (const l of sideLayers) if (l.group) groupSize.set(l.group, (groupSize.get(l.group) ?? 0) + 1);
  const groupOf = (l: DesignLayer) => (l.group && (groupSize.get(l.group) ?? 0) > 1 ? l.group : undefined);
  const activeGroup = selectedGroup && (groupSize.get(selectedGroup) ?? 0) > 1 ? selectedGroup : null;
  const groupMembers = activeGroup ? sideLayers.filter((l) => l.group === activeGroup) : [];
  const fmt = (n: number) => (Math.round(n * 10) / 10).toLocaleString('ru-RU');
  let caption: string | undefined;
  if (garment && (selectedLayer || groupMembers.length)) {
    const sz = layerSizeCm(garment, selectedLayer ?? groupMembers);
    if (sz) {
      const { format, oversize } = formatFor(sz.wCm, sz.hCm, priceListFor(method));
      caption = `${fmt(sz.wCm)} × ${fmt(sz.hCm)} см · ${oversize ? `больше ${format.name}` : format.name}`;
    }
  }

  pinchCtx.current = { area: area ? { w: area.w, h: area.h } : null, layer: selectedLayer, group: activeGroup, members: groupMembers };

  // Размер зоны печати в см для плашки: до 10 см — с десятыми, дальше — целые.
  const zoneFmt = (n: number) => (n < 10 ? fmt(n) : String(Math.round(n)));
  const zoneText = pa && area ? `${zoneFmt(pa.widthCm)} × ${zoneFmt(pa.widthCm * (area.h / area.w))} см` : undefined;
  const isEmptyZone = sideLayers.length === 0;
  // Рамка зоны еле заметна, пока слой не выбран; у пустой зоны её нет — только заливка.
  const frameStrong = !!selectedLayer;

  // Рукав — маленькая зона: приближаем холст к ней, не выходя за края кадра.
  // Кнопки масштаба умножают это приближение; центр — середина зоны печати, края кадра не покидаем.
  // Середина выбранного принта по высоте (доля высоты зоны) — запоминаем при выборе, чтобы камера
  // не гонялась за слоем, пока его тащат.
  // Там же — габарит принта в долях зоны: крупный принт должен поместиться в холст целиком (с кнопками).
  const anchorRef = useRef<{ key: string | null; v: number; w: number; h: number }>({ key: null, v: 0.5, w: 0, h: 0 });
  // Фокус снят — забываем точку: слой могли передвинуть, при новом выборе камера встанет на его текущее место.
  if (!focusOn) anchorRef.current.key = null;
  const focusAnchor = (key: string | null) => {
    if (anchorRef.current.key !== key) {
      let v = 0.5, w = 0, h = 0;
      if (selectedLayer && area) {
        if (selectedLayer.kind === 'image') {
          w = selectedLayer.width;
          h = (selectedLayer.width * area.w * selectedLayer.naturalHeight) / selectedLayer.naturalWidth / area.h;
          v = selectedLayer.y + h / 2;
        } else {
          // У текста точка слоя — его центр; высота — по строкам (дуга и обводка не в счёт, это оценка).
          const lines = selectedLayer.text.split('\n').length;
          h = (selectedLayer.fontSize * area.w * (selectedLayer.lineHeight ?? 1.2) * lines) / area.h;
          v = selectedLayer.y;
        }
      }
      anchorRef.current = { key, v: Math.min(1, Math.max(0, v)), w, h };
    }
    return anchorRef.current;
  };
  // Вид холста в координатах сцены (box): масштаб k и положение начала кадра. Кадр по центру холста;
  // в приближении — как можно шире, но без пустоты сбоку там, где изделие могло бы её закрыть.
  const ox = (box.w - size.w) / 2;
  const oy = (box.h - size.h) / 2;
  const clampR = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
  /** Где может стоять край кадра длиной full на холсте длиной vis: закрывает холст целиком или целиком на нём. */
  const span = (vis: number, full: number): [number, number] => [Math.min(0, vis - full), Math.max(0, vis - full)];
  const calcView = (withFocus: boolean) => {
    const v = { k: 1, x: ox, y: oy, bx: ox, by: oy, minX: ox, maxX: ox, minY: oy, maxY: oy };
    if (!area || !(isSleeve(side) || zoom > 1 || withFocus)) return v;
    const fit = Math.min(MAX_ZOOM, (SLEEVE_FILL * size.h) / area.h, (SLEEVE_FILL * size.w) / area.w);
    const fa = withFocus ? focusAnchor(focusKey) : null;
    // Ширина зоны — во весь холст, но принт целиком (по высоте и ширине) остаётся в кадре между полями.
    const focusFit = Math.min(
      FOCUS_MAX,
      (FOCUS_FILL * box.w) / area.w,
      fa && fa.h > 0 ? (box.h - FOCUS_TOP - FOCUS_BOTTOM - 40) / (fa.h * area.h) : Infinity,
      fa && fa.w > 0 ? (FOCUS_FILL * box.w) / (fa.w * area.w) : Infinity,
    );
    const base = Math.max(1, isSleeve(side) ? fit : 1, withFocus ? focusFit : 1);
    const k = Math.min(MAX_TOTAL_ZOOM, base * zoom);
    const [minX, maxX] = span(box.w, size.w * k);
    const bx = clampR(box.w / 2 - (area.x + area.w / 2) * k, minX, maxX);
    let [minY, maxY] = span(box.h, size.h * k);
    let by = clampR(box.h / 2 - (area.y + area.h / 2) * k, minY, maxY);
    if (withFocus) {
      // Камера по высоте — на принт (середина между полями), но зона печати не уходит от полей внутрь:
      // сверху hi — верх зоны у верхнего поля, снизу lo — низ зоны у нижнего. Пальцем по фону — в этих же пределах.
      const anchor = fa?.v ?? 0.5;
      const mid = FOCUS_TOP + (box.h - FOCUS_TOP - FOCUS_BOTTOM) / 2;
      const hi = FOCUS_TOP - area.y * k;
      const lo = box.h - FOCUS_BOTTOM - (area.y + area.h) * k;
      by = lo > hi ? (lo + hi) / 2 : clampR(mid - (area.y + anchor * area.h) * k, lo, hi);
      minY = Math.min(by, lo);
      maxY = Math.max(by, hi);
    }
    return { k, x: clampR(bx + pan.x, minX, maxX), y: clampR(by + pan.y, minY, maxY), bx, by, minX, maxX, minY, maxY };
  };
  const cv = calcView(focusOn);
  const view = { k: cv.k, x: cv.x, y: cv.y };
  panLimits.current = { bx: cv.bx, by: cv.by, minX: cv.minX, maxX: cv.maxX, minY: cv.minY, maxY: cv.maxY, k: cv.k };
  baseView.current = { x: cv.bx, y: cv.by };
  // Снимки для заявки — как раньше, по кадру изделия без фокуса: тот же масштаб (рукав приближен),
  // кадр заполнен изделием; вырезаем ровно прямоугольник кадра.
  {
    const r = calcView(false);
    const [fxa] = span(size.w, size.w * r.k);
    const [fya] = span(size.h, size.h * r.k);
    const fx = area ? clampR(size.w / 2 - (area.x + area.w / 2) * r.k, fxa, 0) : 0;
    const fy = area ? clampR(size.h / 2 - (area.y + area.h / 2) * r.k, fya, 0) : 0;
    exportView.current = { k: r.k, x: ox + fx, y: oy + fy, rect: { x: ox, y: oy, width: size.w, height: size.h } };
  }
  const from = fromView.current;
  const focusT = from ? Math.min(1, (performance.now() - from.t0) / FOCUS_MS) : 1;
  if (from && focusT < 1) {
    const e = 1 - (1 - focusT) ** 3;
    view.k = from.k + (view.k - from.k) * e;
    view.x = from.x + (view.x - from.x) * e;
    view.y = from.y + (view.y - from.y) * e;
  }
  shownView.current = { ...view };
  const pannable = view.k > 1;

  /** Сдвигает вид на (dx, dy) px экрана, не выпуская изделие за края кадра. true — вид действительно сдвинулся. */
  const panBy = (dx: number, dy: number) => {
    const L = panLimits.current;
    if (L.k <= 1) return false;
    const p = panRef.current;
    const nx = Math.min(L.maxX, Math.max(L.minX, L.bx + p.x + dx)) - L.bx;
    const ny = Math.min(L.maxY, Math.max(L.minY, L.by + p.y + dy)) - L.by;
    if (nx === p.x && ny === p.y) return false;
    panRef.current = { x: nx, y: ny };
    setPan(panRef.current);
    return true;
  };
  const panByRef = useRef(panBy);
  panByRef.current = panBy;

  // Перетаскивание фона и изделия двигает вид; слои (и рамка выделения) сохраняют своё перетаскивание.
  // Касание фона, которым сдвинули вид, — не «снять выделение»: иначе в приближении нельзя двигать вид.
  const panned = useRef(false);
  const onWrapPointerDown = (e: React.PointerEvent) => {
    panned.current = false;
    const stage = stageRef.current;
    if (!stage || panLimits.current.k <= 1 || (e.pointerType === 'mouse' && e.button !== 0)) return;
    if (pinchBusy.current || touches.current.size > 1) return;
    if (!stage.content.contains(e.target as Node)) return;
    const box = stage.container().getBoundingClientRect();
    const hit = stage.getIntersection({ x: e.clientX - box.left, y: e.clientY - box.top });
    if (hit && hit.name() !== 'bg') return;
    let lx = e.clientX;
    let ly = e.clientY;
    const sx = e.clientX;
    const sy = e.clientY;
    const id = e.pointerId;
    const move = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      if (Math.hypot(ev.clientX - sx, ev.clientY - sy) > 6) panned.current = true;
      if (pinchBusy.current || touches.current.size > 1) { lx = ev.clientX; ly = ev.clientY; return; }
      panByRef.current(ev.clientX - lx, ev.clientY - ly);
      lx = ev.clientX;
      ly = ev.clientY;
    };
    const up = (ev: PointerEvent) => {
      if (ev.pointerId !== id) return;
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  };

  // Колесо и трекпад двигают вид только на приближенном холсте и пока есть куда двигать — иначе прокручивается страница.
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || panLimits.current.k <= 1) return;
      const unit = e.deltaMode === 1 ? 16 : 1;
      if (panByRef.current(-e.deltaX * unit, -e.deltaY * unit)) e.preventDefault();
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  // Два пальца при выбранном слое: масштаб и поворот слоя (в любом месте холста). Без выбранного слоя — ничего, как раньше.
  // Пишем в узел, а в стор — одним шагом истории, когда пальцев стало меньше двух (как у ручек).
  useEffect(() => {
    const el = vpRef.current;
    if (!el) return;
    const local = (e: PointerEvent): Pt => {
      const r = el.getBoundingClientRect();
      return { x: e.clientX - r.left, y: e.clientY - r.top };
    };
    const nodeOf = (id: string) => stageRef.current?.findOne(`#${id}`) ?? null;
    const finish = () => {
      const g = pinch.current;
      pinch.current = null;
      const { area: a, layer, group, members } = pinchCtx.current;
      const node = g ? nodeOf(g.id) : null;
      if (g && node && a && group && g.id === `${GROUP_ID}${group}`) {
        useConstructor.getState().updateLayers(commitGroup(node, members, a));
        return;
      }
      if (!g || !node || !a || !layer || layer.id !== g.id) return;
      const sx = node.scaleX();
      node.scale({ x: 1, y: 1 });
      const base = { x: node.x() / a.w, y: node.y() / a.h, rotation: node.rotation() };
      useConstructor.getState().updateLayer(
        layer.id,
        layer.kind === 'image' ? { ...base, width: (node.width() * sx) / a.w } : { ...base, fontSize: layer.fontSize * sx },
      );
    };
    const release = () => {
      // Перетаскивание возвращаем, когда подняты все пальцы, — оставшийся палец не должен утащить слой.
      if (touches.current.size > 0) return;
      pinchBusy.current = false;
      for (const [n, on] of dragState.current) n.draggable(on);
      dragState.current.clear();
    };
    const down = (e: PointerEvent) => {
      if (e.pointerType !== 'touch') return;
      touches.current.set(e.pointerId, local(e));
      const { layer, group } = pinchCtx.current;
      if (touches.current.size !== 2 || pinch.current || (!layer && !group)) return;
      const targetId = group ? `${GROUP_ID}${group}` : layer!.id;
      const node = nodeOf(targetId);
      if (!node || !node.isVisible()) return;
      const ids = [...touches.current.keys()] as [number, number];
      pinchBusy.current = true;
      // Первый палец мог начать перетаскивание слоя — гасим его (draggable(false) останавливает drag).
      for (const l of stageRef.current?.find(`.${DESIGN_NODE}, .${DESIGN_GROUP}`) ?? []) {
        if (!dragState.current.has(l)) dragState.current.set(l, l.draggable());
        l.draggable(false);
      }
      guideOff();
      pinch.current = { ids, id: targetId, update: startPinch(node, touches.current.get(ids[0])!, touches.current.get(ids[1])!, MIN_NODE_PX) };
    };
    const guideOff = () => setGuides((p) => (p.v || p.h ? { v: false, h: false } : p));
    const move = (e: PointerEvent) => {
      if (!touches.current.has(e.pointerId)) return;
      touches.current.set(e.pointerId, local(e));
      const g = pinch.current;
      if (!g || !g.ids.includes(e.pointerId)) return;
      const a = touches.current.get(g.ids[0]);
      const b = touches.current.get(g.ids[1]);
      if (a && b) g.update(a, b);
    };
    const up = (e: PointerEvent) => {
      if (!touches.current.delete(e.pointerId)) return;
      if (pinch.current?.ids.includes(e.pointerId)) finish();
      release();
    };
    el.addEventListener('pointerdown', down, true);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
    return () => {
      el.removeEventListener('pointerdown', down, true);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
    };
  }, []);

  /** Прилипание к центру зоны при перетаскивании + направляющие. */
  const onDrag = (node: Konva.Node | null) => {
    const g = printRef.current;
    if (!node || !g || !area) return setGuides((p) => (p.v || p.h ? { v: false, h: false } : p));
    const rect = node.getClientRect({ relativeTo: g, skipShadow: true, skipStroke: true });
    const snap = snapToCenter(rect, { w: area.w, h: area.h }, SNAP_PX / view.k);
    if (snap.dx || snap.dy) node.position({ x: node.x() + snap.dx, y: node.y() + snap.dy });
    setGuides((p) => (p.v === snap.v && p.h === snap.h ? p : { v: snap.v, h: snap.h }));
  };

  // Рамка выделения живёт в отдельном слое — её не обрезает зона печати и не затеняют складки.
  useEffect(() => {
    const tr = trRef.current;
    if (!tr) return;
    const target = selectedLayerId ?? (activeGroup ? `${GROUP_ID}${activeGroup}` : null);
    const node = target ? stageRef.current?.findOne(`#${target}`) : null;
    tr.nodes(node ? [node] : []);
    tr.getLayer()?.batchDraw();
  });

  // Готов ли холст к снимку: показана сторона из стора, её мокап и картинки всех слоёв загружены.
  const isReady = useRef<() => boolean>(() => false);
  isReady.current = () => {
    const st = useConstructor.getState();
    const g = printRef.current;
    if (st.side !== side || !g) return false;
    if (shape && mockup?.url !== shape.images[side]) return false;
    return st.layers.filter((l) => l.side === side && !l.hidden).every((l) => {
      const n = g.findOne(`#${l.id}`);
      if (l.kind === 'text') return !!n && fontReady(l.fontFamily, l.bold, l.italic, l.text);
      return !!n && !!(n as Konva.Image).image();
    });
  };

  mockupRef.current = mockup;
  // Новый кадр готов: мокап другой, чем при снимке, и это мокап текущей стороны (у силуэта без мокапа — сразу).
  fadeReady.current = (base) => !shape || (!!mockup && mockup !== base && mockup.url === shape.images[side]);

  /** Временно прячет служебные узлы на время снимка. */
  const withHidden = <T,>(nodes: Array<Konva.Node | null>, fn: () => T): T => {
    const shown = nodes.filter((n): n is Konva.Node => !!n && n.visible());
    shown.forEach((n) => n.visible(false));
    try { return fn(); } finally { shown.forEach((n) => n.visible(true)); }
  };

  /** Снимки делаются с кадром без пользовательского сдвига: на время вызова вид возвращается к центрированию на зоне. */
  const unpanned = <T,>(fn: () => T): T => {
    const stage = stageRef.current;
    if (!stage) return fn();
    const cur = { x: stage.x(), y: stage.y(), k: stage.scaleX() };
    const ev = exportView.current;
    stage.scale({ x: ev.k, y: ev.k });
    stage.position({ x: ev.x, y: ev.y });
    try { return fn(); } finally { stage.scale({ x: cur.k, y: cur.k }); stage.position(cur); }
  };

  /**
   * Переместить и при необходимости масштабировать слой или готовый принт (id группы) одним шагом истории:
   * compute по точке привязки узла и его габариту в пикселях зоны возвращает новую точку и коэффициент масштаба.
   */
  const move = (id: string, compute: (origin: { x: number; y: number }, rect: { x: number; y: number; width: number; height: number }) => { x: number; y: number; scale: number } | null) => {
    // Слой, который ещё появляется (масштаб 0.92→1), мерим уже в конечном состоянии.
    settleAppear();
    const g = printRef.current;
    const node = g?.findOne(`#${id}`);
    if (g && node && area && id.startsWith(GROUP_ID)) {
      // Готовый принт целиком: масштаб и сдвиг узла группы, затем перенос в слои одним шагом.
      const rect = node.getClientRect({ relativeTo: g, skipShadow: true, skipStroke: true });
      if (!rect.width || !rect.height) return;
      const r = compute({ x: node.x(), y: node.y() }, rect);
      if (!r) return;
      node.scale({ x: node.scaleX() * r.scale, y: node.scaleY() * r.scale });
      node.position({ x: r.x, y: r.y });
      const gid = id.slice(GROUP_ID.length);
      updateLayers(commitGroup(node, layers.filter((l) => l.group === gid && l.side === side && !l.hidden), { w: area.w, h: area.h }));
      return;
    }
    const layer = layers.find((l) => l.id === id);
    if (!g || !node || !layer || !area) return;
    const rect = node.getClientRect({ relativeTo: g, skipShadow: true, skipStroke: true });
    if (!rect.width || !rect.height) return;
    const r = compute({ x: node.x(), y: node.y() }, rect);
    if (!r) return;
    const moved = Math.abs(r.x - node.x()) > 0.5 || Math.abs(r.y - node.y()) > 0.5;
    const scaled = Math.abs(r.scale - 1) > 1e-3;
    // Слой уже стоит как надо — не добавляем пустой шаг в историю.
    if (!moved && !scaled) return;
    const pos = { x: r.x / area.w, y: r.y / area.h };
    if (!scaled) return updateLayer(id, pos);
    updateLayer(id, layer.kind === 'image' ? { ...pos, width: layer.width * r.scale } : { ...pos, fontSize: layer.fontSize * r.scale });
  };

  useImperativeHandle(apiRef, () => ({
    exportPreview: () => {
      settleAppear();
      return stageRef.current
        ? withHidden([guideRef.current, trRef.current], () => unpanned(() => stageRef.current!.toDataURL({ ...exportView.current.rect, pixelRatio: 2 })))
        : null;
    },
    exportPrint: () => {
      settleAppear();
      const g = printRef.current;
      if (!g || !pa || !area) return null;
      const targetPx = (pa.widthCm / 2.54) * DPI;
      // toDataURL берёт область в координатах экрана — с учётом приближения холста.
      const w = area.w * exportView.current.k;
      const h = area.h * exportView.current.k;
      const full = targetPx / w;
      // Файл для печати — без складок ткани и только по самому рисунку: пустая часть зоны в файл не идёт,
      // поэтому предел площади canvas почти всегда оставляет полные 300 dpi.
      const out = withHidden([shadeRef.current, trRef.current], () => unpanned(() => {
        const at = g.getAbsolutePosition();
        let [x1, y1, x2, y2] = [Infinity, Infinity, -Infinity, -Infinity];
        for (const n of g.find(`.${DESIGN_NODE}`)) {
          const r = n.getClientRect();
          x1 = Math.min(x1, r.x); y1 = Math.min(y1, r.y);
          x2 = Math.max(x2, r.x + r.width); y2 = Math.max(y2, r.y + r.height);
        }
        // За границей зоны рисунок обрезается — габарит тоже.
        x1 = Math.max(x1, at.x); y1 = Math.max(y1, at.y);
        x2 = Math.min(x2, at.x + w); y2 = Math.min(y2, at.y + h);
        // Рисунок целиком за зоной — отдаём всю зону (пустую), чтобы заявка не споткнулась.
        if (!(x2 > x1 && y2 > y1)) [x1, y1, x2, y2] = [at.x, at.y, at.x + w, at.y + h];
        const ratio = Math.min(full, Math.sqrt(MAX_EXPORT_AREA / ((x2 - x1) * (y2 - y1))));
        const region = { x: x1, y: y1, width: x2 - x1, height: y2 - y1, pixelRatio: ratio };
        const dataUrl = g.toDataURL(region);
        // Для PDF с надписями кривыми (DTF): те же картинки без надписей и место каждой надписи в пикселях файла.
        const textNodes = sideLayers.flatMap((l) => {
          const n = l.kind === 'text' ? g.findOne(`#${l.id}`) : undefined;
          return n && l.kind === 'text' ? [{ l, n }] : [];
        });
        const toFile = (n: Konva.Node) => {
          const m = n.getAbsoluteTransform().getMatrix();
          return [m[0] * ratio, m[1] * ratio, m[2] * ratio, m[3] * ratio, (m[4] - x1) * ratio, (m[5] - y1) * ratio];
        };
        const texts: PrintText[] = textNodes.map(({ l, n }) => ({ layer: l, fontPx: l.fontSize * area.w, matrix: toFile(n) }));
        const hasArt = sideLayers.some((l) => l.kind === 'image');
        const art = texts.length && hasArt ? withHidden(textNodes.map(({ n }) => n), () => g.toDataURL(region)) : null;
        const size = { w: Math.round((x2 - x1) * ratio), h: Math.round((y2 - y1) * ratio), dpi: (DPI * ratio) / full };
        return { dataUrl, dpi: Math.round((DPI * ratio) / full), size, art, texts };
      }));
      return out;
    },
    whenReady: (timeoutMs = 8000) =>
      new Promise<void>((resolve, reject) => {
        const started = Date.now();
        // Не rAF: в фоновой вкладке он не срабатывает.
        const check = () => {
          if (isReady.current()) return resolve();
          if (Date.now() - started > timeoutMs) return reject(new Error('canvas_not_ready'));
          setTimeout(check, 40);
        };
        setTimeout(check, 0);
      }),
    setTurnEnabled: (on) => { turnEnabled.current = on; if (!on) { setTurn(null); setFade(null); settleAppear(); } },
    align: (id, mode) => move(id, (origin, rect) => area && alignLayer(mode, origin, rect, { w: area.w, h: area.h }, hasOutline ? outlinePts.map(([px, py]): [number, number] => [px, py]) : null)),
    place: (id, spot) => move(id, (origin, rect) => area && pa && placeAt(origin, rect, placeRect(pa, spot, rect, { w: area.w, h: area.h }))),
  }));

  const silScale = Math.min(size.w / SILHOUETTE_VIEWBOX.w, size.h / SILHOUETTE_VIEWBOX.h);
  const deselect = (e: Konva.KonvaEventObject<Event>) => {
    if (panned.current) return;
    if (e.target === e.target.getStage() || e.target.name() === 'bg') selectLayer(null);
  };
  // На сенсорном экране снимаем выделение не по касанию, а по отпусканию одним пальцем:
  // иначе первый палец жеста двумя пальцами по фону сбросил бы выбранный слой.
  const deselectTouch = (e: Konva.KonvaEventObject<Event>) => {
    const te = e.evt as TouchEvent;
    if (pinchBusy.current || (te.changedTouches?.length ?? 0) !== 1 || te.touches.length > 0) return;
    deselect(e);
  };

  return (
    <div ref={wrapRef} style={{ width: '100%', height: '100%', display: 'grid', placeItems: 'center' }}>
      <div
        ref={vpRef}
        className={c.viewport}
        style={{ width: box.w, height: box.h, touchAction: 'none' }}
        onPointerDown={onWrapPointerDown}
        onPointerDownCapture={() => setPressing(true)}
      >
      <Stage
        ref={stageRef} width={box.w} height={box.h}
        scaleX={view.k} scaleY={view.k} x={view.x} y={view.y}
        onMouseUp={deselect} onTouchEnd={deselectTouch}
      >
        <Layer>
          {shape ? (
            mockup && <KImage name="bg" image={mockup.garment} width={size.w} height={size.h} />
          ) : garment ? (
            <Path
              name="bg"
              data={SILHOUETTES[garment.type]}
              x={(size.w - SILHOUETTE_VIEWBOX.w * silScale) / 2}
              scaleX={silScale}
              scaleY={silScale}
              fill={hex}
              stroke="#c9c9c9"
              strokeWidth={1}
            />
          ) : null}
          {area && (
            <Group ref={guideRef} listening={false} visible={!isEmptyZone} x={area.x} y={area.y}>
              {partsPx.map((part, i) => (
                <Line
                  key={i}
                  listening={false}
                  points={part.flat()}
                  closed
                  stroke={light
                    ? (frameStrong ? 'rgba(0,0,0,.35)' : 'rgba(0,0,0,.18)')
                    : (frameStrong ? 'rgba(255,255,255,.6)' : 'rgba(255,255,255,.25)')}
                  strokeWidth={1}
                  strokeScaleEnabled={false}
                  dash={[6 / view.k, 4 / view.k]}
                />
              ))}
            </Group>
          )}
        </Layer>
        <Layer>
          {area && (
            <Group
              ref={printRef} x={area.x} y={area.y}
              {...(hasOutline || pa?.parts?.length ? { clipFunc: clipOutline } : { clipX: 0, clipY: 0, clipWidth: area.w, clipHeight: area.h })}
            >
              {runs(sideLayers, groupOf).map((run) => {
                const nodes = run.layers.map((l) => {
                  // Слой готового принта: пока принт не «открыт» (выбран один из его слоёв), нажатие выбирает
                  // принт целиком, а тащится группа; повторное нажатие без перетаскивания выбирает сам слой.
                  const inside = !run.group || selectedLayer?.group === run.group;
                  return (
                    <LayerNode
                      key={l.id}
                      layer={l}
                      area={{ w: area.w, h: area.h }}
                      draggable={inside}
                      onSelect={() => {
                        if (inside) return selectLayer(l.id);
                        groupWasSelected.current = useConstructor.getState().selectedGroup === run.group;
                        selectGroup(run.group!);
                      }}
                      onTap={inside ? undefined : () => { if (groupWasSelected.current) selectLayer(l.id); }}
                      onChange={(p) => { if (!pinchBusy.current) updateLayer(l.id, p); }}
                      onDrag={onDrag}
                    />
                  );
                });
                if (!run.group) return nodes;
                const gid = run.group;
                return (
                  <Group
                    key={`${GROUP_ID}${gid}`}
                    id={`${GROUP_ID}${gid}`}
                    name={DESIGN_GROUP}
                    draggable={selectedLayer?.group !== gid}
                    onDragMove={(e) => { if (e.target === e.currentTarget) onDrag(e.target); }}
                    onDragEnd={(e) => {
                      // Сюда же всплывает конец перетаскивания отдельного слоя — его пишет сам слой.
                      if (e.target !== e.currentTarget) return;
                      onDrag(null);
                      if (pinchBusy.current) return;
                      updateLayers(commitGroup(e.target, run.layers, { w: area.w, h: area.h }));
                    }}
                  >
                    {nodes}
                  </Group>
                );
              })}
              {mockup && sideLayers.length > 0 && (
                <KImage
                  ref={shadeRef}
                  image={mockup.shade}
                  x={-area.x}
                  y={-area.y}
                  width={size.w}
                  height={size.h}
                  listening={false}
                  globalCompositeOperation="source-atop"
                />
              )}
            </Group>
          )}
        </Layer>
        <Layer>
          {area && (guides.v || guides.h) && (
            <Group x={area.x} y={area.y} listening={false}>
              {guides.v && <Line points={[area.w / 2, 0, area.w / 2, area.h]} stroke={accent} strokeWidth={1} strokeScaleEnabled={false} />}
              {guides.h && <Line points={[0, area.h / 2, area.w, area.h / 2]} stroke={accent} strokeWidth={1} strokeScaleEnabled={false} />}
            </Group>
          )}
          {/* Только рамка вплотную к принту; поворот, размер и удаление — кнопки SelectionControls. */}
          <Transformer
            ref={trRef}
            resizeEnabled={false}
            rotateEnabled={false}
            padding={0}
            borderStroke={accent}
            borderStrokeWidth={1.5}
          />
        </Layer>
      </Stage>
      {turn && <div ref={turnRef} className={c.turn} aria-hidden />}
      {fade && <div ref={fadeRef} className={c.turn} aria-hidden />}
      {area && !turn && !fade?.swap && empty && sideLayers.length === 0 && (
        <EmptyZone
          rect={{ left: area.x * view.k + view.x, top: area.y * view.k + view.y, width: area.w * view.k, height: area.h * view.k }}
          dragging={empty.dragging}
          panEnabled={pannable}
          onPanBy={panBy}
          outline={pa?.outline}
          parts={pa?.parts}
          tone={zoneTone(hex)}
          sizeText={zoneText}
          onUpload={empty.onUpload}
        />
      )}
      {area && !turn && !fade?.swap && !isEmptyZone && selectedLayer && zoneText && (
        <ZoneBadge
          rect={{ left: area.x * view.k + view.x, top: area.y * view.k + view.y, width: area.w * view.k, height: area.h * view.k }}
          text={zoneText}
          corner="bottom"
        />
      )}
      {area && !turn && !fade?.swap && (
        <SelectionControls
          stage={stageRef.current}
          layer={selectedLayer}
          area={{ w: area.w, h: area.h }}
          size={box}
          minPx={MIN_NODE_PX}
          accent={accent}
          caption={caption}
          onCommit={(p) => selectedLayerId && updateLayer(selectedLayerId, p)}
          onRemove={() => (selectedLayerId ? removeLayer(selectedLayerId) : activeGroup && removeGroup(activeGroup))}
          onDuplicate={() => (selectedLayerId ? duplicateLayer(selectedLayerId) : activeGroup && duplicateGroup(activeGroup))}
          onCrop={onCrop && selectedLayer?.kind === 'image' && !selectedLayer.placeholder ? () => onCrop(selectedLayer.id) : undefined}
          group={!selectedLayer && activeGroup ? activeGroup : undefined}
          onCommitGroup={(node) => activeGroup && updateLayers(commitGroup(node, groupMembers, { w: area.w, h: area.h }))}
        />
      )}
      </div>
    </div>
  );
}
