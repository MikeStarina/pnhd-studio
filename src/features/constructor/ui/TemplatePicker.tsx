'use client';
import { useEffect, useId, useReducer, useRef, useState } from 'react';
import { track } from '../analytics/events';
import { isLight } from '../canvas/tint';
import { FRAME } from '../config/garment-shapes';
import { printAreaFor } from '../config/print-areas';
import { TEMPLATE_PHOTOS, type TemplatePhoto } from '../config/template-photos';
import { buildTemplate, TEMPLATE_CATEGORIES, TEMPLATES, type PrintTemplate } from '../config/templates';
import { ensureFont, onFontLoaded } from '../model/fonts';
import { START_MAX_CM, startTop } from '../model/placement';
import { selectGarment, useConstructor } from '../model/store';
import { Icon } from './icons';
import { measureText, textFont } from '../model/trim';
import { drawMasked } from '../canvas/masked';
import t from './templates.module.css';
import { useDismiss } from './useDismiss';

/** Размер растра превью и поля вокруг зоны, в которую вписывается композиция. */
const PREVIEW = { w: 360, h: 432, padX: 0.1, padY: 0.07 };
const images = new Map<string, Promise<HTMLImageElement>>();
const loadImage = (src: string) => {
  let p = images.get(src);
  if (!p) {
    p = new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = src;
    });
    images.set(src, p);
  }
  return p;
};

/**
 * Превью шаблона — те же слои, что попадут на холст, нарисованные тем же измерением текста (measureText):
 * дуга, графика и места под фото выглядят как в редакторе.
 */
function Preview({ tpl, hex, light, tick }: { tpl: PrintTemplate; hex: string; light: boolean; tick: number }) {
  const ref = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const cv = ref.current;
    const ctx = cv?.getContext('2d');
    if (!cv || !ctx) return;
    let stale = false;
    const zw = PREVIEW.w * (1 - PREVIEW.padX * 2);
    const maxH = PREVIEW.h * (1 - PREVIEW.padY * 2);
    // Зона превью — по высоте композиции, но не выше карточки; стоит по центру.
    const aspect = Math.min(maxH / zw, tpl.height / 0.9);
    const zh = zw * aspect;
    const zx = (PREVIEW.w - zw) / 2;
    const zy = (PREVIEW.h - zh) / 2;
    const layers = buildTemplate(tpl, aspect, light);
    Promise.all(layers.map((l) => (l.kind === 'image' ? loadImage(l.src) : null))).then((imgs) => {
      if (stale) return;
      ctx.clearRect(0, 0, PREVIEW.w, PREVIEW.h);
      layers.forEach((l, i) => {
        ctx.save();
        ctx.translate(zx + l.x * zw, zy + l.y * zh);
        ctx.rotate((l.rotation * Math.PI) / 180);
        if (l.kind === 'image') {
          const w = l.width * zw;
          const h = (w * l.naturalHeight) / l.naturalWidth;
          if (l.mask) drawMasked(ctx, imgs[i]!, { x: 0, y: 0, width: l.naturalWidth, height: l.naturalHeight }, w, h, l.mask);
          else ctx.drawImage(imgs[i]!, 0, 0, w, h);
        } else {
          const fontPx = l.fontSize * zw;
          const box = measureText(l.text, l, fontPx);
          ctx.translate(-box.width / 2, -box.height / 2);
          ctx.font = textFont(l, fontPx);
          ctx.textAlign = box.centered ? 'center' : 'left';
          ctx.textBaseline = 'alphabetic';
          ctx.fillStyle = l.fill;
          for (const it of box.items) {
            ctx.save();
            ctx.translate(it.x, it.y);
            ctx.rotate(it.rot);
            ctx.fillText(it.text, 0, 0);
            ctx.restore();
          }
        }
        ctx.restore();
      });
    }).catch(() => {});
    return () => { stale = true; };
  }, [tpl, light, tick]);
  return (
    <div className={t.preview} style={{ background: hex }}>
      <canvas ref={ref} className={t.canvas} width={PREVIEW.w} height={PREVIEW.h} aria-hidden />
    </div>
  );
}

/**
 * Карусель «как это выглядит вживую»: первым слайдом — превью принта (нажатие применяет шаблон), дальше фото.
 * Листается свайпом, стрелками и точками; на scroll-snap, без библиотек.
 */
function LiveCarousel({ title, photos, onPick, children }: { title: string; photos: TemplatePhoto[]; onPick: () => void; children: React.ReactNode }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  const count = photos.length + 1;
  const id = useId();

  const go = (i: number) => {
    const el = trackRef.current;
    if (!el) return;
    const next = Math.max(0, Math.min(count - 1, i));
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    el.scrollTo({ left: next * el.clientWidth, behavior: reduce ? 'auto' : 'smooth' });
  };
  const onKey = (e: React.KeyboardEvent) => {
    if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
    e.preventDefault();
    go(index + (e.key === 'ArrowRight' ? 1 : -1));
  };

  return (
    <div className={t.live} role="group" aria-roledescription="карусель" aria-label={`${title}: как это выглядит вживую`} onKeyDown={onKey}>
      <div
        ref={trackRef} className={t.track} id={id} tabIndex={0} aria-label="Слайды"
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
      >
        <button type="button" className={t.slide} aria-label={`${title}: применить`} aria-roledescription="слайд" onClick={onPick}>{children}</button>
        {photos.map((p, i) => (
          <div key={p.src} className={t.slide} role="group" aria-roledescription="слайд" aria-label={`Фото ${i + 1} из ${photos.length}`}>
            <img className={t.photo} src={p.src} alt={p.alt} width={p.width} height={p.height} loading="lazy" decoding="async" draggable={false} />
          </div>
        ))}
      </div>
      <button type="button" className={t.arrow} data-dir="prev" aria-label="Предыдущий слайд" aria-controls={id} disabled={index === 0} onClick={() => go(index - 1)}>
        <Icon name="chevronLeft" size={20} />
      </button>
      <button type="button" className={t.arrow} data-dir="next" aria-label="Следующий слайд" aria-controls={id} disabled={index === count - 1} onClick={() => go(index + 1)}>
        <Icon name="chevronRight" size={20} />
      </button>
      <div className={t.dots}>
        {Array.from({ length: count }, (_, i) => (
          <button key={i} type="button" className={t.dot} data-on={i === index || undefined} aria-label={`Слайд ${i + 1} из ${count}`} aria-current={i === index || undefined} onClick={() => go(i)} />
        ))}
      </div>
    </div>
  );
}

