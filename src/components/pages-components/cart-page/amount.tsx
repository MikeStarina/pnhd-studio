'use client';
import React, { useEffect, useRef, useState } from 'react';
import { animate } from 'motion';
import { EASE_OUT_SOFT, motionSeconds } from './motion-tokens';

/**
 * Сумма, которая при изменении докручивается от прежнего значения к новому (--duration-celebrate).
 * В отличие от счётчика в «Цене», сразу показывает настоящее значение — без «0 ₽» до появления на экране.
 * Экранным дикторам — сразу итог.
 */
const Amount: React.FC<{ value: number; format: (value: number) => string }> = ({ value, format }) => {
  const [display, setDisplay] = useState(value);
  const shown = useRef(value);

  useEffect(() => {
    if (shown.current === value) return;
    const controls = animate(shown.current, value, {
      duration: motionSeconds('--duration-celebrate'),
      ease: EASE_OUT_SOFT,
      onUpdate: (latest) => {
        shown.current = latest;
        setDisplay(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <>
      <span aria-hidden="true">{format(display)}</span>
      <span className="visually-hidden">{format(value)}</span>
    </>
  );
};

export default Amount;
