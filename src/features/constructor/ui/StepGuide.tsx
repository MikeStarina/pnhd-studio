'use client';
import { Icon } from './icons';
import g from './guide.module.css';

export type GuideStep = 1 | 2 | 3;

const STEPS: Array<{ n: GuideStep; title: string; note: string }> = [
  { n: 1, title: 'Выбери вещь', note: 'модель и цвет слева' },
  { n: 2, title: 'Нанеси принт', note: 'картинка, текст или готовый принт' },
  { n: 3, title: 'Положи в корзину', note: 'размеры и цена справа' },
];

/**
 * Шаги над конструктором (десктоп): одна строка [1]——[2]——[3]. Пройденные — с галочкой, текущий выделен.
 * Подсказка к шагу видна только на широком экране. Нажатие на шаг показывает, где он делается.
 */
export function StepGuide({ active, done, onStep }: {
  active: GuideStep;
  done: (n: GuideStep) => boolean;
  onStep: (n: GuideStep) => void;
}) {
  return (
    <nav className={g.guide} aria-label="Как заказать">
      <ol className={g.strip}>
        {STEPS.map(({ n, title, note }, i) => {
          const isDone = done(n);
          return (
            <li key={n} className={g.item}>
              {i > 0 && <span className={g.line} data-done={done(STEPS[i - 1].n) ? '' : undefined} aria-hidden />}
              <button
                type="button" className={g.step} onClick={() => onStep(n)}
                aria-current={active === n ? 'step' : undefined}
                data-active={active === n ? '' : undefined} data-done={isDone ? '' : undefined}
              >
                <span className={g.num}>{isDone ? <Icon name="checkMark" size={16} /> : n}</span>
                <span className={g.stepTitle}>{title}</span>
                <span className={g.note}>{note}</span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
