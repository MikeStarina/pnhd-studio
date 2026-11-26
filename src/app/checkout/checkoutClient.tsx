'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAppSelector, useAppDispatch } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { actions as designActions } from '@/redux/cart-designs-slice/cart-designs.slice';
import { useDesignPrices } from '@/features/constructor/cart/useDesignPrice';
import { buildDesignOrder, sendDesignOrder } from '@/features/constructor/cart/sendDesign';
import { deleteDesignAssets } from '@/features/constructor/cart/assets';
import type { OrderContacts } from '@/features/constructor/model/types';
import { PROMO_TEXT, promoAppliesTo } from '@/features/constructor/config/promo';
import { track } from '@/features/constructor/analytics/events';
import MainUserData, { type TCheckoutErrors } from '@/components/pages-components/checkout-page/main-user-data/main-user-data';
import DeliveryData from '@/components/pages-components/checkout-page/delivery-data/delivery-data';
import { CartEmpty, CartLoading } from '@/components/pages-components/cart-page/cart-state/cart-state';
import { checkoutOrderObjectCreateFunc, itemPrintUnitPrice, orderPricing } from '../utils/cart-utils';
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
import styles from './page.module.css';
import summary from '@/components/pages-components/cart-page/cart-summary/cart-summary.module.css';
import form from '@/components/pages-components/checkout-page/form/form.module.css';

type TPromo = 'idle' | 'invalid' | 'error';

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
    ...(userData.surname.trim().length >= 2 ? {} : { surname: 'Укажи фамилию' }),
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
  const [promo, setPromo] = useState<TPromo>('idle');
  const [pending, setPending] = useState(false);
  const sending = useRef(false);
  // Что уже принято: повтор после сбоя шлёт только остальное, а не второй заказ.
  const sent = useRef<{ catalog?: string; designs: Map<string, string>; numbers: Map<string, string> }>({
    designs: new Map(), numbers: new Map(),
  });
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
    const done = sent.current;
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
      }
      for (const [i, design] of designs.entries()) {
        if (done.designs.has(design.id)) continue;
        // Файлы для печати — одним набором в заявку первого изделия, чтобы менеджер не получил их дважды.
        const built = await buildDesignOrder(
          design, designContacts(cart, done.catalog, feedback, i > 0 && printFiles.length ? done.designs.get(designs[0].id) : undefined), done.numbers.get(design.id),
          i === 0 ? printFiles : [],
        );
        done.numbers.set(design.id, built.number);
        const number = await sendDesignOrder(built);
        done.designs.set(design.id, number);
        track('order_success', { ...goalParams(i), currency: 'RUB', order_id: number }, number);
      }
    } catch (err) {
      if (designs.length) track('order_error', { message: String(err).slice(0, 100) });
      sending.current = false;
      setPending(false);
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
    // CartPersist сотрёт сохранённую корзину вместе с Redux; картинки изделий удаляем сами — до ухода со страницы.
    await Promise.all(designs.map((design) => deleteDesignAssets(design.id).catch(() => undefined)));
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
                    {failed === 'all'
                      ? 'Не удалось оформить заказ. Проверь соединение и попробуй ещё раз'
                      : 'Не удалось оформить заказ полностью: часть уже принята, изделие со своим принтом — нет. Нажми «Повторить», принятое второй раз не уйдёт'}
                  </p>
                  <button type="button" className={styles.retry} onClick={send} disabled={busy}>
                    Повторить
                  </button>
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
