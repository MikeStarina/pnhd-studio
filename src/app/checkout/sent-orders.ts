import type { TCartState } from '@/redux/cart-slice/cart.slice';

/**
 * Что из заказа уже принято. Заказ уходит частями (adr/0001): товары каталога — одним заказом, каждое изделие
 * с принтом — своей заявкой. Если часть принята, а следующая сорвалась, повтор шлёт только остальное.
 * Запись живёт в sessionStorage: перезагрузка и возврат из корзины не должны создать второй заказ каталога —
 * его бэкенд повторы не узнаёт.
 */
export interface SentOrders {
  /** id принятого заказа каталога */
  catalog?: string;
  /** Принятые изделия: id позиции → номер заявки */
  designs: Map<string, string>;
  /** Выданные номера заявок: с тем же номером сервер узнаёт повтор */
  numbers: Map<string, string>;
}

const KEY = 'checkout-sent';

interface Stored { cart: string; catalog?: string; designs: Array<[string, string]>; numbers: Array<[string, string]> }

/** Состав товаров каталога: принятый заказ относится только к той корзине, с которой ушёл. */
const cartKey = (order: TCartState['order']) =>
  JSON.stringify((order ?? []).map((elem) => [elem.item._id, elem.item.sizes.map((size) => [size.name, size.userQty ?? 0])]));

export function readSent(order: TCartState['order']): SentOrders {
  const empty: SentOrders = { designs: new Map(), numbers: new Map() };
  try {
    const stored = JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Stored | null;
    if (!stored) return empty;
    return {
      catalog: stored.cart === cartKey(order) ? stored.catalog : undefined,
      designs: new Map(stored.designs),
      numbers: new Map(stored.numbers),
    };
  } catch {
    // Хранилище закрыто или запись битая — работаем как раньше, в памяти страницы.
    return empty;
  }
}

/**
 * Заказ каталога уже принят, а оформление не закончено. Пока так, корзину менять нельзя:
 * принятый заказ узнаётся по её составу, изменённая корзина ушла бы вторым заказом.
 */
export function hasSentCatalog(): boolean {
  try {
    return Boolean((JSON.parse(sessionStorage.getItem(KEY) ?? 'null') as Stored | null)?.catalog);
  } catch {
    return false;
  }
}

export function saveSent(order: TCartState['order'], sent: SentOrders): void {
  const stored: Stored = { cart: cartKey(order), catalog: sent.catalog, designs: [...sent.designs], numbers: [...sent.numbers] };
  try {
    sessionStorage.setItem(KEY, JSON.stringify(stored));
  } catch {
    // Хранилище закрыто — запись остаётся в памяти страницы.
  }
}

const NUMBERS_KEY = 'checkout-numbers';

/** Номера принятых заявок — для страницы «Спасибо»: она открывается новой загрузкой и памяти оформления не видит. */
export function saveOrderNumbers(numbers: string[]): void {
  try {
    sessionStorage.setItem(NUMBERS_KEY, JSON.stringify(numbers));
  } catch {
    // Хранилище закрыто — «Спасибо» покажется без номера.
  }
}

export function readOrderNumbers(): string[] {
  try {
    const stored: unknown = JSON.parse(sessionStorage.getItem(NUMBERS_KEY) ?? '[]');
    return Array.isArray(stored) ? stored.filter((n): n is string => typeof n === 'string') : [];
  } catch {
    return [];
  }
}

export function clearSent(): void {
  try {
    sessionStorage.removeItem(KEY);
  } catch {
    // Нечего очищать.
  }
}
