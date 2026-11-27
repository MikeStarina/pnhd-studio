'use client';

import Link from 'next/link';
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Icon } from '@/features/constructor/ui/icons';
import MoreLink from '../more-link/more-link';
import { HOVER_INTENT_MS } from '@/styles/motion';
import { beat, colorOrder, colors, garmentOrder, garments, prints, railSteps, sideLabels } from './data';
import styles from './constructor-promo.module.css';

type Props = { href: string };

const isLight = (hex: string) => {
  const n = parseInt(hex.slice(1), 16);
  return 0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255) > 150;
};

const targetFor = (step: number, loop: number) =>
  [`garment-${garments[garmentOrder[loop % garments.length]].id}`, `color-${colorOrder[loop % colors.length]}`, 'prints', 'order'][step];

// Кадр, который видят без анимации: результат всех четырёх шагов
const poster = { garment: 1, color: 1, print: 0, ordered: true };

const ConstructorLive: React.FC<Props> = ({ href }) => {
  const rootRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const [step, setStep] = useState(0);
  const [loop, setLoop] = useState(0);
  const [run, setRun] = useState(0);
  const [done, setDone] = useState(false);
  const [garmentIdx, setGarmentIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [printIdx, setPrintIdx] = useState<number | null>(null);
  const [ordered, setOrdered] = useState(false);
  const [aim, setAim] = useState('canvas');
  const [pressed, setPressed] = useState(false);
  const [arrived, setArrived] = useState(false);
  const [clicks, setClicks] = useState(0);
  const [acted, setActed] = useState(false);
  const [cursor, setCursor] = useState<{ x: number; y: number } | null>(null);

  const [inView, setInView] = useState(false);
  const [tabVisible, setTabVisible] = useState(true);
  const [reduced, setReduced] = useState(false);
  const [hover, setHover] = useState(false);
  const [focus, setFocus] = useState(false);
  const [touchHold, setTouchHold] = useState(false);
  const touchTimer = useRef<number>();
  const hoverTimer = useRef<number>();

  const animate = inView && tabVisible && !reduced;
  const hold = hover || focus || touchHold;

  const apply = useCallback((s: number, k: number) => {
    if (s === 0) setGarmentIdx(garmentOrder[k % garments.length]);
    if (s === 1) setColorIdx(colorOrder[k % colors.length]);
    if (s === 2) setPrintIdx(k % prints.length);
    if (s === 3) setOrdered(true);
    setActed(true);
  }, []);

  const go = useCallback(
    (next: number) => {
      window.clearTimeout(hoverTimer.current);
      setStep(next);
      setRun((r) => r + 1);
      setDone(false);
      setActed(false);
      if (next < 3) setOrdered(false);
      if (reduced) apply(next, loop);
    },
    [apply, loop, reduced],
  );

  const tap = (next: number) => {
    go(next);
    setTouchHold(true);
    window.clearTimeout(touchTimer.current);
    touchTimer.current = window.setTimeout(() => setTouchHold(false), 6000);
  };

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => setReduced(media.matches);
    sync();
    media.addEventListener('change', sync);
    const onVisibility = () => setTabVisible(!document.hidden);
    document.addEventListener('visibilitychange', onVisibility);
    const observer = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    if (rootRef.current) observer.observe(rootRef.current);
    return () => {
      media.removeEventListener('change', sync);
      document.removeEventListener('visibilitychange', onVisibility);
      observer.disconnect();
      window.clearTimeout(touchTimer.current);
      window.clearTimeout(hoverTimer.current);
    };
  }, []);

  useEffect(() => {
    if (!reduced) return;
    setStep(3);
    setGarmentIdx(poster.garment);
    setColorIdx(poster.color);
    setPrintIdx(poster.print);
    setOrdered(poster.ordered);
    setActed(true);
  }, [reduced]);

  // Один шаг: курсор едет к цели, нажимает, вещь меняется; дальше — когда шаг дослушан и витрину не держат
  useEffect(() => {
    if (!animate) return;
    const timers = [
      window.setTimeout(() => {
        setArrived(false);
        setAim(targetFor(step, loop));
      }, beat.start),
      window.setTimeout(() => setArrived(true), beat.arrive),
      window.setTimeout(() => {
        setPressed(true);
        setClicks((n) => n + 1);
      }, beat.move),
      window.setTimeout(() => {
        setPressed(false);
        apply(step, loop);
      }, beat.move + beat.press),
      window.setTimeout(() => setDone(true), beat.step),
    ];
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      setPressed(false);
    };
  }, [animate, apply, step, loop, run]);

  useEffect(() => {
    if (!done || hold || !animate) return;
    setDone(false);
    setActed(false);
    if (step === 3) {
      setLoop((k) => k + 1);
      setOrdered(false);
    }
    setStep((step + 1) % railSteps.length);
  }, [done, hold, animate, step]);

  // Курсор меряет цель по месту: видимый элемент с этой меткой, в компактном и полном виде разные
  useLayoutEffect(() => {
    const box = windowRef.current;
    if (!box) return;
    const measure = () => {
      const el = [...box.querySelectorAll<HTMLElement>(`[data-target="${aim}"]`)].find((n) => n.getClientRects().length > 0);
      if (!el) return;
      const b = box.getBoundingClientRect();
      const r = el.getBoundingClientRect();
      const x = el.dataset.aim === 'start' ? r.left + Math.min(28, r.width / 2) : r.left + r.width / 2;
      // Окно может быть ещё наклонено и уменьшено, пока «ложится» при скролле: переводим экранные пиксели в свои
      const sx = b.width / box.offsetWidth;
      const sy = b.height / box.offsetHeight;
      setCursor({ x: (x - b.left) / sx, y: (r.top + r.height / 2 - b.top) / sy });
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    return () => ro.disconnect();
  }, [aim, step]);

  const garment = garments[garmentIdx];
  const color = colors[colorIdx];
  const print = printIdx === null ? null : prints[printIdx];
  const onMouse = (value: boolean) => (e: React.PointerEvent) => {
    if (e.pointerType === 'mouse') setHover(value);
  };
  const sheet = step < 2 ? 'garments' : step === 2 ? 'prints' : 'order';
  // Цель курсора: подсвечена, когда курсор доехал, и поджата, пока он нажимает
  const mark = (target: string) => ({
    'data-target': target,
    'data-hover': (arrived && aim === target) || undefined,
    'data-press': (pressed && aim === target) || undefined,
  });
  const reached = (i: number) => i < step || (i === step && acted);
  // Что выбрано на каждом шаге: показываем в карточке шага, когда в окне на это нажали
  const picked = [
    reached(0) && garment.one,
    reached(1) && (
      <>
        <span className={styles.stepChipDot} style={{ background: color.hex }} />
        {color.name}
      </>
    ),
    reached(2) && print !== null && 'Готовый принт',
    ordered && 'В корзине',
  ];
  const printTile = (
    <span className={styles.tile} {...mark('prints')} data-on={(print !== null && step >= 2) || undefined}>
      <Icon name="image" size={18} />
      Готовые принты
    </span>
  );
  const orderButton = (
    <span className={styles.orderBtn} {...mark('order')} data-on={ordered || undefined}>
      {ordered ? (
        <>
          <Icon name="checkMark" size={14} stroke={2} />В корзине
        </>
      ) : (
        'В корзину'
      )}
    </span>
  );

  return (
    <div
      ref={rootRef}
      className={styles.row}
      data-step={step}
      onPointerEnter={onMouse(true)}
      onPointerLeave={onMouse(false)}
      onFocusCapture={() => setFocus(true)}
      onBlurCapture={(e) => !e.currentTarget.contains(e.relatedTarget) && setFocus(false)}
    >
      <div className={styles.rail}>
        <div className={styles.stepsBox} style={{ '--step': step } as React.CSSProperties}>
          <span className={styles.glow} aria-hidden="true">
            <span
              key={`${step}-${run}`}
              className={styles.progress}
              data-paused={!animate || undefined}
              style={{ '--beat': `${beat.step}ms` } as React.CSSProperties}
            />
          </span>
          <ol className={styles.steps}>
            {railSteps.map(({ title, text }, i) => (
              <li key={title} className={styles.stepItem}>
                <button
                  type="button"
                  className={[styles.step, i === step && styles.stepOn, i !== step && reached(i) && styles.stepDone].filter(Boolean).join(' ')}
                  aria-current={i === step ? 'step' : undefined}
                  onPointerEnter={(e) => {
                    if (e.pointerType !== 'mouse' || i === step) return;
                    window.clearTimeout(hoverTimer.current);
                    hoverTimer.current = window.setTimeout(() => go(i), HOVER_INTENT_MS);
                  }}
                  onPointerLeave={() => window.clearTimeout(hoverTimer.current)}
                  onFocus={() => i !== step && go(i)}
                  onClick={() => tap(i)}
                >
                  <span className={styles.stepNum} aria-hidden="true">
                    {i !== step && reached(i) ? <Icon name="checkMark" size={14} stroke={2} /> : i + 1}
                  </span>
                  <span className={styles.stepTitle}>{title}</span>
                  {picked[i] && (
                    <span className={styles.stepChip} aria-hidden="true">
                      {picked[i]}
                    </span>
                  )}
                  <span className={styles.stepHint}>{text}</span>
                </button>
              </li>
            ))}
          </ol>
        </div>
        <MoreLink href={href} size="l" stretch>
          Открыть конструктор
        </MoreLink>
      </div>

      <div className={styles.frame}>
        <div
          ref={windowRef}
          className={styles.window}
          role="img"
          aria-label={`Конструктор: ${garment.name.toLowerCase()}, цвет — ${color.name.toLowerCase()}${print ? ', с принтом' : ''}`}
        >
          <div className={styles.bar} aria-hidden="true">
            {['Выбери вещь', 'Нанеси принт', 'Положи в корзину'].map((label, i) => {
              const current = i === (step < 2 ? 0 : step - 1);
              return (
                <span key={label} className={current ? `${styles.barStep} ${styles.barStepOn}` : styles.barStep}>
                  <span className={styles.barNum}>{i + 1}</span>
                  {label}
                </span>
              );
            })}
          </div>

          <div className={styles.panes} aria-hidden="true">
            <div className={styles.left}>
              <span className={styles.paneCaption}>Изделие</span>
              <ul className={styles.list}>
                {garments.map((g, i) => (
                  <li
                    key={g.id}
                    className={i === garmentIdx ? `${styles.item} ${styles.itemOn}` : styles.item}
                    {...mark(`garment-${g.id}`)}
                    data-aim="start"
                  >
                    <Icon name={g.icon} size={22} />
                    {g.name}
                  </li>
                ))}
              </ul>
              <span className={styles.paneCaption}>Модель</span>
              <span className={styles.filler} />
              <span className={styles.filler} />
            </div>

            <div className={styles.center} data-target="canvas">
              <ul className={styles.sides}>
                {sideLabels.map((label, i) => (
                  <li key={label} className={i === 0 ? `${styles.side} ${styles.sideOn}` : styles.side}>
                    {label}
                  </li>
                ))}
              </ul>
              <div className={styles.scene}>
                {garments.map((g, i) => (
                  <div key={g.id} className={i === garmentIdx ? `${styles.layer} ${styles.layerOn}` : styles.layer}>
                    <div className={styles.tint} style={{ '--tint': color.hex, '--mock': `url(${g.file})` } as React.CSSProperties} />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={g.file} alt="" className={styles.shade} draggable={false} />
                    {print && (
                      <div
                        className={styles.zone}
                        style={{ left: `${g.zone.x * 100}%`, top: `${g.zone.y * 100}%`, width: `${g.zone.w * 100}%`, height: `${g.zone.h * 100}%` }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img key={print.id} src={isLight(color.hex) ? print.light : print.dark} alt="" className={styles.print} draggable={false} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <ul className={styles.swatches}>
                {colors.map((c, i) => (
                  <li
                    key={c.name}
                    className={i === colorIdx ? `${styles.swatch} ${styles.swatchOn}` : styles.swatch}
                    style={{ background: c.hex }}
                    {...mark(`color-${i}`)}
                  />
                ))}
              </ul>
            </div>

            <div className={styles.right}>
              <span className={styles.paneCaption}>Принт · перед</span>
              <span className={styles.upload}>
                <Icon name="upload" size={20} />
                Загрузить картинку
              </span>
              <span className={styles.tiles}>
                {printTile}
                <span className={styles.tile}>
                  <Icon name="textFont" size={18} />
                  Добавить текст
                </span>
              </span>
              <span className={styles.methodsGroup}>
                <span className={styles.paneCaption}>Нанесение</span>
                <span className={styles.methods}>
                  <span className={styles.method}>DTG</span>
                  <span className={`${styles.method} ${styles.methodOn}`}>DTF</span>
                </span>
              </span>
              <span className={styles.total}>
                <span className={styles.totalFiller} />
                {orderButton}
              </span>
            </div>

            <div className={styles.sheet}>
              <div key={sheet} className={styles.sheetSlide}>
                {sheet === 'garments' && (
                  <ul className={styles.chips}>
                    {garments.map((g, i) => (
                      <li key={g.id} className={i === garmentIdx ? `${styles.chip} ${styles.chipOn}` : styles.chip} {...mark(`garment-${g.id}`)}>
                        <Icon name={g.icon} size={22} />
                      </li>
                    ))}
                  </ul>
                )}
                {sheet === 'prints' && (
                  <span className={styles.tiles}>
                    {printTile}
                    <span className={styles.tile}>
                      <Icon name="textFont" size={18} />
                      Добавить текст
                    </span>
                  </span>
                )}
                {sheet === 'order' && <span className={styles.total}>{orderButton}</span>}
              </div>
            </div>
          </div>

          <div className={ordered ? `${styles.toast} ${styles.toastOn}` : styles.toast} aria-hidden="true">
            <span className={styles.toastIcon}>
              <Icon name="checkMark" size={18} />
            </span>
            <span className={styles.toastText}>
              <span className={styles.toastTitle}>Добавлено в корзину</span>
              <span className={styles.toastHint}>Цена окончательная&nbsp;— осталось оформить заказ</span>
            </span>
          </div>

          {cursor && !reduced && (
            <span
              className={pressed ? `${styles.cursor} ${styles.cursorDown}` : styles.cursor}
              style={{ transform: `translate(${cursor.x}px, ${cursor.y}px)` }}
              aria-hidden="true"
            >
              <svg className={styles.arrow} width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M5 3l14 8.2-6.1 1.3L10 18.6z" />
              </svg>
              <span className={styles.touch} />
              {clicks > 0 && <span key={clicks} className={styles.ripple} />}
            </span>
          )}
        </div>
        <Link href={href} className={styles.cover} aria-label="Открыть конструктор" />
      </div>
    </div>
  );
};

export default ConstructorLive;
