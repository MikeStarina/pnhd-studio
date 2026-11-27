'use client';
import React from 'react';
import Link from 'next/link';
import { useAppSelector } from '@/redux/redux-hooks';
import { itemPrintUnitPrice } from '@/app/utils/cart-utils';
import { rub } from '@/components/catalog/data';
import MoreLink from '@/components/home/more-link/more-link';
import { useDesignPrices } from '@/features/constructor/cart/useDesignPrice';
import Amount from '../amount';
import styles from './cart-summary.module.css';

/**
 * Итог корзины справа от списка: все изделия одной строкой — вещи из каталога и изделия со своим принтом вместе,
 * цена печати уже внутри суммы. Дальше доставка, итог и переход к оформлению.
 */
const CartSummary: React.FC = () => {
  const order = useAppSelector((store) => store.cart.order) ?? [];
  const designs = useAppSelector((store) => store.cartDesigns.items);
  const designPrices = useDesignPrices(designs);
  const designQty = designPrices.reduce((sum, p) => sum + p.qty, 0);
  const designTotal = designPrices.reduce((sum, p) => sum + p.total, 0);
  const lines = order.map((elem) => {
    const qty = elem.item.sizes.reduce((sum, size) => sum + (size.userQty ?? 0), 0);
    return { qty, textile: elem.item.price * qty, print: itemPrintUnitPrice(elem) * qty };
  });
  const qty = lines.reduce((sum, line) => sum + line.qty, 0) + designQty;
  const total = lines.reduce((sum, line) => sum + line.textile + line.print, 0) + designTotal;

  return (
    <aside className={styles.panel} aria-labelledby="cart-summary-title">
      <h2 id="cart-summary-title" className={styles.label}>
        Твой заказ
      </h2>
      <dl className={styles.rows}>
        <div className={styles.row}>
          <dt>Изделия, {qty} шт.</dt>
          <dd>{rub(total)}</dd>
        </div>
        <div className={styles.row}>
          <dt>Доставка</dt>
          <dd className={styles.muted}>при оформлении</dd>
        </div>
      </dl>
      <p className={styles.total}>
        <span className={styles.label}>Итого</span>
        <span className={styles.sum}>
          <Amount value={total} format={rub} />
        </span>
      </p>
      <MoreLink href="/checkout" stretch>
        Оформить заказ
      </MoreLink>
      <Link href="/shop" className={styles.more}>
        Продолжить покупки
      </Link>
    </aside>
  );
};

export default CartSummary;
