import type { Side } from '../model/types';

/**
 * Анимация «поворота» изделия при смене стороны. Мокапы плоские, поэтому поворот имитируется одной
 * непрерывной дугой: прежняя сторона (снимок) доворачивается до ребра, затемняясь и приближаясь, а из ребра
 * выходит новая. В каждый момент виден один непрозрачный слой.
 * Двигаются только HTML-элементы поверх холста (transform, opacity — без filter: его Safari перерисовывает
 * на каждом кадре, и на телефоне поворот дёргается): сцена Konva, экспорт и
 * файл печати не затрагиваются, раскладка не пересчитывается.
 */

/** Азимут стороны: обходим изделие по кругу, перед → левый рукав → спина → правый рукав. */
const AZIMUTH: Record<Side, number> = { front: 0, pocket: 0, sleeve_left: 90, back: 180, sleeve_right: 270 };

const QUARTER_MS = 480;
const HALF_MS = 580;
const SAFETY_MS = 400;
/** Сколько ждать загрузки новой стороны на ребре поворота, мс. */
const MAX_HOLD_MS = 1500;
const PERSPECTIVE = 'perspective(1000px)';
const EASING = 'cubic-bezier(.45,.05,.25,1)';

/** Карман виден на том же мокапе, что и перед: между ними не поворачиваемся. */
export const sameView = (from: Side, to: Side) => AZIMUTH[from] === AZIMUTH[to];

/** +1 — поворачиваемся к тому, что справа на экране; −1 — к тому, что слева. Разворот на 180° — вправо. */
export function turnSign(from: Side, to: Side): 1 | -1 {
  const d = ((AZIMUTH[to] - AZIMUTH[from] + 540) % 360) - 180;
  return d < 0 ? -1 : 1;
}

export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

export const isHalfTurn = (from: Side, to: Side) => Math.abs(AZIMUTH[to] - AZIMUTH[from]) === 180;

/** Поза, в которой застал повторный клик прерванный поворот: следующий начинается с неё, без скачка. */
let lastPose: { transform: string; at: number } | null = null;

type Frame = Keyframe & { offset: number };

/**
 * Запускает поворот: `oldEl` — снимок прежней стороны (поверх холста), `newEl` — контейнер холста.
 * Возвращает отмену и обещание конца анимации (завершается и по страховочному таймеру).
 */
export function playTurn(
  oldEl: HTMLElement,
  newEl: HTMLElement,
  sign: 1 | -1,
  half: boolean,
  /** Новая сторона готова (мокап и картинки загружены); `draw` — синхронно дорисовать холст. До этого ребро не проходим. */
  gate?: { ready: () => boolean; draw: () => void },
) {
  const D = half ? HALF_MS : QUARTER_MS;
  const EDGE = 88;
  // Один непрозрачный слой в каждый момент: прежняя сторона доворачивается до ребра и исчезает,
  // ровно в этот момент из ребра выходит новая. Перекрёстной прозрачности нет.
  const tf = (deg: number, s: number, x: number) => `${PERSPECTIVE} translateX(${x}px) rotateY(${deg}deg) scale(${s})`;
  const timing: KeyframeAnimationOptions = { duration: D, easing: 'linear', fill: 'both' };
  const easeIn = 'cubic-bezier(.5,0,.85,.55)';
  const easeOut = 'cubic-bezier(.15,.45,.5,1)';

  // Повторный клик посреди поворота, когда новая сторона уже выходит: продолжаем с её позы без скачка.
  let pose: { transform: string } | null = null;
  if (lastPose && performance.now() - lastPose.at < 80) pose = lastPose;
  lastPose = null;

  const oldFrames: Frame[] = [
    { offset: 0, transform: pose?.transform ?? tf(0, 1, 0), opacity: 1, easing: easeIn },
    { offset: 0.499, transform: tf(-sign * EDGE, 1.1, -sign * 14), opacity: 1 },
    { offset: 0.5, transform: tf(-sign * EDGE, 1.1, -sign * 14), opacity: 0 },
    { offset: 1, transform: tf(-sign * EDGE, 1.1, -sign * 14), opacity: 0 },
  ];
  const newFrames: Frame[] = [
    { offset: 0, transform: tf(sign * EDGE, 1.1, sign * 14), opacity: 0 },
    { offset: 0.499, transform: tf(sign * EDGE, 1.1, sign * 14), opacity: 0 },
    { offset: 0.5, transform: tf(sign * EDGE, 1.1, sign * 14), opacity: 1, easing: easeOut },
    { offset: 1, transform: tf(0, 1, 0), opacity: 1 },
  ];

  const out = oldEl.animate(oldFrames, timing);
  const inn = newEl.animate(newFrames, timing);
  const timers: number[] = [];

  let done = false;
  let raf = 0;
  let resolveFinish: () => void = () => {};
  const finished = new Promise<void>((r) => { resolveFinish = r; });

  const cleanup = () => {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    cancelAnimationFrame(raf);
    // cancel() возвращает элементу обычный вид (opacity 1) — прежняя сторона мигнула бы до удаления снимка.
    oldEl.style.visibility = 'hidden';
    out.cancel();
    inn.cancel();
  };

  // Ребро (середина анимации): если новая сторона ещё грузится, ждём на нём, а не показываем прежний мокап.
  const edgeMs = D * 0.49;
  let held = false;
  let heldAt = 0;
  const watch = () => {
    if (done) return;
    if (!held && gate && Number(inn.currentTime ?? 0) >= edgeMs && !gate.ready()) {
      held = true;
      heldAt = Date.now();
      inn.currentTime = edgeMs; out.currentTime = edgeMs;
      inn.pause(); out.pause();
    }
    // Картинка могла не загрузиться — на ребре ждём не дольше MAX_HOLD_MS, иначе холст остался бы пустым.
    if (held && (gate!.ready() || Date.now() - heldAt > MAX_HOLD_MS)) {
      held = false;
      gate!.draw();
      // Дать Konva выложить кадр, и только потом выходить из ребра.
      requestAnimationFrame(() => requestAnimationFrame(() => { if (!done) { inn.play(); out.play(); } }));
      return;
    }
    raf = requestAnimationFrame(watch);
  };
  if (gate) raf = requestAnimationFrame(watch);

  const finish = () => { cleanup(); resolveFinish(); };
  inn.finished.then(finish, () => {});
  // Страховка: вкладка в фоне или анимацию отменили снаружи — слой снимка не должен зависнуть.
  const guard = () => {
    // Поставленную на паузу (отладка) не трогаем.
    if (inn.playState === 'paused' || held) timers.push(window.setTimeout(guard, SAFETY_MS));
    else finish();
  };
  timers.push(window.setTimeout(guard, D + SAFETY_MS));

  return {
    finished,
    cancel: () => {
      // Новая сторона уже выходит (вторая половина) — запоминаем её позу, следующий поворот продолжит её.
      if (!done && inn.playState === 'running') {
        const cs = getComputedStyle(newEl);
        if (Number(cs.opacity) > 0.5 && cs.transform !== 'none') lastPose = { transform: cs.transform, at: performance.now() };
      }
      cleanup();
      resolveFinish();
    },
  };
}
