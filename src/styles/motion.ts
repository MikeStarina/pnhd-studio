// Движение, которое задаётся в JS, а не в CSS. Пара к токенам движения в tokens.css.

// Сколько курсор должен задержаться на пункте, чтобы тот раскрылся: проход мышью по ряду ничего не дёргает
export const HOVER_INTENT_MS = 120;

// Мягкая привязка секций главной: страница доезжает до ближайшей секции, если остановилась рядом с ней.
// Ease-out (кубическая) — то же ощущение, что --ease-out-soft в tokens.css; прокрутка пользователя прерывает доводку
export const SECTION_SNAP = {
  duration: 0.6,
  easing: (t: number) => 1 - (1 - t) ** 3,
  /** Насколько близко к началу секции (доля высоты окна) нужно остановиться, чтобы страница доехала: обычная секция
   *  лишь подправляется, если почти попал; у секции, отмеченной сильной (второй экран главной), — как настоящий шаг */
  threshold: '12%',
  strongThreshold: '45%',
  /** Пауза после последнего движения колеса или тачпада, мс: доводка начинается, когда инерция закончилась */
  debounce: 450,
} as const;

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

/**
 * Пружины Motion (type: 'spring'): насколько перелетает цель. Мягкая — отклик на действие (счётчик количества),
 * упругая — разовый радостный отскок (галочка «Спасибо»). Заменяют кривые linear() для того же в CSS.
 */
export const SPRING_BOUNCE_SOFT = 0.4;
export const SPRING_BOUNCE_ELASTIC = 0.5;
/** Какую часть длительности из токена пружина идёт до цели; остальное — затухание колебаний */
export const SPRING_VISUAL_PART = 0.5;
/** Откуда «выпрыгивает» знак успеха: меньше и с наклоном */
export const POP_FROM = { scale: 0.85, rotate: -12 } as const;
