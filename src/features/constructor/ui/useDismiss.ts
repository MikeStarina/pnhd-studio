'use client';
import { useCallback, useEffect, useRef, useState } from 'react';

/** Длительность анимации закрытия окна; совпадает с keyframes в constructor.module.css. */
const LEAVE_MS = 340;

const reducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * Закрытие с анимацией: сначала окно получает признак «уходит» (data-leaving), через LEAVE_MS
 * вызывается настоящий обработчик. Повторные вызовы во время ухода игнорируются.
 */
export function useDismiss() {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timer.current), []);

  const dismiss = useCallback(<A extends unknown[]>(fn: (...args: A) => void, ...args: A) => {
    if (timer.current) return;
    if (reducedMotion()) { fn(...args); return; }
    setLeaving(true);
    timer.current = setTimeout(() => fn(...args), LEAVE_MS);
  }, []);

  return { leaving, dismiss };
}
