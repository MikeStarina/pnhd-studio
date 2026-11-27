'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { actions as designActions } from '@/redux/cart-designs-slice/cart-designs.slice';
import { useDesignPrices } from '@/features/constructor/cart/useDesignPrice';
import { buildDesignOrder, sendDesignOrder } from '@/features/constructor/cart/sendDesign';
import { deleteDesignAssets, getAsset } from '@/features/constructor/cart/assets';
import type { CartDesign } from '@/features/constructor/cart/types';
import { SIDE_LABEL } from '@/features/constructor/model/types';
import { productPhotoSources } from '../utils/product-photos';
import type { OrderContacts } from '@/features/constructor/model/types';
import { PROMO_TEXT, promoAppliesTo } from '@/features/constructor/config/promo';
import { track } from '@/features/constructor/analytics/events';
import MainUserData, { type TCheckoutErrors } from '@/components/pages-components/checkout-page/main-user-data/main-user-data';
import CartCatalogSync from '@/components/pages-components/cart-page/cart-catalog-sync/cart-catalog-sync';
import DeliveryData from '@/components/pages-components/checkout-page/delivery-data/delivery-data';
import { CartEmpty, CartLoading } from '@/components/pages-components/cart-page/cart-state/cart-state';
import { checkoutOrderObjectCreateFunc, getPreviewArrFunc, itemPrintUnitPrice, orderPricing, positionTotals } from '../utils/cart-utils';
import { pickupLine } from '@/features/constructor/config/pickup';
import { useCreateOrderMutation, usePromocodeValidationMutation } from '@/api/api';
import { rub } from '@/components/catalog/data';
import { Icon } from '@/features/constructor/ui/icons';
import { PrintFilesField } from '@/features/constructor/ui/PrintFilesField';
import { telegramNick } from '../utils/telegram';
import { readRoistatVisitId } from '@/components/shared-components/telegram-link/telegram-link';
import { trackPurchase } from '@/components/site/analytics';
import type { TCartState } from '@/redux/cart-slice/cart.slice';
import ConsentField from '@/components/site/consent-field/consent-field';
import Amount from '@/components/pages-components/cart-page/amount';
import { clearOrderSummary, clearSent, readSent, saveOrderNumbers, saveOrderSummary, saveSent, type OrderSummary, type SentOrders } from './sent-orders';
import styles from './page.module.css';
import summary from '@/components/pages-components/cart-page/cart-summary/cart-summary.module.css';
import form from '@/components/pages-components/checkout-page/form/form.module.css';

/**
 * Письмо покупателю со всем заказом (api/orders/confirm). Переход на «Спасибо» его не ждёт: keepalive доносит запрос
 * и после ухода со страницы, а повтор того же оформления сервер второй раз не отправит.
 */
const sendConfirmation = (cart: TCartState, done: SentOrders, delivery: OrderSummary['delivery']) => {
  const order = cart.order ?? [];
  const totals = positionTotals(cart);
  void fetch('/api/orders/confirm', {
    method: 'POST',
    keepalive: true,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: cart.userData.email.trim(),
      designs: [...done.designs.values()],
      catalog: done.catalog && order.length ? {
        id: done.catalog,
        items: order.map((elem, i) => ({
          productId: elem.item._id,
          sizes: Object.fromEntries(elem.item.sizes.filter((s) => (s.userQty ?? 0) > 0).map((s) => [s.name, s.userQty])),
          prints: getPreviewArrFunc(elem.prints).length,
          total: totals[i].discounted,
          fullTotal: totals[i].full,
        })),
      } : null,
      delivery,
    }),
  }).catch(() => undefined);
};

