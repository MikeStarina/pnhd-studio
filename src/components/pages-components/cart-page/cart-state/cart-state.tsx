import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import styles from './cart-state.module.css';

/** Пока корзина читается из хранилища браузера: место под список, без мигания «пусто». */
export const CartLoading: React.FC = () => (
  <div className={styles.loading} aria-busy="true">
    <span className="visually-hidden">Загружаем корзину…</span>
    <span className={styles.bar} />
    <span className={styles.bar} />
  </div>
);

/** Пустая корзина — и на /cart, и на /checkout: объясняем и ведём в каталог, а не уводим молча. */
export const CartEmpty: React.FC = () => (
  <div className={styles.empty} data-reveal>
    <Icon name="bag" size={32} />
    <h2 className={styles.title}>В корзине пока пусто</h2>
    <p className={styles.text}>
      Выбери изделие в&nbsp;каталоге или собери своё в&nbsp;конструкторе&nbsp;— оно появится здесь.
    </p>
    <div className={styles.actions}>
      <Link href="/shop" className={styles.primary}>
        Перейти в каталог
        <Icon name="arrowRight" size="1.25em" stroke={2} />
      </Link>
      <Link href="/constructor" className={styles.secondary}>
        Открыть конструктор
      </Link>
    </div>
  </div>
);
