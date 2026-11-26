'use client';
import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { compareSizeKeys, normalizeSizeKey } from '@/app/utils/product-sizes';
import { rub } from '@/components/catalog/data';
import { Icon } from '@/features/constructor/ui/icons';
import { SIDE_TAB } from '@/features/constructor/model/types';
import { useAssetUrl, useAssetUrls } from '@/features/constructor/cart/assets';
import GalleryLightbox from '@/components/catalog/product-gallery/gallery-lightbox';
import type { CartDesign } from '@/features/constructor/cart/types';
import { useDesignPrice, useDesignRepricer } from '@/features/constructor/cart/useDesignPrice';
import { useAppDispatch } from '@/redux/redux-hooks';
import { actions as designActions } from '@/redux/cart-designs-slice/cart-designs.slice';
import SizeStepper from '../size-stepper/size-stepper';
import CartRow from '../cart-row/cart-row';
import CartPhoto from '../cart-photo/cart-photo';
import styles from './cart-design-item.module.css';

/**
 * Позиция «свой принт»: превью по сторонам, цвета со степперами размеров (как у обычной позиции), сумма.
 * Количество правится прямо здесь: цена пересчитывается той же функцией, что в конструкторе (ступень тиража — по всей позиции).
 */
const CartDesignItem: React.FC<{ design: CartDesign; index: number }> = ({ design, index }) => {
  const dispatch = useAppDispatch();
  const price = useDesignPrice(design);
  const first = price.lines[0];
  const sides = design.sides.filter((side) => design.previews.some((p) => p.productId === first?.productId && p.side === side));
  const [picked, setSide] = useState(sides[0] ?? design.sides[0]);
  // Цвет превью — первый с количеством; если его свели к нулю, у следующего выбранной стороны может не быть
  const side = sides.includes(picked) ? picked : sides[0] ?? design.sides[0];
  const preview = design.previews.find((p) => p.productId === first?.productId && p.side === side);
  const url = useAssetUrl(preview?.asset);

  // Просмотр крупно: по каждой стороне — изделие с принтом и сам файл печати (300 dpi), чтобы рассмотреть детали.
  // Картинки грузятся только при открытии: файлы печати тяжёлые.
  // Открытый кадр — по ключу картинки: номер в списке сдвинулся бы, если какой-то файл не прочитался
  const [zoom, setZoom] = useState<string | null>(null);
  const frames = sides.flatMap((s) => {
    const shot = design.previews.find((p) => p.productId === first?.productId && p.side === s);
    const print = design.prints.find((p) => p.side === s);
    return [
      ...(shot ? [{ asset: shot.asset, alt: `${SIDE_TAB[s]}: изделие с принтом` }] : []),
      ...(print ? [{ asset: print.asset, alt: `${SIDE_TAB[s]}: принт` }] : []),
    ];
  });
  const frameUrls = useAssetUrls(zoom === null ? [] : frames.map((f) => f.asset));
  const views = frames.map((f, i) => ({ ...f, url: frameUrls[i] })).filter((f): f is typeof f & { url: string } => !!f.url);
  const openZoom = () => setZoom(preview?.asset ?? frames[0]?.asset ?? null);
  // Цена за штуку — строкой под названием, как у готовой вещи; в строке цвета — только если у цветов она разная
  const samePrice = price.lines.every((line) => line.perItem === first?.perItem);
  const reprice = useDesignRepricer();

  // Цвета позиции — по превью (в них все добавленные цвета); размеры — из количества.
  const colors = design.previews.filter((p, i, all) => all.findIndex((q) => q.productId === p.productId) === i);
  // Размер, сведённый к нулю, не пропадает из-под пальца, пока корзина открыта
  const shown = useRef(new Set<string>());
  const rowsFor = (productId: string) =>
    Object.entries(design.quantities[productId] ?? {})
      .filter(([size, n]) => {
        if (n > 0) shown.current.add(`${productId}:${size}`);
        return shown.current.has(`${productId}:${size}`);
      })
      .sort(([a], [b]) => compareSizeKeys(normalizeSizeKey(a), normalizeSizeKey(b)));
  const last = price.qty <= 1;

  // Только цвета этой позиции: размеры других моделей (хвост конструктора в старых позициях) вычищаются при правке
  const quantitiesWith = (productId: string, size: string, delta: 1 | -1) => {
    const sizes = design.quantities[productId] ?? {};
    return Object.fromEntries(
      colors.map((c) => [c.productId, c.productId === productId ? { ...sizes, [size]: Math.max(0, Math.min(999, (sizes[size] ?? 0) + delta)) } : design.quantities[c.productId] ?? {}]),
    );
  };
  // Степперы включены, только если позицию можно пересчитать: каталог загружен, модель и цвета в нём есть
  const editable = !!reprice?.(design, Object.fromEntries(colors.map((c) => [c.productId, design.quantities[c.productId] ?? {}])));

  const change = (productId: string, size: string, delta: 1 | -1) => {
    const quantities = quantitiesWith(productId, size, delta);
    const next = reprice?.(design, quantities);
    if (next) dispatch(designActions.setQuantities({ id: design.id, quantities, price: next }));
  };

  return (
    <CartRow
      index={index}
      removeLabel={`Удалить ${design.garment.name}`}
      onRemove={() => dispatch(designActions.remove(design.id))}
      qty={price.qty}
      total={price.total}
      visual={
        <>
          <CartPhoto label={`Рассмотреть принт крупно: ${design.garment.name}, ${SIDE_TAB[side].toLowerCase()}, ${first?.color ?? ''}`.replace(/, $/, '')} onOpen={openZoom} disabled={!url}>
            {/* eslint-disable-next-line @next/next/no-img-element -- object URL из IndexedDB */}
            {url ? <img src={url} alt="" className={styles.image} /> : <span className={styles.placeholder} aria-hidden="true" />}
          </CartPhoto>
          {sides.length > 1 && (
            <div className={styles.sides} role="group" aria-label="Сторона изделия">
              {sides.map((s) => (
                <button key={s} type="button" className={styles.side} aria-pressed={s === side} onClick={() => setSide(s)}>
                  {SIDE_TAB[s]}
                </button>
              ))}
            </div>
          )}
        </>
      }
    >
      <h2 className={styles.name}>{design.garment.name}</h2>
      <p className={styles.meta}>
        свой принт
        {samePrice && first && <> · <span className={styles.nowrap}>{rub(first.perItem)}&nbsp;за&nbsp;шт.</span></>}
      </p>

      <ul className={styles.colors} aria-label={`Цвета: ${design.garment.name}`}>
        {colors.map((color) => {
          const line = price.lines.find((l) => l.productId === color.productId);
          const rows = rowsFor(color.productId);
          if (!rows.length) return null;
          return (
            <li key={color.productId} className={styles.color}>
              <span className={styles.colorHead}>
                <span className={styles.swatch} style={{ backgroundColor: color.hex }} aria-hidden="true" />
                <span className={styles.colorName}>{color.color}</span>
                {!samePrice && line && <span className={styles.unit}>{rub(line.perItem)}&nbsp;за&nbsp;шт.</span>}
              </span>
              <ul className={styles.sizes} aria-label={`Размеры: ${color.color}`}>
                {rows.map(([size, n]) => {
                  const name = normalizeSizeKey(size);
                  return (
                    <SizeStepper
                      key={size}
                      size={name}
                      label={colors.length > 1 ? `${name}, ${color.color}` : name}
                      qty={n}
                      canDecrease={editable && !last && n > 0}
                      canIncrease={editable && n < 999}
                      last={last}
                      onChange={(delta) => change(color.productId, size, delta)}
                    />
                  );
                })}
              </ul>
            </li>
          );
        })}
      </ul>

      <Link href={`/constructor?edit=${design.id}`} className={styles.edit}>
        <Icon name="brush" size="1.25em" stroke={2} />
        Изменить принт
      </Link>

      <GalleryLightbox
        open={zoom !== null && views.length > 0}
        name={design.garment.name}
        srcs={views.map((f) => f.url)}
        alts={views.map((f) => f.alt)}
        unoptimized
        index={Math.max(0, views.findIndex((f) => f.asset === zoom))}
        onIndex={(i) => setZoom(views[i]?.asset ?? zoom)}
        onClose={() => setZoom(null)}
      />
    </CartRow>
  );
};

export default CartDesignItem;