/** Доставка для письма и страницы «Спасибо». Без товаров каталога СДЭК не считается: цену назовёт менеджер. */
const deliverySummary = (cart: TCartState, price: number): OrderSummary['delivery'] => {
  if (!cart.isDelivery) return { kind: 'pickup', text: pickupLine(), price: 0 };
  const text = ['СДЭК', cart.deliveryParams.validCityTo?.city, cart.deliveryParams.validDeliveryPoint?.name].filter(Boolean).join(', ');
  return { kind: 'delivery', text, price: cart.order?.length ? price : null };
};

const sizesText = (sizes: Array<[string, number]>) => sizes.map(([size, n]) => `${size}×${n}`).join(', ');

/** Превью изделия с принтом для «Спасибо»: картинки изделий удаляются вместе с корзиной, поэтому — уменьшенной копией. */
async function previewThumb(asset: string | undefined): Promise<string | undefined> {
  const blob = asset ? await getAsset(asset) : undefined;
  if (!blob) return undefined;
  const bitmap = await createImageBitmap(blob);
  const scale = Math.min(1, 192 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')?.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/webp', 0.85);
}

/** Состав заказа для страницы «Спасибо» — тот же, что в письме покупателю. */
async function orderSummary(
  cart: TCartState, designs: CartDesign[], designPrices: Array<CartDesign['price']>, delivery: OrderSummary['delivery'], total: number,
): Promise<OrderSummary> {
  const designItems = await Promise.all(designs.map(async (design, i) => ({
    name: `${design.garment.name} — свой принт`,
    details: [
      ...designPrices[i].lines.map((line) => `${line.color}: ${sizesText(line.sizes)}`),
      `Печать ${design.method.toUpperCase()}: ${design.sides.map((side) => SIDE_LABEL[side].toLowerCase()).join(', ')}`,
    ],
    qty: designPrices[i].qty,
    total: designPrices[i].total,
    image: await previewThumb(design.previews.find((p) => p.side === 'front')?.asset ?? design.previews[0]?.asset).catch(() => undefined),
  })));
  const totals = positionTotals(cart);
  const catalogItems = (cart.order ?? []).map((elem, i) => {
    const { full, discounted } = totals[i];
    const prints = getPreviewArrFunc(elem.prints).length;
    const sizes = sizesText(elem.item.sizes.filter((s) => (s.userQty ?? 0) > 0).map((s): [string, number] => [s.name, s.userQty ?? 0]));
    return {
      name: elem.item.name,
      details: [elem.item.color ? `${elem.item.color}: ${sizes}` : sizes, ...(prints ? [`Печать: ${prints} ${prints === 1 ? 'место' : 'места'}`] : [])],
      qty: elem.item.sizes.reduce((sum, size) => sum + (size.userQty ?? 0), 0),
      total: discounted,
      fullTotal: full > discounted ? full : undefined,
      image: productPhotoSources(elem.item, 0).cdnPhoto,
    };
  });
  return { items: [...designItems, ...catalogItems], delivery, total };
}

type TPromo = 'idle' | 'invalid' | 'error';

/** Почему не ушло изделие с принтом: повтор поможет только при сбое связи. */
type TFailReason = 'network' | 'asset' | 'catalog';
const failReason = (err: unknown): TFailReason => {
  const code = err instanceof Error ? err.message : '';
  if (code === 'asset_missing') return 'asset';
  return ['catalog_changed', 'garment_missing', 'no_sizes'].includes(code) ? 'catalog' : 'network';
};

/** Бэкенд каталога хранит «Фамилия Имя» одной строкой до 40 знаков; длиннее — заказ не сохранится. */
const OWNER_NAME_MAX = 40;

// Порядок — как поля на странице: фокус уходит на первое неверное.
const FIELD_IDS: Record<keyof TCheckoutErrors, string> = {
  name: 'checkout-name',
  surname: 'checkout-surname',
  phone: 'checkout-phone',
  telegram: 'checkout-telegram',
  email: 'checkout-email',
  city: 'checkout-city',
  point: 'checkout-point',
  feedback: 'checkout-feedback',
  printFiles: 'checkout-print-files',
  promo: 'checkout-promo',
  agree: 'checkout-agree',
};

