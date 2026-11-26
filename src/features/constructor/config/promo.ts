import type { GarmentType } from '../model/types';

/**
 * Акция «−50% при заказе через конструктор»: скидка на само изделие из трикотажа, печать — по прайсу.
 * Действует до 00:00 30.11.2026 по Москве. Её применяет общий расчёт цены (model/pricing.ts) — значит,
 * одинаково конструктор, корзина и сервер при приёме заявки. Пока акция идёт, комментарий к заявке
 * из конструктора обязателен: в нём просим отзыв о конструкторе.
 */
export const PROMO_ENDS_AT = Date.parse('2026-11-30T00:00:00+03:00');
export const PROMO_PERCENT = 50;

/** Трикотаж. Шопперы (плотная ткань) и кепки в акцию не входят */
const PROMO_TYPES: GarmentType[] = ['tshirt', 'longsleeve', 'hoodie', 'sweatshirt'];

export const promoActive = (now = Date.now()) => now < PROMO_ENDS_AT;

export const promoAppliesTo = (type: GarmentType, now = Date.now()) => promoActive(now) && PROMO_TYPES.includes(type);

/** Цена изделия за штуку с учётом акции */
export const promoPrice = (price: number, type: GarmentType, now = Date.now()) =>
  promoAppliesTo(type, now) ? Math.round((price * (100 - PROMO_PERCENT)) / 100) : price;

export const PROMO_TEXT = {
  bar: `Скидка ${PROMO_PERCENT}% при оформлении заказа через конструктор`,
  /** В полосе текст идёт после метки «−50%» */
  barLong: 'на трикотаж при оформлении заказа через конструктор',
  barShort: 'на трикотаж в конструкторе',
  badge: `−${PROMO_PERCENT}%`,
  commentLabel: 'Отзыв о конструкторе',
  commentPlaceholder: 'Напиши, пожалуйста, как тебе работа конструктора: что было удобно, что мешало',
  commentHint: `Это условие скидки ${PROMO_PERCENT}%. Сюда же — сроки и пожелания к печати`,
  commentError: 'Напиши пару слов о конструкторе — это условие акции',
  order: `Акция −${PROMO_PERCENT}% на изделие через конструктор (до 30.11)`,
} as const;
