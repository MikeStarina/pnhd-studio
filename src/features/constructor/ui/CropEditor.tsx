'use client';
import { useCallback, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { coverCrop } from '../model/slot';
import { contentBox, type CropRect } from '../model/trim';
import s from './constructor.module.css';
import c from './crop.module.css';
import { useDismiss } from './useDismiss';

export interface CropEditorProps {
  /** Адрес картинки (objectURL / dataURL / статический путь). */
  src: string;
  /** Слой зеркальный: показываем картинку отражённой, работаем в том, что видит человек. */
  flipX?: boolean;
  /** Слой отражён по вертикали — так же показываем перевёрнутым. */
  flipY?: boolean;
  /** Текущая обрезка в пикселях ИСХОДНИКА (без зеркала); нет — вся картинка. */
  crop?: CropRect;
  /** Жёсткие пропорции высота/ширина (окно под фото в шаблоне). */
  lockedAspect?: number;
  /** Форма обрезки слоя: её контур рисуется в рамке, пропорции задаёт lockedAspect. */
  shape?: { d: string; aspect: number; label: string };
  /** Готовая картинка притенения по маске (буквы, полосы) — растягивается на рамку. */
  overlay?: string;
  /** Обрезка в пикселях исходника, без зеркала, целые, внутри картинки. */
  onApply: (crop: CropRect, srcSize: { w: number; h: number }) => void;
  onClose: () => void;
}

/** Рамка в «видимых» координатах: пиксели исходника, но с учётом зеркала. */
interface R { x: number; y: number; w: number; h: number }
type Mode = 'move' | 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';

const PRESETS: { id: string; label: string; aspect: number | null | 'orig' }[] = [
  { id: 'free', label: 'Свободно', aspect: null },
  { id: 'orig', label: 'Исходные', aspect: 'orig' },
  { id: '1:1', label: '1:1', aspect: 1 },
  { id: '3:4', label: '3:4', aspect: 4 / 3 },
  { id: '4:3', label: '4:3', aspect: 3 / 4 },
  { id: '16:9', label: '16:9', aspect: 9 / 16 },
];
const CORNERS: Mode[] = ['nw', 'ne', 'se', 'sw'];
const EDGES: Mode[] = ['n', 'e', 's', 'w'];

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));

/** Новая рамка при перетаскивании на (dx, dy) пикселей исходника от рамки `st`. */
function resize(mode: Mode, st: R, dx: number, dy: number, iw: number, ih: number, min: number, aspect: number | null): R {
  if (mode === 'move') return { ...st, x: clamp(st.x + dx, 0, iw - st.w), y: clamp(st.y + dy, 0, ih - st.h) };

  if (aspect && mode.length === 2) {
    // Пропорции зафиксированы: угол тянем от противоположного, берём большее из предложений по x и y.
    const sx = mode.includes('e') ? 1 : -1;
    const sy = mode.includes('s') ? 1 : -1;
    const ax = sx > 0 ? st.x : st.x + st.w;
    const ay = sy > 0 ? st.y : st.y + st.h;
    const px = (sx > 0 ? st.x + st.w : st.x) + dx;
    const py = (sy > 0 ? st.y + st.h : st.y) + dy;
    let w = Math.max(sx * (px - ax), (sy * (py - ay)) / aspect, 0);
    w = Math.max(w, min, min / aspect);
    w = Math.min(w, sx > 0 ? iw - ax : ax, (sy > 0 ? ih - ay : ay) / aspect);
    const h = w * aspect;
    return { x: sx > 0 ? ax : ax - w, y: sy > 0 ? ay : ay - h, w, h };
  }

  // Свободно: каждая сторона двигается сама, не ближе min к противоположной.
  let l = st.x, t = st.y, r = st.x + st.w, b = st.y + st.h;
  if (mode.includes('w')) l = clamp(l + dx, 0, r - min);
  if (mode.includes('e')) r = clamp(r + dx, l + min, iw);
  if (mode.includes('n')) t = clamp(t + dy, 0, b - min);
  if (mode.includes('s')) b = clamp(b + dy, t + min, ih);
  return { x: l, y: t, w: r - l, h: b - t };
}

/** Рамка нужных пропорций с той же площадью и центром, вписанная в картинку. */
function refit(cur: R, aspect: number, iw: number, ih: number, min: number): R {
  let w = Math.sqrt((cur.w * cur.h) / aspect);
  let h = w * aspect;
  if (w > iw) { w = iw; h = w * aspect; }
  if (h > ih) { h = ih; w = h / aspect; }
  if (w < min && min / aspect <= ih && min <= iw) { w = min; h = w * aspect; }
  return {
    x: clamp(cur.x + cur.w / 2 - w / 2, 0, iw - w),
    y: clamp(cur.y + cur.h / 2 - h / 2, 0, ih - h),
    w, h,
  };
}

