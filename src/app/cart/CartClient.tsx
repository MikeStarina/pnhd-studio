'use client';
import React from 'react';
import { AnimatePresence } from 'motion/react';
import { useAppSelector } from '@/redux/redux-hooks';
import CartDesignItem from '@/components/pages-components/cart-page/cart-design-item/cart-design-item';
import CartItem from '@/components/pages-components/cart-page/cart-item/cart-item';
import CartCatalogSync from '@/components/pages-components/cart-page/cart-catalog-sync/cart-catalog-sync';
import CartSummary from '@/components/pages-components/cart-page/cart-summary/cart-summary';
import { CartEmpty, CartLoading } from '@/components/pages-components/cart-page/cart-state/cart-state';
import styles from './page.module.css';

const positionsWord = (n: number) => {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return 'позиция';
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return 'позиции';
  return 'позиций';
};

const CartClient: React.FC = () => {
  const { order, hydrated: cartReady } = useAppSelector((store) => store.cart);
  const { items: designs, hydrated: designsReady } = useAppSelector((store) => store.cartDesigns);
  const hydrated = cartReady && designsReady;
  const count = (order?.length ?? 0) + designs.length;

  return (
    <section className={styles.page}>
      <div className={styles.head}>
        <h1 className={styles.title}>Корзина</h1>
        {hydrated && count > 0 && (
          <p className={styles.count}>
            {count} {positionsWord(count)}
          </p>
        )}
      </div>
      <CartCatalogSync />
      {!hydrated ? (
        <CartLoading />
      ) : count === 0 ? (
        <CartEmpty />
      ) : (
        <div className={styles.layout}>
          <ul className={styles.list}>
            <AnimatePresence>
              {(order ?? []).map((elem, index) => (
                <CartItem key={elem.itemCartId} elem={elem} index={index} />
              ))}
              {designs.map((design, index) => (
                <CartDesignItem key={design.id} design={design} index={(order?.length ?? 0) + index} />
              ))}
            </AnimatePresence>
          </ul>
          <div className={styles.side} data-reveal>
            <CartSummary />
          </div>
        </div>
      )}
    </section>
  );
};

export default CartClient;
