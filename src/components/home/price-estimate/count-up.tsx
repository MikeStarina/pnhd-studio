'use client';

import React, { useEffect, useRef, useState } from 'react';

/**
 * Число, которое «докручивается» до нового значения: как только показалось на экране — от нуля,
 * при смене (наведение на другой формат) — от прежнего. Экранным дикторам — сразу итоговое значение.
 */
const CountUp: React.FC<{ value: number; format: (value: number) => string }> = ({ value, format }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const shown = useRef(0);
  const [display, setDisplay] = useState(value);
  const [seen, setSeen] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setSeen(true);
    setDisplay(0);
    const io = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) return;
      io.disconnect();
      setSeen(true);
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!seen) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return setDisplay(value);
    const from = shown.current;
    // Длительность — из токена, как у остальных «радостных» моментов
    const duration = parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--duration-celebrate'));
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      // Быстрый разгон и долгое торможение — как у колеса счётчика
      const next = Math.round(from + (value - from) * (1 - Math.pow(1 - t, 4)));
      shown.current = next;
      setDisplay(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [seen, value]);

  return (
    <>
      <span ref={ref} aria-hidden="true">
        {format(display)}
      </span>
      <span className="visually-hidden">{format(value)}</span>
    </>
  );
};

export default CountUp;
