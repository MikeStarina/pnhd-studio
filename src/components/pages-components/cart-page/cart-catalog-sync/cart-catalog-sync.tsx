'use client';
import React, { useEffect, useState } from 'react';
import { useGetProductsQuery } from '@/api/api';
import { hasSentCatalog } from '@/app/checkout/sent-orders';
import { syncCartWithCatalog } from '@/app/utils/cart-sync';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import styles from './cart-catalog-sync.module.css';

/**
 * На страницах корзины и оформления сверяет товары каталога в корзине с самим каталогом
 * и говорит покупателю, что изменилось. Корзина остаётся как есть, если каталог не ответил или пришёл пустым
 * и если заказ каталога уже принят, а оформление не закончено (см. hasSentCatalog).
 */
const CartCatalogSync: React.FC = () => {
  const dispatch = useAppDispatch();
  const { order, hydrated } = useAppSelector((store) => store.cart);
  const { data } = useGetProductsQuery(undefined, { skip: !hydrated || !order?.length });
  const [changes, setChanges] = useState<string[]>([]);

  useEffect(() => {
    if (!data?.data.length || !order?.length || hasSentCatalog()) return;
    const synced = syncCartWithCatalog(order, data.data);
    if (synced.order === order) return;
    dispatch(cartActions.restoreCart(synced.order));
    if (synced.changes.length) setChanges(synced.changes);
  }, [data, order, dispatch]);

  if (!changes.length) return null;
  return (
    <div className={styles.notice} role="status">
      <p className={styles.title}>Корзина обновлена</p>
      <ul className={styles.list}>
        {changes.map((change) => <li key={change}>{change}</li>)}
      </ul>
    </div>
  );
};

export default CartCatalogSync;
