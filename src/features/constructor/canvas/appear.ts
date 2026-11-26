import Konva from 'konva';

/** Длительность появления нового слоя, мс. */
const APPEAR_MS = 350;

/**
 * Появление нового слоя: прозрачность 0→1 и масштаб 0.92→1 от центра слоя.
 * Узел сразу становится невидимым (до первой отрисовки), анимация стартует, когда слой готов.
 * `finish` мгновенно доводит узел до конечного состояния — перед снимком и экспортом.
 */
export function appearNode(node: Konva.Node, isReady: () => boolean, onEnd: () => void) {
  const p0 = { x: node.x(), y: node.y() };
  const rot = (node.rotation() * Math.PI) / 180;
  // Центр слоя относительно точки (x, y) при масштабе 1.
  const vx = node.width() / 2 - node.offsetX();
  const vy = node.height() / 2 - node.offsetY();
  const rx = vx * Math.cos(rot) - vy * Math.sin(rot);
  const ry = vx * Math.sin(rot) + vy * Math.cos(rot);
  const place = (s: number) => node.position({ x: p0.x + rx * (1 - s), y: p0.y + ry * (1 - s) });
  const FROM = 0.92;

  node.opacity(0);
  node.scale({ x: FROM, y: FROM });
  place(FROM);

  let tween: Konva.Tween | null = null;
  let timer = 0;
  let ended = false;
  const started = Date.now();

  const end = () => {
    if (ended) return;
    ended = true;
    clearTimeout(timer);
    tween?.destroy();
    node.opacity(1);
    node.scale({ x: 1, y: 1 });
    // Если слой успели перетащить — положение не трогаем.
    if (!node.isDragging()) node.position(p0);
    node.getLayer()?.batchDraw();
    onEnd();
  };

  const start = () => {
    if (ended) return;
    if (!node.getParent()) return end();
    tween = new Konva.Tween({
      node,
      duration: APPEAR_MS / 1000,
      easing: Konva.Easings.EaseOut,
      opacity: 1,
      scaleX: 1,
      scaleY: 1,
      onUpdate: () => { if (node.getParent()) place(node.scaleX()); },
      onFinish: end,
    });
    tween.play();
    // Страховка: в фоновой вкладке кадры не идут — слой не должен остаться невидимым.
    timer = window.setTimeout(end, APPEAR_MS + 600);
  };

  const wait = () => {
    if (ended) return;
    if (isReady() || Date.now() - started > 2000) start();
    else timer = window.setTimeout(wait, 30);
  };
  wait();

  return { finish: end };
}
