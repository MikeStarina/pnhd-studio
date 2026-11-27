/**
 * События воронки конструктора. Уходят через единую аналитику сайта (components/site/analytics.ts):
 * цель в Метрику, без счётчика — в консоль.
 */
import {
  ANALYTICS_OFF_KEY, analyticsAllowed, readEntry, track as sendGoal,
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
  | 'cart_add'
  | 'order_send'
  | 'order_success'
  | 'order_error';

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

