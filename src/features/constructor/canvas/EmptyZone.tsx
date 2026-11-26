'use client';
import { useRef } from 'react';
import c from './controls.module.css';
import type { ZoneTone } from './tint';

const TONE_FILL: Record<ZoneTone, string> = { light: c.emptyZoneLight, dark: c.emptyZoneDark, vivid: c.emptyZoneVivid };
const TONE_LINE: Record<ZoneTone, string> = { light: c.emptyOutlineLight, dark: c.emptyOutlineDark, vivid: c.emptyOutlineVivid };

/**
 * Пустая зона печати — одна нажимаемая область.
 * Нажатие сразу вызывает onUpload: он должен синхронно открыть системный выбор файла
 * (input.click() в том же жесте пользователя — иначе iOS Safari его заблокирует).
 */
type Rect = { left: number; top: number; width: number; height: number };

/**
 * Плашка с размером зоны печати («40 × 45 см»). Не перехватывает указатель.
 * В широкой зоне стоит внутри, в левом углу (сверху у пустой зоны, снизу при выбранном слое — сверху его кнопки); в узкой (рукав) — снаружи над зоной,
 * а если сверху нет места — под ней, чтобы не выйти за холст.
 */
export function ZoneBadge({ rect, text, corner = 'top' }: { rect: Rect; text: string; corner?: 'top' | 'bottom' }) {
  const narrow = rect.width < 90;
  // узкая зона: плашка снаружи; при выбранном слое (corner='bottom') — под зоной, чтобы не мешать кнопкам слоя
  const below = narrow && (corner === 'bottom' || rect.top < 26);
  const pos: React.CSSProperties = !narrow
    ? { left: rect.left + 6, ...(corner === 'top' ? { top: rect.top + 6 } : { top: rect.top + rect.height - 6, transform: 'translateY(-100%)' }) }
    : { left: rect.left + rect.width / 2, top: below ? rect.top + rect.height + 6 : rect.top - 24, transform: 'translateX(-50%)' };
  return <div className={c.zoneBadge} style={pos} aria-hidden>{text}</div>;
}

/** Сдвиг (px), с которого жест на приближенном холсте — панорамирование, а не нажатие. */
const PAN_THRESHOLD = 6;

export function EmptyZone({ rect, dragging, sizeText, outline, parts, tone = 'dark', onUpload, panEnabled, onPanBy }: {
  /** Холст приближен: перетаскивание по зоне двигает вид, а нажатие без сдвига по-прежнему загружает картинку. */
  panEnabled?: boolean;
  onPanBy?: (dx: number, dy: number) => void;
  rect: Rect;
  /** Контур непрямоугольной зоны (доли бокса); заливка и область нажатия повторяют его. */
  outline?: Array<[number, number]>;
  /** Печатаемые части зоны (половины зип-худи): рамка рисуется по каждой, заливка и область нажатия — по общему контуру. */
  parts?: Array<Array<[number, number]>>;
  /** Тон подсветки по цвету ткани (см. zoneTone). */
  tone?: ZoneTone;
  dragging?: boolean;
  /** Размер зоны в см — показывается плашкой в углу. */
  sizeText?: string;
  onUpload: () => void;
}) {
  const narrow = rect.width < 90;
  const pts = outline && outline.length >= 3 ? outline : null;
  const clip = pts ? `polygon(${pts.map(([x, y]) => `${+(x * 100).toFixed(2)}% ${+(y * 100).toFixed(2)}%`).join(', ')})` : undefined;
  // Жест: был ли он панорамированием (тогда последующий click не должен открывать выбор файла).
  const gesture = useRef<{ id: number; x: number; y: number; lx: number; ly: number; panned: boolean } | null>(null);
  const suppressClick = useRef(false);
  const onPointerDown = (e: React.PointerEvent) => {
    suppressClick.current = false;
    if (!panEnabled || (e.pointerType === 'mouse' && e.button !== 0)) return;
    gesture.current = { id: e.pointerId, x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY, panned: false };
    e.currentTarget.setPointerCapture?.(e.pointerId);
  };
  const onPointerMove = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    if (!g.panned && Math.hypot(e.clientX - g.x, e.clientY - g.y) > PAN_THRESHOLD) g.panned = true;
    if (g.panned) {
      onPanBy?.(e.clientX - g.lx, e.clientY - g.ly);
      g.lx = e.clientX;
      g.ly = e.clientY;
    }
  };
  const onPointerEnd = (e: React.PointerEvent) => {
    const g = gesture.current;
    if (!g || g.id !== e.pointerId) return;
    suppressClick.current = g.panned;
    gesture.current = null;
  };
  const cls = [c.emptyZone, TONE_FILL[tone], dragging ? c.emptyZoneDrag : ''].filter(Boolean).join(' ');

  return (
    <>
    <div className={c.emptyRoot} style={{ left: rect.left, top: rect.top, width: rect.width, height: rect.height }}>
      <button
        type="button"
        data-still=""
        className={cls}
        aria-label="Загрузить картинку"
        style={{ ...(clip ? { clipPath: clip } : null), touchAction: panEnabled ? 'none' : undefined }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerEnd}
        onPointerCancel={onPointerEnd}
        onClick={() => { if (suppressClick.current) { suppressClick.current = false; return; } onUpload(); }}
      >
        <svg className={c.emptyIcon} viewBox="0 0 24 24" aria-hidden>
          <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" />
        </svg>
        {!narrow && <span className={c.emptyLabel}>Загрузить картинку</span>}
      </button>
      {/* Контур отдельным SVG: clip-path у кнопки обрезал бы собственную рамку. */}
      <svg className={`${c.emptyOutline} ${TONE_LINE[tone]}`} viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
        {(parts?.length ? parts : [pts ?? [[0, 0], [1, 0], [1, 1], [0, 1]]]).map((part, i) => (
          <polygon
            key={i}
            points={part.map(([x, y]) => `${x * 100},${y * 100}`).join(' ')}
            fill="none" vectorEffect="non-scaling-stroke" strokeLinejoin="round"
          />
        ))}
      </svg>
    </div>
    {sizeText && <ZoneBadge rect={rect} text={sizeText} />}
    </>
  );
}