/**
 * feedback: null — отзыв не нужен (нет изделия по акции), строка — обязателен.
 * printFiles: null — файлы не нужны (нет изделия с принтом), иначе хотя бы один обязателен.
 */
const validate = (cart: TCartState, agree: boolean, feedback: string | null, printFiles: File[] | null): TCheckoutErrors => {
  const { userData, isDelivery, deliveryParams } = cart;
  // Доставку СДЭК считаем по товарам каталога; без них её рассчитает менеджер.
  const waitingPrice = isDelivery && Boolean(cart.order?.length) && deliveryParams.validDeliveryPoint
    && !orderPricing(cart).freeShipping && deliveryParams.deliveryPrice <= 0;
  return {
    ...(userData.name.trim().length >= 2 ? {} : { name: 'Укажи имя' }),
    ...(userData.surname.trim().length < 2
      ? { surname: 'Укажи фамилию' }
      : `${userData.surname} ${userData.name}`.length > OWNER_NAME_MAX
        ? { surname: `Имя и фамилия вместе — не длиннее ${OWNER_NAME_MAX - 1} знаков` }
        : {}),
    ...(userData.phone.replace(/\D/g, '').length === 11 ? {} : { phone: 'Введи телефон полностью' }),
    ...(/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim()) ? {} : { email: 'Проверь адрес почты' }),
    ...(!userData.telegram.trim()
      ? { telegram: 'Укажи ник в Telegram' }
      : telegramNick(userData.telegram) ? {} : { telegram: 'Ник — от 5 знаков: латиница, цифры и _' }),
    ...(isDelivery && !deliveryParams.validCityTo ? { city: 'Выбери город из подсказок' } : {}),
    ...(isDelivery && deliveryParams.validCityTo && !deliveryParams.validDeliveryPoint
      ? { point: 'Выбери пункт выдачи' }
      : {}),
    ...(waitingPrice ? { point: 'Дождись расчёта доставки' } : {}),
    ...(feedback === null || feedback.trim() ? {} : { feedback: PROMO_TEXT.commentError }),
    ...(printFiles === null || printFiles.length ? {} : { printFiles: 'Приложи файлы для печати' }),
    // Код в поле без «Применить» скидки не даёт: молча оформить заказ без неё нельзя.
    ...(cart.user_promocode.trim() && !cart.validPromoCode.name ? { promo: 'Нажми «Применить» или очисти поле' } : {}),
    ...(agree ? {} : { agree: 'Отметь согласие на обработку персональных данных, иначе заказ не отправить' }),
  };
};

/** Контакты и доставка из оформления — для заявки на изделие из конструктора. */
const designContacts = (cart: TCartState, catalogOrderId: string | undefined, feedback: string, filesInOrder?: string): OrderContacts => {
  const { userData, isDelivery, deliveryParams } = cart;
  const point = deliveryParams.validDeliveryPoint;
  return {
    name: `${userData.name.trim()} ${userData.surname.trim()}`,
    phone: userData.phone.trim(),
    email: userData.email.trim(),
    telegram: telegramNick(userData.telegram) ?? '',
    delivery: isDelivery ? 'delivery' : 'pickup',
    city: isDelivery ? deliveryParams.validCityTo?.city ?? '' : '',
    address: isDelivery && point ? `пункт СДЭК ${point.code}: ${point.name}` : '',
    // Смешанный заказ — две записи (adr/0001): менеджер связывает их по номеру.
    comment: [
      feedback.trim() && `${PROMO_TEXT.commentLabel}: ${feedback.trim()}`,
      catalogOrderId && `Оформлено вместе с заказом каталога № ${catalogOrderId}`,
      filesInOrder && `Файлы для печати от клиента — в заявке № ${filesInOrder}`,
    ].filter(Boolean).join('\n'),
    consent: true,
  };
};

const CheckoutPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const cart = useAppSelector((store) => store.cart);
  const { items: designs, hydrated: designsReady } = useAppSelector((store) => store.cartDesigns);
  const designPrices = useDesignPrices(designs);
  const designTotal = designPrices.reduce((sum, p) => sum + p.total, 0);
  const { isDelivery, deliveryParams, user_promocode, validPromoCode } = cart;
  const hydrated = cart.hydrated && designsReady;
  const order = cart.order ?? [];
  const [agree, setAgree] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [printFiles, setPrintFiles] = useState<File[]>([]);
  // Акция: изделие из конструктора дешевле — отзыв о конструкторе обязателен (config/promo.ts).
  const feedbackNeeded = designs.some((design) => promoAppliesTo(design.garment.type));
  const [errors, setErrors] = useState<TCheckoutErrors>({});
  const [failed, setFailed] = useState<'none' | 'all' | 'designs'>('none');
  const [reason, setReason] = useState<TFailReason>('network');
  const [promo, setPromo] = useState<TPromo>('idle');
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  // Что уже принято: повтор после сбоя шлёт только остальное, а не второй заказ.
  const sent = useRef<SentOrders | null>(null);
  const [createOrder, { isLoading }] = useCreateOrderMutation();
  const [validatePromocode, { isLoading: isPromoLoading, reset: resetPromo }] = usePromocodeValidationMutation();

  useEffect(() => {
    return () => {
      dispatch(cartActions.setDelivery(false));
      dispatch(cartActions.resetValidCity());
      dispatch(cartActions.resetValidDeliveryPoint());
      dispatch(cartActions.setCdekCitySearchUserQuery(''));
      dispatch(cartActions.setDeliveryPrice(0));
    };
  }, [dispatch]);

  const { total, discounted, shipping: delivery, freeShipping } = orderPricing(cart);
  const deliveryText = !isDelivery
    ? 'бесплатно'
    : order.length === 0
      ? 'рассчитает менеджер'
      : freeShipping
      ? 'бесплатно по промокоду'
      : !deliveryParams.validCityTo
      ? 'выбери город'
      : deliveryParams.deliveryPrice > 0
        ? rub(deliveryParams.deliveryPrice)
        : 'считаем…';

  const send = async () => {
    if (sending.current) return;
    const found = validate(cart, agree, feedbackNeeded ? feedback : null, designs.length ? printFiles : null);
    setErrors(found);
    const first = (Object.keys(FIELD_IDS) as Array<keyof TCheckoutErrors>).find((key) => found[key]);
    if (first) {
      document.getElementById(FIELD_IDS[first])?.focus();
      return;
    }
    sending.current = true;
    setPending(true);
    setFailed('none');
    const done = (sent.current ??= readSent(cart.order));
    // Цель воронки конструктора: заявка на изделие с принтом оформляется здесь.
    const goalParams = (i: number) => ({
      product: designs[i].garment.name, method: designs[i].method, qty: designPrices[i].qty,
      order_price: designPrices[i].total, colors: designPrices[i].lines.length,
    });
    designs.forEach((design, i) => { if (!done.designs.has(design.id)) track('order_send', goalParams(i)); });
    try {
      if (order.length && !done.catalog) {
        const result = await createOrder(checkoutOrderObjectCreateFunc(cart, readRoistatVisitId() || 'n/a'));
        if ('error' in result) throw new Error('catalog_order');
        done.catalog = result.data.id;
        saveSent(cart.order, done);
      }
      for (const [i, design] of designs.entries()) {
        if (done.designs.has(design.id)) continue;
        // Файлы для печати — одним набором в заявку первого изделия, чтобы менеджер не получил их дважды.
        const built = await buildDesignOrder(
          design, designContacts(cart, done.catalog, feedback, i > 0 && printFiles.length ? done.designs.get(designs[0].id) : undefined), done.numbers.get(design.id),
          i === 0 ? printFiles : [],
        );
        done.numbers.set(design.id, built.number);
        saveSent(cart.order, done);
        const number = await sendDesignOrder(built);
        done.designs.set(design.id, number);
        saveSent(cart.order, done);
        track('order_success', { ...goalParams(i), currency: 'RUB', order_id: number }, number);
      }
    } catch (err) {
      if (designs.length) track('order_error', { message: String(err).slice(0, 100) });
      sending.current = false;
      setPending(false);
      setReason(failReason(err));
      setFailed(done.catalog || done.designs.size ? 'designs' : 'all');
      return;
    }
    trackPurchase({
      id: done.catalog ?? [...done.designs.values()][0],
      revenue: discounted + designTotal + delivery,
      products: [
        ...order.map((elem) => ({
          id: elem.item._id,
          name: elem.item.name,
          price: elem.item.price + itemPrintUnitPrice(elem),
          quantity: elem.item.sizes.reduce((sum, size) => sum + (size.userQty ?? 0), 0),
          variant: elem.item.color,
        })),
        ...designs.flatMap((design, i) => designPrices[i].lines.map((line) => ({
          id: line.productId,
          name: `${design.garment.name} — свой принт`,
          price: line.perItem,
          quantity: line.qty,
          variant: line.color,
        }))),
      ],
    });
    const deliveryInfo = deliverySummary(cart, delivery);
    // Заказ уже принят: сбой письма или списка для «Спасибо» не должен оставить покупателя на оформлении.
    clearOrderSummary();
    try {
      sendConfirmation(cart, done, deliveryInfo);
      // Уменьшение превью не должно держать переход: не успело за 4 с — «Спасибо» откроется без списка.
      await Promise.race([
        orderSummary(cart, designs, designPrices, deliveryInfo, discounted + designTotal + delivery)
          .then(saveOrderSummary)
          .catch((err) => console.error('[checkout] order summary failed', err)),
        new Promise((resolve) => setTimeout(resolve, 4000)),
      ]);
    } catch (err) {
      console.error('[checkout] confirmation failed', err);
    }
    // CartPersist сотрёт сохранённую корзину вместе с Redux; картинки изделий удаляем сами — до ухода со страницы.
    await Promise.all(designs.map((design) => deleteDesignAssets(design.id).catch(() => undefined)));
    saveOrderNumbers([...done.designs.values()]);
    clearSent();
    dispatch(cartActions.resetCart());
    dispatch(designActions.clear());
    window.location.replace('/thanks?from=checkout');
  };

  const applyPromo = async () => {
    if (!user_promocode.trim() || isPromoLoading) return;
    setPromo('idle');
    const response = await validatePromocode({ user_promocode: user_promocode.trim() });
    if ('error' in response) return setPromo('error');
    const found = (response.data as { promocode?: Array<TCartState['validPromoCode']> }).promocode?.[0];
    if (!found) return setPromo('invalid');
    dispatch(cartActions.setValidPromocode(found));
  };

  const changePromo = (value: string) => {
    dispatch(cartActions.setUserPromocode(value));
    setPromo('idle');
    setErrors(({ promo: _applied, ...rest }) => rest);
    if (validPromoCode.name) {
      dispatch(cartActions.resetValidPromocode());
      resetPromo();
    }
  };

  const busy = isLoading || pending;

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <Link href="/cart" className={styles.back}>
          <Icon name="chevronLeft" size="1.25em" stroke={2} />
          Корзина
        </Link>
        <h1 className={styles.title}>Оформление заказа</h1>
      </div>

      <CartCatalogSync />
      {!hydrated ? (
        <CartLoading />
      ) : order.length === 0 && designs.length === 0 ? (
        <CartEmpty />
      ) : (
        <form
          className={styles.layout}
          noValidate
          aria-busy={busy}
          onSubmit={(event) => {
            event.preventDefault();
            send();
          }}
        >
          <div className={styles.main} data-reveal-group>
            <MainUserData errors={errors} disabled={busy} />
            <DeliveryData errors={errors} disabled={busy} />
            {feedbackNeeded && (
              <fieldset className={form.section} disabled={busy}>
                <legend className={form.legend}>
                  <span className={form.step}>03</span>
                  {PROMO_TEXT.commentLabel}
                </legend>
                <div className={form.field}>
                  <label htmlFor="checkout-feedback" className={form.label}>
                    {PROMO_TEXT.commentLabel}
                  </label>
                  <textarea
                    id="checkout-feedback"
                    className={`${form.input} ${form.textarea}`}
                    rows={3}
                    maxLength={1000}
                    required
                    placeholder={PROMO_TEXT.commentPlaceholder}
                    value={feedback}
                    onChange={(event) => setFeedback(event.target.value)}
                    aria-invalid={Boolean(errors.feedback)}
                    aria-describedby={errors.feedback ? 'checkout-feedback-error checkout-feedback-hint' : 'checkout-feedback-hint'}
                  />
                  <p id="checkout-feedback-hint" className={form.hint}>{PROMO_TEXT.commentHint}</p>
                  {errors.feedback && (
                    <p id="checkout-feedback-error" className={form.error}>
                      {errors.feedback}
                    </p>
                  )}
                </div>
              </fieldset>
            )}
            {designs.length > 0 && (
              <fieldset className={form.section} disabled={busy}>
                <legend className={form.legend}>
                  <span className={form.step}>{feedbackNeeded ? '04' : '03'}</span>
                  Файлы для печати
                </legend>
                <PrintFilesField
                  files={printFiles} onChange={setPrintFiles} disabled={busy}
                  inputId={FIELD_IDS.printFiles} error={errors.printFiles}
                />
              </fieldset>
            )}
          </div>

          <div className={styles.side} data-reveal>
            <aside className={summary.panel} aria-labelledby="checkout-summary-title">
              <h2 id="checkout-summary-title" className={summary.label}>
                Твой заказ
              </h2>
              <ul className={styles.items}>
                {order.map((elem) => {
                  const qty = elem.item.sizes.reduce((sum, size) => sum + (size.userQty ?? 0), 0);
                  const prints = (elem.prints ?? []).filter((print) => print.file?.url).length;
                  return (
                    <li key={elem.itemCartId} className={styles.itemRow}>
                      <span className={styles.itemName}>
                        {elem.item.name}
                        <span className={styles.itemMeta}>
                          {qty} шт.{prints > 0 ? `, принтов: ${prints}` : ''}
                        </span>
                      </span>
                      <span className={styles.itemPrice}>{rub((elem.item.price + itemPrintUnitPrice(elem)) * qty)}</span>
                    </li>
                  );
                })}
                {designs.map((design, i) => (
                  <li key={design.id} className={styles.itemRow}>
                    <span className={styles.itemName}>
                      {design.garment.name} — свой принт
                      <span className={styles.itemMeta}>{designPrices[i].qty} шт.</span>
                    </span>
                    <span className={styles.itemPrice}>{rub(designPrices[i].total)}</span>
                  </li>
                ))}
              </ul>

              <div className={styles.promo}>
                <div className={form.field}>
                  <label htmlFor="checkout-promo" className={form.label}>
                    Промокод
                  </label>
                  <div className={styles.promoRow}>
                    <input
                      id="checkout-promo"
                      className={form.input}
                      type="text"
                      autoComplete="off"
                      placeholder="Если есть"
                      value={user_promocode}
                      disabled={busy}
                      onChange={(event) => changePromo(event.target.value)}
                      onKeyDown={(event) => {
                        if (event.key !== 'Enter') return;
                        event.preventDefault();
                        applyPromo();
                      }}
                      aria-describedby="checkout-promo-status"
                    />
                    <button
                      type="button"
                      className={styles.promoButton}
                      onClick={applyPromo}
                      disabled={!user_promocode.trim() || isPromoLoading || Boolean(validPromoCode.name) || busy}
                    >
                      {isPromoLoading ? 'Проверяем…' : 'Применить'}
                    </button>
                  </div>
                </div>
                <p id="checkout-promo-status" className={styles.promoStatus} role="status">
                  {validPromoCode.name && (
                    <>
                      <Icon name="checkMark" size="1.25em" stroke={2} />
                      Промокод {validPromoCode.name} применён
                    </>
                  )}
                  {validPromoCode.name && designs.length > 0 && <span>. На изделия со своим принтом он не действует</span>}
                  {errors.promo && <span className={form.error}>{errors.promo}</span>}
                  {promo === 'invalid' && <span className={form.error}>Такого промокода нет</span>}
                  {promo === 'error' && <span className={form.error}>Не удалось проверить промокод, попробуй ещё раз</span>}
                </p>
              </div>

              <dl className={summary.rows}>
                <div className={summary.row}>
                  <dt>Товары</dt>
                  <dd className={discounted < total ? summary.strike : undefined}>{rub(total + designTotal)}</dd>
                </div>
                {discounted < total && (
                  <div className={summary.row}>
                    <dt>Со скидкой</dt>
                    <dd>{rub(discounted + designTotal)}</dd>
                  </div>
                )}
                <div className={summary.row}>
                  <dt>{isDelivery ? 'Доставка СДЭК' : 'Самовывоз'}</dt>
                  <dd className={delivery > 0 ? undefined : summary.muted}>{deliveryText}</dd>
                </div>
                {isDelivery && deliveryParams.validDeliveryPoint && (
                  <div className={summary.row}>
                    <dt className={summary.muted}>{deliveryParams.validDeliveryPoint.name}</dt>
                  </div>
                )}
              </dl>
              <p className={summary.total}>
                <span className={summary.label}>Итого</span>
                <span className={summary.sum}>
                  <Amount value={discounted + designTotal + delivery} format={rub} />
                </span>
              </p>

              <div className={styles.consent}>
                <ConsentField id="checkout-agree" checked={agree} disabled={busy} onChange={setAgree} error={errors.agree} />
              </div>

              {failed !== 'none' && (
                <div className={styles.failure} role="alert">
                  <p className={styles.failureText}>
                    <Icon name="alert" size="1.25em" stroke={2} />
                    {reason === 'asset'
                      ? 'Макет не сохранился в браузере, без него заказ не оформить. Удали изделие из корзины и собери его заново в конструкторе'
                      : reason === 'catalog'
                        ? 'В каталоге изменились размеры или цвета изделия со своим принтом. Открой его из корзины и выбери размеры заново'
                        : failed === 'all'
                          ? 'Не удалось оформить заказ. Проверь соединение и попробуй ещё раз'
                          : 'Не удалось оформить заказ полностью: часть уже принята, изделие со своим принтом — нет. Нажми «Повторить», принятое второй раз не уйдёт'}
                    {reason !== 'network' && failed === 'designs' && '. Остальной заказ уже принят, второй раз он не уйдёт'}
                  </p>
                  {reason === 'network' ? (
                    <button type="button" className={styles.retry} onClick={send} disabled={busy}>
                      Повторить
                    </button>
                  ) : (
                    <Link href="/cart" className={styles.retry}>
                      В корзину
                    </Link>
                  )}
                </div>
              )}

              <button type="submit" className={summary.submit} disabled={busy}>
                {busy ? 'Оформляем…' : 'Оформить заказ'}
              </button>
              <p className={styles.note}>Менеджер подтвердит заказ и пришлёт ссылку на оплату</p>
            </aside>
          </div>
        </form>
      )}
    </section>
  );
};

export default CheckoutPage;
