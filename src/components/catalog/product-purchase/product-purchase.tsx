'use client';
import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { v4 as uuidv4 } from 'uuid';
import { IProduct } from '@/app/utils/types';
import { compareSizeKeys, normalizeSizeKey } from '@/app/utils/product-sizes';
import { Icon } from '@/features/constructor/ui/icons';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { actions as utilActions } from '@/redux/utils-slice/utils.slice';
import { rub } from '../data';
import { track, trackAdd, trackDetail } from '@/components/site/analytics';
import Modal from '../modal/modal';
import type { SizeChartImage } from '../size-charts';
import Image from 'next/image';
import styles from './product-purchase.module.css';

const emptySizes = (item: IProduct) => item.sizes.map(({ name, qty }) => ({ name, qty, userQty: 0 }));

/**
 * Выбор размеров и покупка. Размеры живут в общем состоянии `utils.sizes` — как у старого выбора размера:
 * по ним же правится позиция корзины (`?itemCartId=`), и корзина читает тот же формат.
 */
const ProductPurchase: React.FC<{ item: IProduct; sizeChart: SizeChartImage | null }> = ({ item, sizeChart }) => {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const stateSizes = useAppSelector((store) => store.utils.sizes);
  const order = useAppSelector((store) => store.cart.order);
  const [itemCartId, setItemCartId] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [chartOpen, setChartOpen] = useState(false);
  const leaving = useRef(false);
  const detailSent = useRef(false);

  const editing = itemCartId ? order?.find((entry) => entry.itemCartId === itemCartId) : undefined;

  // id — номер товара в API: под ним же конструктор отправляет покупку, иначе Метрика не сведёт просмотр с заказом
  const ecom = { id: item._id, name: item.name, price: item.price, variant: item.color, category: item.type };

  useEffect(() => {
    setItemCartId(new URLSearchParams(window.location.search).get('itemCartId'));
    if (detailSent.current) return;
    detailSent.current = true;
    trackDetail(ecom);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const cartSizes = editing?.item.sizes;
    dispatch(
      utilActions.setInitialSizes(
        item.sizes.map(({ name, qty }) => ({
          name,
          qty,
          userQty: Math.min(qty, cartSizes?.find((size) => size.name === name)?.userQty ?? 0),
        }))
      )
    );
    return () => {
      dispatch(utilActions.resetStateSizes());
    };
  }, [dispatch, item, editing?.itemCartId]);

  const rows = item.sizes
    .map(({ name, qty }) => ({ name, qty, userQty: stateSizes?.find((size) => size.name === name)?.userQty ?? 0 }))
    .sort((a, b) => compareSizeKeys(normalizeSizeKey(a.name), normalizeSizeKey(b.name)));
  const totalQty = rows.reduce((sum, row) => sum + row.userQty, 0);

  const change = (name: string, id: 'increase' | 'decrease') => {
    setAdded(false);
    dispatch(utilActions.updateSizes({ id, name }));
  };

  const submit = () => {
    if (totalQty === 0 || leaving.current) return;
    const sizes = rows.map(({ name, qty, userQty }) => ({ name, qty, userQty }));

    if (editing) {
      leaving.current = true;
      setBusy(true);
      dispatch(
        cartActions.updateCartItem({
          itemCartId: editing.itemCartId,
          sizes,
          prints: editing.prints,
          isItemWithPrint: editing.isItemWithPrint,
        })
      );
      dispatch(utilActions.resetStateSizes());
      router.push('/cart');
      return;
    }

    dispatch(cartActions.addToCartWithoutPrint({ item: { ...item, sizes }, isItemWithPrint: false, itemCartId: uuidv4() }));
    track('add_to_cart', { product: item.slug, price: item.price, qty: totalQty });
    trackAdd({ ...ecom, quantity: totalQty });
    dispatch(utilActions.setInitialSizes(emptySizes(item)));
    setAdded(true);
  };

  return (
    <div className={styles.purchase}>
      <div className={styles.sizeHead}>
        <h2 className={styles.label} id="sizes-label">
          Размер
        </h2>
        {sizeChart ? (
          <button type="button" className={styles.chart} aria-haspopup="dialog" onClick={() => {
            setChartOpen(true);
            track('size_chart_open', { product: item.slug });
          }}>
            <Icon name="ruler" size="1.25em" stroke={2} />
            Подобрать размер
          </button>
        ) : (
          <Link href="/size_chart" className={styles.chart} target="_blank">
            <Icon name="ruler" size="1.25em" stroke={2} />
            Подобрать размер
            <span className="visually-hidden"> (откроется в новой вкладке)</span>
          </Link>
        )}
      </div>

      <ul className={styles.sizes} aria-labelledby="sizes-label">
        {rows.map((row) => {
          const out = row.qty <= 0;
          return (
            <li key={row.name} className={styles.row} data-out={out}>
              <span className={styles.size}>{normalizeSizeKey(row.name)}</span>
              {out && <span className={styles.outText}>нет в наличии</span>}
              <div className={styles.stepper}>
                <button
                  type="button"
                  className={styles.step}
                  aria-label={`Убрать ${normalizeSizeKey(row.name)}`}
                  disabled={out || row.userQty <= 0 || busy}
                  onClick={() => change(row.name, 'decrease')}
                >
                  <Icon name="minus" size="1.25em" stroke={2} />
                </button>
                <span className={styles.count} aria-live="polite">
                  {row.userQty}
                </span>
                <button
                  type="button"
                  className={styles.step}
                  aria-label={`Добавить ${normalizeSizeKey(row.name)}`}
                  disabled={out || row.userQty >= row.qty || busy}
                  onClick={() => change(row.name, 'increase')}
                >
                  <Icon name="plus" size="1.25em" stroke={2} />
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <p className={styles.total}>
        <span className={styles.totalLabel}>Итого</span>
        <span>
          {totalQty} шт. · {rub(totalQty * item.price)}
        </span>
      </p>

      <div className={styles.actions}>
        {/* Пока размер не выбран, кнопка сама говорит, чего не хватает: подсказка под ней терялась */}
        <button type="button" className={styles.primary} disabled={totalQty === 0 || busy} onClick={submit}>
          {totalQty === 0 ? 'Выбери размер' : editing ? 'Сохранить' : 'В корзину'}
        </button>
        {item.isForPrinting && (
          <Link href={`/constructor?product=${encodeURIComponent(item.slug)}`} className={styles.secondary}>
            Нанести свой принт
          </Link>
        )}
      </div>

      <div role="status" className={styles.notice}>
        {added && (
          <>
            <Icon name="checkMark" size="1.25em" stroke={2} />
            Добавлено в корзину
            <Link href="/cart" className={styles.cartLink}>
              Перейти в корзину
              <Icon name="arrowRight" size="1.25em" stroke={2} />
            </Link>
          </>
        )}
      </div>
      {sizeChart && (
        <Modal open={chartOpen} onClose={() => setChartOpen(false)} labelledBy="size-chart-title">
          <div className={styles.chartHead}>
            <div>
              <h2 id="size-chart-title" className={styles.chartTitle}>
                Таблица размеров
              </h2>
              <p className={styles.chartModel}>{sizeChart.title}</p>
            </div>
            <button type="button" className={styles.chartClose} aria-label="Закрыть таблицу" onClick={() => setChartOpen(false)}>
              <Icon name="close" size={20} stroke={2} />
            </button>
          </div>
          <div className={styles.chartBody} data-lenis-prevent>
            <Image
              src={sizeChart.src}
              width={sizeChart.width}
              height={sizeChart.height}
              alt={`Таблица размеров: ${sizeChart.title}`}
              sizes="(max-width: 599px) 100vw, 720px"
              className={styles.chartImage}
            />
            <Link href="/size_chart" className={styles.chartAll} target="_blank">
              Все таблицы размеров
              <Icon name="arrowUpRight" size="1.25em" stroke={2} />
              <span className="visually-hidden"> (откроется в новой вкладке)</span>
            </Link>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ProductPurchase;
