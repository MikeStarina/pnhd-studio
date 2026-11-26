/**
 * События воронки конструктора. Уходят через единую аналитику сайта (components/site/analytics.ts):
 * цель в Метрику, без счётчика — в консоль. Перечень целей — docs/ANALYTICS.md.
 */
import {
  ANALYTICS_OFF_KEY, analyticsAllowed, readEntry, track as sendGoal, trackPurchase as sendPurchase,
  type ConstructorGoal, type GoalParams,
} from '@/components/site/analytics';

export type FunnelEvent =
  | 'constructor_open'
  | 'garment_select'
  | 'color_select'
  | 'image_upload'
  | 'image_crop'
  | 'image_shape'
  | 'text_add'
  | 'template_apply'
  | 'side_switch'
  | 'size_set'
  | 'sizes_copy'
  | 'color_remove'
  | 'order_form_open'
  | 'cart_add'
  | 'order_form_error'
  | 'order_form_close'
  | 'order_send'
  | 'order_success'
  | 'order_error'
  | 'pdf_download';

export { ANALYTICS_OFF_KEY, analyticsAllowed };

/**
 * Цели, которые в счётчике сайта уже заведены под другими именами: событие → идентификатор цели.
 * Остальные события уходят под своим именем.
 */
const GOAL_NAME: Partial<Record<FunnelEvent, ConstructorGoal>> = {
  image_upload: 'design_upload',
  order_success: 'order_submit',
  order_error: 'order_send_error',
};

/** Событие воронки → цель сайта. К каждой цели добавляются источник входа и изделие из ссылки (для срезов воронки). */
export function track(event: FunnelEvent, params?: GoalParams, once?: string) {
  const { source, product } = readEntry();
  return sendGoal((GOAL_NAME[event] ?? event) as ConstructorGoal, { source, link_product: product, ...params }, once);
}

/** Покупка для электронной коммерции Метрики: на номер заказа уходит один раз. */
export function trackPurchase(order: {
  number: string; total: number; name: string;
  /** Цвета заявки: у каждого своя цена за штуку. */
  items: Array<{ productId: string; color: string; perItem: number; qty: number }>;
}) {
  sendPurchase({
    id: order.number, revenue: order.total,
    products: order.items.map((x) => ({ id: x.productId, name: order.name, variant: x.color, price: x.perItem, quantity: x.qty })),
  });
}
