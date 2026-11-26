'use client';
import React from 'react';
import { useAppSelector } from '@/redux/redux-hooks';
import Section from '@/components/home/section/section';
import SectionHead from '@/components/home/section-head/section-head';
import MoreLink from '@/components/home/more-link/more-link';
import gridStyles from '@/components/catalog/product-grid/product-grid.module.css';
import styles from './cart-suggestions.module.css';

export type SuggestionCard = { id: string; type: string; card: React.ReactNode };

const SHOWN = 4;
/** Порядок видов в подборке: одежда чередуется с аксессуарами, чтобы к футболке предложить и худи, и шоппер */
const TYPE_ORDER = ['hoodie', 'totebag', 'tshirt', 'cap', 'sweatshirt', 'longsleeve'];

/**
 * Подборка под корзиной. Карточки рисует сервер (cards — по несколько на каждый вид изделия),
 * а здесь, когда корзина прочитана из браузера, выбираются четыре: сначала виды, которых в корзине нет, по одному
 * на вид, потом другие модели тех же видов. Товары из корзины не показываем.
 */
const CartSuggestions: React.FC<{ cards: SuggestionCard[] }> = ({ cards }) => {
  const { order, hydrated: cartReady } = useAppSelector((store) => store.cart);
  const { items: designs, hydrated: designsReady } = useAppSelector((store) => store.cartDesigns);
  if (!cartReady || !designsReady) return null;

  const inCartIds = new Set([
    ...(order ?? []).map((elem) => elem.item._id),
    ...designs.flatMap((design) => design.previews.map((preview) => preview.productId)),
  ]);
  const inCartTypes = new Set([
    ...(order ?? []).map((elem) => elem.item.type),
    ...designs.map((design) => design.garment.type),
  ]);
  const empty = inCartIds.size === 0 && inCartTypes.size === 0;
  const fresh = cards.filter((entry) => !inCartIds.has(entry.id));
  const byType = (types: string[]) => types.map((type) => fresh.filter((entry) => entry.type === type));
  const roundRobin = (groups: SuggestionCard[][]) =>
    Array.from({ length: Math.max(0, ...groups.map((group) => group.length)) }, (_, row) =>
      groups.flatMap((group) => group[row] ?? [])
    ).flat();
  const picked = [
    ...roundRobin(byType(TYPE_ORDER.filter((type) => !inCartTypes.has(type)))),
    ...roundRobin(byType(TYPE_ORDER.filter((type) => inCartTypes.has(type)))),
  ].slice(0, SHOWN);
  if (picked.length === 0) return null;

  const title = empty ? 'Посмотри в каталоге' : 'С этим заказывают';

  return (
    <Section tone="white" labelledBy="cart-suggestions-title">
      <SectionHead titleId="cart-suggestions-title" title={title} />
      <ul className={gridStyles.grid} aria-label={title} data-reveal-group>
        {picked.map((entry) => (
          <li key={entry.id}>{entry.card}</li>
        ))}
      </ul>
      <div className={styles.more}>
        <MoreLink href="/shop">Весь каталог</MoreLink>
      </div>
    </Section>
  );
};

export default CartSuggestions;
