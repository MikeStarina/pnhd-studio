import React from 'react';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './cart-photo.module.css';

/**
 * Фото позиции корзины — кнопка «рассмотреть крупно»: картинку даёт родитель, просмотр открывает onOpen.
 * В углу значок «развернуть» (меньше, чем у галереи, — не закрывает принт).
 */
const CartPhoto: React.FC<{ label: string; onOpen: () => void; disabled?: boolean; children: React.ReactNode }> = ({
  label,
  onOpen,
  disabled = false,
  children,
}) => (
  <button type="button" className={styles.photo} aria-haspopup="dialog" onClick={onOpen} disabled={disabled}>
    {children}
    {!disabled && (
      <span className={styles.zoom} aria-hidden="true">
        <Icon name="expand" size="var(--thumb-action-icon)" stroke={2} />
      </span>
    )}
    <span className="visually-hidden">{label}</span>
  </button>
);

export default CartPhoto;
