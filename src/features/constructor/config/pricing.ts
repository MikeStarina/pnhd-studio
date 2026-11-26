import type { PrintMethod } from '../model/types';

/**
 * Прайсы нанесения. Цена — за один принт (одну сторону одного изделия).
 * Формат подбирается автоматически: самый маленький, в который принт помещается (можно повернуть).
 * ВРЕМЕННО: оба прайса требуют подтверждения.
 */
export type PrintFormat = 'Mini' | 'A6' | 'A5' | 'A4' | 'A3' | 'A3+';

export interface FormatPrice {
  name: PrintFormat;
  /** Размер формата в сантиметрах. */
  w: number;
  h: number;
  /** Цены по ступеням тиража (индекс — как в `tiers`): на белой ткани и на цветной. */
  white: number[];
  colored: number[];
}

export interface PriceList {
  /** От скольких штук (суммарно по заявке) действует каждая ступень цены. */
  tiers: number[];
  /** Форматы по возрастанию. */
  formats: FormatPrice[];
}

/** Цена не зависит от цвета ткани. */
const anyFabric = (name: PrintFormat, w: number, h: number, prices: number[]): FormatPrice => ({
  name, w, h, white: prices, colored: prices,
});
/** Одна цена на любой тираж: на белом / на цветном. */
const flat = (name: PrintFormat, w: number, h: number, white: number, colored: number): FormatPrice => ({
  name, w, h, white: [white], colored: [colored],
});

/** DTF со скидкой за тираж: цена принта вместе с прижимом. */
export const PRICE_TIERED: PriceList = {
  tiers: [1, 10, 20, 35, 50, 80, 100],
  formats: [
    anyFabric('Mini', 8, 8, [400, 300, 250, 200, 180, 160, 150]),
    anyFabric('A6', 10, 15, [450, 350, 300, 270, 250, 230, 200]),
    anyFabric('A5', 15, 20, [550, 450, 400, 350, 320, 290, 260]),
    anyFabric('A4', 20, 30, [700, 620, 550, 500, 420, 400, 380]),
    anyFabric('A3', 30, 42, [850, 800, 750, 720, 690, 660, 600]),
    anyFabric('A3+', 40, 45, [1050, 1000, 900, 860, 830, 800, 750]),
  ],
};

/** Таблица с главной studio.pnhd.ru (блок «Срочная печать», ноябрь 2026): без скидок за тираж. */
export const PRICE_SITE: PriceList = {
  tiers: [1],
  formats: [
    flat('A6', 10.5, 14.8, 400, 500),
    flat('A5', 14.8, 21, 500, 650),
    flat('A4', 21, 29.7, 650, 800),
    flat('A3', 29.7, 42, 800, 900),
    flat('A3+', 32.9, 48.3, 900, 1100),
  ],
};

/**
 * Какой прайс действует для DTF: `tiered` (по умолчанию) — со ступенями тиража, `site` — таблица с главной.
 * Переключается переменной NEXT_PUBLIC_PRICE_SOURCE. Для DTG ступеней нет — всегда таблица с главной.
 */
export const DTF_PRICE_SOURCE: 'tiered' | 'site' = process.env.NEXT_PUBLIC_PRICE_SOURCE === 'site' ? 'site' : 'tiered';

export function priceListFor(method: PrintMethod): PriceList {
  return method === 'dtf' && DTF_PRICE_SOURCE === 'tiered' ? PRICE_TIERED : PRICE_SITE;
}

/**
 * Цена «на белом» — только для белой ткани: все каналы цвета не ниже порога.
 * Светлые цветные (молочный, розовый, серый) считаются по цене «на цветном».
 */
export const WHITE_MIN_CHANNEL = 240;

export const METHOD_INFO: Record<PrintMethod, { title: string; hint: string }> = {
  dtg: {
    title: 'DTG — прямая печать',
    hint: 'Мягкий принт, лучше всего на белом и светлом хлопке. Фотографии и градиенты.',
  },
  dtf: {
    title: 'DTF — плёнка',
    hint: 'Яркие насыщенные цвета на любом цвете ткани. Чёткие контуры и мелкие детали.',
  },
};