/** Карточка принта: без фото вживую — одна кнопка с превью, с фото — карусель и отдельная кнопка с названием. */
function PrintCard({ tpl, onPick, children }: { tpl: PrintTemplate; onPick: () => void; children: React.ReactNode }) {
  const photos = TEMPLATE_PHOTOS[tpl.id] ?? [];
  if (!photos.length) {
    return (
      <button type="button" className={t.card} onClick={onPick}>
        {children}
        <span className={t.name}>{tpl.title}</span>
      </button>
    );
  }
  return (
    <div className={t.card}>
      <LiveCarousel title={tpl.title} photos={photos} onPick={onPick}>{children}</LiveCarousel>
      <button type="button" className={t.nameBtn} onClick={onPick}>{tpl.title}</button>
    </div>
  );
}

/**
 * Готовые принты: лист снизу на телефоне, окно по центру на десктопе.
 * hex — цвет ткани: на нём рисуются превью и по нему выбирается цвет надписей.
 */
export function TemplatePicker({ hex, onClose }: { hex: string; onClose: () => void }) {
  const { leaving, dismiss } = useDismiss();
  const close = () => dismiss(onClose);
  const [category, setCategory] = useState<string>('Все');
  const [pending, setPending] = useState<PrintTemplate | null>(null);
  const [tick, redraw] = useReducer((n: number) => n + 1, 0);
  const garment = useConstructor(selectGarment);
  const side = useConstructor((s) => s.side);
  const applyTemplate = useConstructor((s) => s.applyTemplate);
  const hasLayers = useConstructor((s) => s.layers.some((l) => l.side === s.side));
  const light = isLight(hex);

  // Шрифты превью грузим сразу все; после загрузки перерисовываем.
  useEffect(() => {
    const off = onFontLoaded(redraw);
    for (const tpl of TEMPLATES) for (const it of tpl.items) {
      if (it.kind === 'text') ensureFont(it.font, !!it.bold, !!it.italic, it.text).catch(() => {});
      else if (it.kind === 'photo' && it.mask?.kind === 'text') ensureFont(it.mask.fontFamily, it.mask.bold, false, it.mask.text).catch(() => {});
      else if (it.kind === 'letters') ensureFont(it.font, !!it.bold, false, it.text).catch(() => {});
    }
    return off;
  }, []);

  // Esc: закрывает подтверждение, а если его нет — весь лист.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (pending) setPending(null); else dismiss(onClose);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [pending, dismiss, onClose]);

  const apply = (tpl: PrintTemplate) => {
    if (!garment) return;
    // Пропорции зоны печати текущей стороны: композиция вписывается в неё целиком.
    const pa = printAreaFor(garment, side);
    applyTemplate(buildTemplate(tpl, (pa.height * FRAME.h) / (pa.width * FRAME.w), light, { maxWidth: START_MAX_CM / pa.widthCm, top: startTop(pa, side) }));
    track('template_apply', { id: tpl.id });
    onClose();
  };
  const pick = (tpl: PrintTemplate) => (hasLayers ? setPending(tpl) : apply(tpl));

  const list = category === 'Все' ? TEMPLATES : TEMPLATES.filter((x) => x.category === category);

  return (
    <div className={t.backdrop} data-leaving={leaving || undefined} onClick={close}>
      <div className={t.sheet} role="dialog" aria-label="Готовые принты" onClick={(e) => e.stopPropagation()}>
        <div className={t.head}>
          <h3 className={t.title}>Готовые принты</h3>
          <button type="button" className={t.close} aria-label="Закрыть" onClick={close}>
            <Icon name="close" size={22} />
          </button>
        </div>
        <div className={t.chips} role="tablist" aria-label="Категории">
          {['Все', ...TEMPLATE_CATEGORIES].map((name) => (
            <button
              key={name} type="button" role="tab" aria-selected={category === name}
              className={t.chip} data-on={category === name || undefined} onClick={() => setCategory(name)}
            >
              {name}
            </button>
          ))}
        </div>
        <div className={t.scroll}>
          <div className={t.grid}>
            {list.map((tpl) => (
              <PrintCard key={tpl.id} tpl={tpl} onPick={() => pick(tpl)}>
                <Preview tpl={tpl} hex={hex} light={light} tick={tick} />
              </PrintCard>
            ))}
          </div>
        </div>
        {pending && (
          <div className={t.confirm} role="alertdialog" aria-label="Подтверждение замены">
            <p className={t.confirmText}>Заменить текущий принт на этой стороне?</p>
            <div className={t.confirmBtns}>
              <button type="button" className={t.btnGhost} onClick={() => setPending(null)}>Отмена</button>
              <button type="button" className={t.btnMain} onClick={() => apply(pending)}>Заменить</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
