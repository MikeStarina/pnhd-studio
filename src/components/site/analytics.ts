/**
 * Единая аналитика сайта: один счётчик Яндекс Метрики, одна функция `track`, типизированные цели,
 * отказ от аналитики и электронная коммерция.
 */

/** Счётчик Яндекс Метрики: id из NEXT_PUBLIC_YM_COUNTER_ID, без переменной — счётчик сайта. Его же ставит загрузчик в layout. */
export const METRIKA_ID = Number(process.env.NEXT_PUBLIC_YM_COUNTER_ID) || 86217584;

/** Отказ от аналитики: посетитель нажал «Отказаться» в уведомлении о cookie. Ключ читают события и загрузчики в layout. */
export const ANALYTICS_OFF_KEY = 'pinhead_analytics_off';

/** Посетитель уже ответил на уведомление о cookie (ключ остался от прежней плашки — ответившим её не показываем). */
export const COOKIE_SEEN_KEY = 'COOKIE_AGREEMENT';

/** Цели конструктора: идентификатор в счётчике. Часть заведена под своими именами (см. GOAL_NAME в constructor/analytics/events.ts). */
export type ConstructorGoal =
  | 'constructor_open' | 'garment_select' | 'color_select' | 'design_upload' | 'image_crop' | 'image_shape'
  | 'text_add' | 'template_apply' | 'side_switch' | 'size_set' | 'sizes_copy' | 'color_remove'
  | 'order_form_open' | 'order_form_error' | 'order_form_close' | 'order_send' | 'order_submit' | 'order_send_error' | 'pdf_download';

/** Цели сайта вне конструктора. */
export type SiteGoal =
  | 'cta_constructor_click' // «Нанести принт» и другие ссылки на конструктор
  | 'print_cta_click' // «Нанести принт» с карточки и страницы товара: ссылка на конструктор с ?product=
  | 'phone_click' | 'email_click' | 'telegram_click' | 'whatsapp_click' | 'vk_click'
  | 'cart_open'
  | 'lead_submit' | 'lead_error'
  | 'add_to_cart' | 'catalog_filter_apply' | 'gallery_open' | 'size_chart_open'; // ставит страница каталога и товара

export type Goal = ConstructorGoal | SiteGoal;
export type GoalParams = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    ym?: (id: number, method: string, ...args: unknown[]) => void;
    dataLayer?: unknown[];
  }
}

export function analyticsAllowed(): boolean {
  try {
    return typeof window !== 'undefined' && localStorage.getItem(ANALYTICS_OFF_KEY) !== '1';
  } catch {
    return true; // хранилище недоступно — отказ запомнить негде
  }
}

/** Одна и та же цель с теми же параметрами дважды за это время — повтор (двойной клик, повторный запуск эффекта в StrictMode). */
const REPEAT_MS = 400;
const lastSent = new Map<string, number>();
/** Цели, которые по смыслу уходят один раз на ключ (например, успех заявки — на номер заказа). */
const sentOnce = new Set<string>();

const clean = (params?: GoalParams) =>
  params && Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ''));

/** Отправляет цель в Метрику. Без счётчика — в консоль (кроме production). Никогда не бросает. */
export function track(goal: Goal, params?: GoalParams, once?: string): boolean {
  try {
    if (typeof window === 'undefined' || !analyticsAllowed()) return false;
    if (once) {
      if (sentOnce.has(`${goal}:${once}`)) return false;
      sentOnce.add(`${goal}:${once}`);
    } else {
      const key = `${goal}:${JSON.stringify(params ?? {})}`;
      const now = Date.now();
      if (now - (lastSent.get(key) ?? 0) < REPEAT_MS) return false;
      lastSent.set(key, now);
    }
    const data = clean(params);
    if (window.ym) window.ym(METRIKA_ID, 'reachGoal', goal, data);
    else if (process.env.NODE_ENV !== 'production') console.debug('[analytics]', goal, data ?? '');
    return true;
  } catch {
    return false; // аналитика не должна ломать интерфейс
  }
}

/** Откуда посетитель пришёл в конструктор: запоминается на сессию и добавляется к его целям и к заявке. */
export interface Entry { source: string; product?: string; block?: string }
const ENTRY_KEY = 'pinhead_entry';

export function rememberEntry(entry: Entry) {
  try {
    sessionStorage.setItem(ENTRY_KEY, JSON.stringify(entry));
  } catch {
    // приватный режим — источник потеряется при перезагрузке
  }
}

/** Источник входа в конструктор; без запомненного — «прямой заход» или внешний переход. */
export function readEntry(): Entry {
  if (typeof window === 'undefined') return { source: 'direct' };
  try {
    const raw = sessionStorage.getItem(ENTRY_KEY);
    if (raw) return JSON.parse(raw) as Entry;
  } catch {
    // хранилище недоступно или в нём мусор
  }
  return { source: document.referrer && !document.referrer.startsWith(location.origin) ? 'external' : 'direct' };
}

/** ClientID Метрики: связывает заявку с визитом для офлайн-конверсий. Пустая строка — счётчик не ответил. */
export function getClientId(timeoutMs = 1000): Promise<string> {
  return new Promise((resolve) => {
    try {
      if (typeof window === 'undefined' || !window.ym || !analyticsAllowed()) return resolve('');
      const timer = setTimeout(() => resolve(''), timeoutMs);
      window.ym(METRIKA_ID, 'getClientID', (id: unknown) => {
        clearTimeout(timer);
        resolve(typeof id === 'string' ? id : '');
      });
    } catch {
      resolve('');
    }
  });
}

/** Электронная коммерция Метрики (ecommerce: "dataLayer" в счётчике). Цена и валюта — в рублях. */
export interface EcomProduct { id: string; name: string; price: number; quantity?: number; variant?: string; category?: string }

const pushEcommerce = (ecommerce: Record<string, unknown>) => {
  try {
    if (typeof window === 'undefined' || !analyticsAllowed()) return;
    window.dataLayer = window.dataLayer ?? [];
    window.dataLayer.push({ ecommerce: { currencyCode: 'RUB', ...ecommerce } });
  } catch {
    // аналитика не должна ломать интерфейс
  }
};

/** Просмотр страницы товара. */
export const trackDetail = (product: EcomProduct) => pushEcommerce({ detail: { products: [product] } });
/** Товар добавлен в корзину. */
export const trackAdd = (product: EcomProduct) => pushEcommerce({ add: { products: [product] } });
/** Товар убран из корзины. */
export const trackRemove = (product: EcomProduct) => pushEcommerce({ remove: { products: [product] } });
/** Покупка: на номер заказа уходит один раз. */
export function trackPurchase(order: { id: string; revenue: number; products: EcomProduct[] }) {
  if (sentOnce.has(`purchase:${order.id}`)) return;
  sentOnce.add(`purchase:${order.id}`);
  pushEcommerce({ purchase: { actionField: { id: order.id, revenue: order.revenue }, products: order.products } });
}
