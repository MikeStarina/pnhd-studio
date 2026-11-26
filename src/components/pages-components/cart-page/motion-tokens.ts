/**
 * Токены движения из tokens.css для Motion: длительность в секундах. При reduced motion токены равны нулю —
 * анимации Motion становятся мгновенными без отдельной проверки.
 */
export const motionSeconds = (name: string): number => {
  if (typeof window === 'undefined') return 0;
  const raw = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  const value = parseFloat(raw);
  if (Number.isNaN(value)) return 0;
  return raw.endsWith('ms') ? value / 1000 : value;
};

export const motionPixels = (name: string): number => {
  if (typeof window === 'undefined') return 0;
  return parseFloat(getComputedStyle(document.documentElement).getPropertyValue(name)) || 0;
};

/** Кривые из tokens.css в виде, понятном Motion */
export const EASE = [0.2, 0, 0, 1] as const; // --ease
export const EASE_IN = [0.4, 0, 1, 1] as const; // --ease-in
export const EASE_OUT_SOFT = [0.22, 1, 0.36, 1] as const; // --ease-out-soft
