'use client';
import React from 'react';
import { motion, useAnimate } from 'motion/react';
import { Icon } from '@/features/constructor/ui/icons';
import { EASE, motionSeconds, SPRING_BOUNCE_SOFT } from '@/styles/motion';
import styles from './size-stepper.module.css';

/**
 * Строка размера в корзине: «M − N +». Число «подпрыгивает» при каждом нажатии (пружина, прерываемая).
 * label — как назвать строку для экранного чтеца: размер, а у изделия с несколькими цветами — размер и цвет.
 */
const SizeStepper: React.FC<{
  size: string;
  label: string;
  qty: number;
  canDecrease: boolean;
  canIncrease: boolean;
  /** Подсказка на выключенном «−»: последнюю штуку убирает кнопка удаления */
  last?: boolean;
  onChange: (delta: 1 | -1) => void;
}> = ({ size, label, qty, canDecrease, canIncrease, last = false, onChange }) => {
  const [scope, animate] = useAnimate<HTMLSpanElement>();
  const change = (delta: 1 | -1) => {
    onChange(delta);
    animate(scope.current, { scale: [0.85, 1], opacity: [0.4, 1] }, { type: 'spring', visualDuration: motionSeconds('--duration-slow'), bounce: SPRING_BOUNCE_SOFT });
  };

  return (
    <li className={styles.size}>
      <span className={styles.sizeName}>{size}</span>
      <div className={styles.stepper}>
        <motion.button
          type="button"
          className={styles.step}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: motionSeconds('--duration-press'), ease: EASE }}
          aria-label={`Убрать ${label}`}
          disabled={!canDecrease}
          title={last ? 'Последнюю штуку убирает кнопка удаления' : undefined}
          onClick={() => change(-1)}
        >
          <Icon name="minus" size="1.25em" stroke={2} />
        </motion.button>
        <span className={styles.count} aria-live="polite">
          <span ref={scope} className={styles.countValue}>
            {qty}
          </span>
        </span>
        <motion.button
          type="button"
          className={styles.step}
          whileTap={{ scale: 0.88 }}
          transition={{ duration: motionSeconds('--duration-press'), ease: EASE }}
          aria-label={`Добавить ${label}`}
          disabled={!canIncrease}
          onClick={() => change(1)}
        >
          <Icon name="plus" size="1.25em" stroke={2} />
        </motion.button>
      </div>
    </li>
  );
};

export default SizeStepper;
