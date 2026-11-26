'use client';
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import { rub, type Badge } from '../data';
import styles from './product-card.module.css';

export type CardVariant = {
  id: string;
  slug: string;
  name: string;
  color: string;
  hex: string | null;
  photo: string;
  second: string | null;
  price: number;
  withPrint: { now: number; full: number } | null;
  sizes: string | null;
  badges: Badge[];
  printable: boolean;
};

const sizes = '(max-width: 599px) 50vw, (max-width: 1279px) 33vw, 25vw';

/**
 * Вся карточка — одна ссылка (растянутая с названия) на выбранный цвет. Кружки цветов — кнопки поверх неё:
 * нажатие выбирает цвет — фото, название, цена и ссылка меняются на месте. По наведению не меняем: при проводке
 * курсором карточка мелькала.
 */
const ProductCardView: React.FC<{
  variants: CardVariant[];
  initial: number;
  titleAs?: 'h2' | 'h3';
  priority: boolean;
}> = ({ variants, initial, titleAs: Title = 'h3', priority }) => {
  const [selected, setSelected] = useState(initial);
  const shown = variants[selected];

  return (
    <article className={styles.card}>
      <div className={styles.media}>
        <Image key={shown.id} data-switched={selected !== initial || undefined} src={shown.photo} alt={shown.name} fill sizes={sizes} priority={priority} className={styles.photo} />
        {shown.second && (
          <Image key={`${shown.id}-2`} src={shown.second} alt="" fill sizes={sizes} className={`${styles.photo} ${styles.second}`} />
        )}
        {shown.badges.length > 0 && (
          <ul className={styles.badges}>
            {shown.badges.map((badge) => (
              <li key={badge.label} className={styles.badge} data-tone={badge.tone}>
                {badge.label}
              </li>
            ))}
          </ul>
        )}
        {shown.printable && (
          <Link
            href={`/constructor?product=${encodeURIComponent(shown.slug)}`}
            className={styles.print}
            aria-label={`Нанести принт на ${shown.name}`}
          >
            <Icon name="brush" size={24} />
            <span className={styles.printLabel} aria-hidden="true">
              Нанести принт
            </span>
          </Link>
        )}
      </div>
      <div className={styles.body}>
        {/* Строка цветов и размеров — первая под фото: у всех карточек ряда на одной высоте, как бы ни переносилось название */}
        <div className={styles.options}>
          {variants.length > 1 && (
            <ul className={styles.swatches} aria-label="Цвет">
              {variants.map((variant, i) => (
                <li key={variant.id}>
                  <button
                    type="button"
                    className={styles.swatch}
                    style={{ '--swatch': variant.hex ?? 'var(--color-line)' } as React.CSSProperties}
                    aria-label={variant.color}
                    aria-pressed={i === selected}
                    title={variant.color}
                    onClick={() => setSelected(i)}
                  />
                </li>
              ))}
            </ul>
          )}
          {shown.sizes && <span className={styles.sizes}>{shown.sizes}</span>}
        </div>
        <p className={styles.price}>
          <span className={styles.priceMain}>{rub(shown.price)}</span>
          {shown.withPrint && (
            <span className={styles.priceNote}>
              с принтом А4 от{' '}
              {shown.withPrint.now < shown.withPrint.full && <s className={styles.priceOld}>{rub(shown.withPrint.full)}</s>}{' '}
              <span>{rub(shown.withPrint.now)}</span>
            </span>
          )}
        </p>
        <Title className={styles.name}>
          <Link href={`/shop/${shown.slug}`} className={styles.link}>
            {shown.name}
          </Link>
        </Title>
      </div>
    </article>
  );
};

export default ProductCardView;
