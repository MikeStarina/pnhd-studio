'use client';
import React from 'react';
import { motion } from 'motion/react';
import { rub } from '@/components/catalog/data';
import { Icon } from '@/features/constructor/ui/icons';
import Amount from '../amount';
import { EASE_IN, EASE_OUT_SOFT, motionPixels, motionSeconds } from '../motion-tokens';
import styles from './cart-row.module.css';

/**
 * Строка корзины — общая для готовой вещи и изделия с принтом: крупное фото слева, содержимое посередине,
 * справа — удаление в углу и итог позиции внизу. На телефоне итог уходит под содержимое.
 * Появляется подъёмом по очереди; удалённая сворачивается по высоте (AnimatePresence в списке).
 */
const CartRow: React.FC<{
  index: number;
  visual: React.ReactNode;
  removeLabel: string;
  onRemove: () => void;
  qty: number;
  total: number;
  children: React.ReactNode;
}> = ({ index, visual, removeLabel, onRemove, qty, total, children }) => (
  <motion.li
    className={styles.item}
    initial={{ opacity: 0, y: motionPixels('--reveal-shift') }}
    animate={{
      opacity: 1,
      y: 0,
      transition: { duration: motionSeconds('--duration-reveal'), ease: EASE_OUT_SOFT, delay: index * motionSeconds('--reveal-stagger') },
    }}
    exit={{
      opacity: 0,
      height: 0,
      borderBottomWidth: 0,
      overflow: 'hidden',
      transition: { duration: motionSeconds('--duration-exit'), ease: EASE_IN },
    }}
  >
    <div className={styles.inner}>
      <div className={styles.visual}>{visual}</div>
      <div className={styles.body}>{children}</div>
      <button type="button" className={styles.remove} aria-label={removeLabel} onClick={onRemove}>
        <Icon name="trash" size={20} />
      </button>
      <p className={styles.total}>
        <span className={styles.totalLabel}>{qty}&nbsp;шт.</span>
        <Amount value={total} format={rub} />
      </p>
    </div>
  </motion.li>
);

export default CartRow;
