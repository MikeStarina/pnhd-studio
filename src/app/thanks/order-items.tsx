'use client';
import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { rub } from '@/components/catalog/data';
import { EASE_OUT_SOFT, motionPixels, motionSeconds } from '@/styles/motion';
import { readOrderSummary, type OrderSummary } from '../checkout/sent-orders';
import styles from './order-items.module.css';

/** Состав оформленного заказа: сохраняется на оформлении (checkout/sent-orders.ts), без него блока нет. */
const OrderItems: React.FC = () => {
  const [summary, setSummary] = useState<OrderSummary | null>(null);
  useEffect(() => setSummary(readOrderSummary()), []);
  if (!summary) return null;
  const { items, delivery, total } = summary;
  return (
    <motion.section
      className={styles.panel}
      aria-labelledby="thanks-items-title"
      // Встаёт следом за частями карточки «Спасибо» (status-screen.tsx): у той пять шагов очереди
      initial={{ opacity: 0, y: motionPixels('--reveal-shift') }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: motionSeconds('--duration-reveal-part'), ease: EASE_OUT_SOFT, delay: motionSeconds('--reveal-stagger') * 6 }}
    >
      <h2 id="thanks-items-title" className={styles.title}>В твоём заказе</h2>
      <ul className={styles.list}>
        {items.map((item, i) => (
          <li key={`${item.name}-${i}`} className={styles.item}>
            <span className={styles.thumb}>
              {/* eslint-disable-next-line @next/next/no-img-element -- фото с CDN каталога и data URL превью */}
              {item.image && <img src={item.image} alt="" loading="lazy" />}
            </span>
            <span className={styles.body}>
              <span className={styles.name}>{item.name}</span>
              {item.details.map((line) => <span key={line} className={styles.meta}>{line}</span>)}
              <span className={styles.meta}>{item.qty} шт</span>
            </span>
            <span className={styles.price}>
              {item.fullTotal && <s className={styles.full}>{rub(item.fullTotal)}</s>}
              {rub(item.total)}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.row}>
        <span>
          {delivery.kind === 'pickup' ? 'Самовывоз' : 'Доставка'}
          <span className={styles.meta}>{delivery.text}</span>
        </span>
        <span className={styles.rowPrice}>
          {delivery.price === null ? 'рассчитает менеджер' : delivery.price > 0 ? rub(delivery.price) : 'бесплатно'}
        </span>
      </div>
      <div className={styles.total}>
        <span>Итого</span>
        <span>{rub(total)}</span>
      </div>
    </motion.section>
  );
};

export default OrderItems;