/** Модалка кадрирования фото: рамка поверх целой картинки, остальное затемнено. */
export function CropEditor({ src, flipX, flipY, crop, lockedAspect, shape, overlay, onApply, onClose }: CropEditorProps) {
  const { leaving, dismiss } = useDismiss();
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  const [failed, setFailed] = useState(false);
  const [rect, setRect] = useState<R | null>(null);
  const [preset, setPreset] = useState('free');
  const [box, setBox] = useState({ w: 0, h: 0 });
  const stageRef = useRef<HTMLDivElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ id: number; mode: Mode; x: number; y: number; start: R } | null>(null);

  const iw = img?.naturalWidth ?? 0;
  const ih = img?.naturalHeight ?? 0;
  const scale = iw && ih && box.w > 0 && box.h > 0 ? Math.min(box.w / iw, box.h / ih) : 0;
  const min = iw && ih ? Math.min(Math.max(24, 0.04 * Math.min(iw, ih)), iw, ih) : 0;
  const presetAspect = (() => {
    const p = PRESETS.find((x) => x.id === preset)?.aspect;
    return p === 'orig' ? (iw ? ih / iw : null) : p ?? null;
  })();
  const aspect = lockedAspect ?? presetAspect;

  // Загрузка. crossOrigin выставляем до src, иначе картинку с другого домена нельзя будет прочитать.
  useEffect(() => {
    const el = new Image();
    el.crossOrigin = 'anonymous';
    el.onload = () => (el.naturalWidth && el.naturalHeight ? setImg(el) : setFailed(true));
    el.onerror = () => setFailed(true);
    el.src = src;
    return () => { el.onload = null; el.onerror = null; };
  }, [src]);

  // Начальная рамка: из props.crop (в видимых координатах) или вся картинка.
  useEffect(() => {
    if (!img) return;
    const [w, h] = [img.naturalWidth, img.naturalHeight];
    let r: R = { x: 0, y: 0, w, h };
    if (crop && crop.width > 0 && crop.height > 0) {
      r = { x: flipX ? w - crop.x - crop.width : crop.x, y: flipY ? h - crop.y - crop.height : crop.y, w: crop.width, h: crop.height };
    }
    if (lockedAspect && Math.abs(r.h / r.w - lockedAspect) / lockedAspect > 0.02) {
      const cc = coverCrop(w, h, lockedAspect);
      r = { x: cc.x, y: cc.y, w: cc.width, h: cc.height };
    }
    setRect(r);
    // Рамка задаётся один раз при загрузке картинки.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [img]);

  // Размер области под картинку.
  useLayoutEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, [img, failed]);

  useEffect(() => { dialogRef.current?.focus(); }, []);

  const close = useCallback(() => dismiss(onClose), [dismiss, onClose]);
  const apply = useCallback(() => {
    if (!rect || !iw) return;
    const vx = flipX ? iw - rect.x - rect.w : rect.x; // обратно в координаты исходника
    const x0 = clamp(Math.round(vx), 0, iw - 1);
    const vy = flipY ? ih - rect.y - rect.h : rect.y;
    const y0 = clamp(Math.round(vy), 0, ih - 1);
    const x1 = clamp(Math.round(vx + rect.w), x0 + 1, iw);
    const y1 = clamp(Math.round(vy + rect.h), y0 + 1, ih);
    dismiss(onApply, { x: x0, y: y0, width: x1 - x0, height: y1 - y0 }, { w: iw, h: ih });
  }, [rect, iw, ih, flipX, flipY, dismiss, onApply]);

  // Клавиатура: Esc — закрыть, Enter — готово (на кнопке Enter нажимает её сам).
  const keys = useRef({ close, apply });
  keys.current = { close, apply };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') keys.current.close();
      else if (e.key === 'Enter' && !(e.target instanceof HTMLButtonElement)) keys.current.apply();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const pick = (id: string) => {
    setPreset(id);
    const p = PRESETS.find((x) => x.id === id)?.aspect;
    const a = p === 'orig' ? ih / iw : p;
    if (a && rect) setRect(refit(rect, a, iw, ih, min));
  };

  const reset = () => {
    if (aspect) {
      const cc = coverCrop(iw, ih, aspect);
      setRect({ x: cc.x, y: cc.y, w: cc.width, h: cc.height });
      return;
    }
    const cb = img ? contentBox(img) : null;
    const src0 = cb ?? { x: 0, y: 0, width: iw, height: ih };
    setRect({ x: flipX ? iw - src0.x - src0.width : src0.x, y: flipY ? ih - src0.y - src0.height : src0.y, w: src0.width, h: src0.height });
  };

  const down = (e: RPointerEvent<HTMLElement>, mode: Mode) => {
    if (!rect || drag.current) return;
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { id: e.pointerId, mode, x: e.clientX, y: e.clientY, start: rect };
  };
  const move = (e: RPointerEvent<HTMLElement>) => {
    const d = drag.current;
    if (!d || d.id !== e.pointerId || !scale) return;
    setRect(resize(d.mode, d.start, (e.clientX - d.x) / scale, (e.clientY - d.y) / scale, iw, ih, min, aspect));
  };
  const up = (e: RPointerEvent<HTMLElement>) => {
    if (drag.current?.id === e.pointerId) drag.current = null;
  };

  const shell = (children: React.ReactNode) => (
    <div className={`${s.modalBg} ${c.bg}`} data-leaving={leaving || undefined} onClick={close}>
      <div
        ref={dialogRef}
        className={`${s.modal} ${c.card}`}
        role="dialog"
        aria-modal="true"
        aria-label="Кадрирование"
        tabIndex={-1}
        onClick={(e) => e.stopPropagation()}
      >
        <h3>Кадрирование</h3>
        {children}
      </div>
    </div>
  );

  if (failed) {
    return shell(
      <>
        <p className={c.fail}>Эту картинку нельзя кадрировать</p>
        <div className={c.actions}><button className={s.cta} onClick={close}>Закрыть</button></div>
      </>,
    );
  }

  const px = (v: number) => v * scale;
  return shell(
    <>
      {!lockedAspect ? (
        <div className={c.presets} role="group" aria-label="Пропорции">
          {PRESETS.map((p) => (
            <button key={p.id} type="button" className={c.chip} aria-pressed={preset === p.id} onClick={() => pick(p.id)}>
              {p.label}
            </button>
          ))}
        </div>
      ) : (
        <p className={c.note}>{shape ? `Пропорции заданы формой «${shape.label}»` : 'Пропорции заданы рамкой принта'}</p>
      )}

      <div ref={stageRef} className={c.stage}>
        {img && rect && scale > 0 && (
          <div className={c.frame} style={{ width: px(iw), height: px(ih) }}>
            <div className={c.clip}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="" draggable={false} className={c.img} style={flipX || flipY ? { transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` } : undefined} />
              <div className={c.dim} style={{ left: px(rect.x), top: px(rect.y), width: px(rect.w), height: px(rect.h) }} />
            </div>
            <div
              className={c.box}
              style={{ left: px(rect.x), top: px(rect.y), width: px(rect.w), height: px(rect.h) }}
              onPointerDown={(e) => down(e, 'move')}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
            >
              {overlay && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  className={c.shape} src={overlay} alt="" draggable={false}
                  style={flipX || flipY ? { transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` } : undefined}
                />
              )}
              {shape && (
                // Контур формы: снаружи — притенение, по краю — линия; отражается вместе с фото.
                <svg
                  className={c.shape} viewBox={`0 0 100 ${100 * shape.aspect}`} preserveAspectRatio="none" aria-hidden="true"
                  style={flipX || flipY ? { transform: `scale(${flipX ? -1 : 1}, ${flipY ? -1 : 1})` } : undefined}
                >
                  <path d={`M0 0H100V${100 * shape.aspect}H0Z ${shape.d}`} fillRule="evenodd" fill="rgb(0 0 0 / .45)" />
                  <path d={shape.d} fill="none" stroke="#fff" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                </svg>
              )}
              {(aspect ? CORNERS : [...EDGES, ...CORNERS]).map((m) => (
                <span key={m} className={`${c.h} ${c[`h_${m}`]}`} aria-hidden="true" onPointerDown={(e) => down(e, m)} />
              ))}
            </div>
          </div>
        )}
      </div>

      <div className={c.actions}>
        <button type="button" className={`${s.btn} ${c.reset}`} onClick={reset} disabled={!rect}>Сбросить</button>
        <button type="button" className={s.btn} onClick={close}>Отмена</button>
        <button type="button" className={s.cta} onClick={apply} disabled={!rect}>Готово</button>
      </div>
    </>,
  );
}
