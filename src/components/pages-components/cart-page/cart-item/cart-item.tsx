'use client';
import React, { useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ICartOrderElement } from '@/app/utils/types';
import { itemPrintUnitPrice, ruPrintPlace } from '@/app/utils/cart-utils';
import { productMainPhotoUrl } from '@/app/utils/product-photos';
import GalleryLightbox from '@/components/catalog/product-gallery/gallery-lightbox';
import { normalizeSizeKey } from '@/app/utils/product-sizes';
import { rub } from '@/components/catalog/data';
import { Icon } from '@/features/constructor/ui/icons';
import { useAppDispatch } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { trackAdd, trackRemove } from '@/components/site/analytics';
import SizeStepper from '../size-stepper/size-stepper';
import CartRow from '../cart-row/cart-row';
import CartPhoto from '../cart-photo/cart-photo';
import styles from './cart-item.module.css';

/** Строка размера обычной позиции: меняет количество в корзине и шлёт события Метрики. */
const SizeRow: React.FC<{ elem: ICartOrderElement; name: string; userQty: number; stock: number; last: boolean }> = ({
  elem,
  name,
  userQty,
  stock,
  last,
}) => {
  const dispatch = useAppDispatch();
  const size = normalizeSizeKey(name);
  const change = (delta: 1 | -1) => {
    dispatch(cartActions.changeSizeQty({ itemCartId: elem.itemCartId, name, delta }));
    const product = { id: elem.item._id, name: elem.item.name, price: elem.item.price, variant: elem.item.color, quantity: 1 };
    if (delta > 0) trackAdd(product);
    else trackRemove(product);
  };

  return (
    <SizeStepper
      size={size}
      label={size}
      qty={userQty}
      canDecrease={!last && userQty > 0}
      canIncrease={userQty < stock}
      last={last}
      onChange={change}
    />
  );
};

/** Позиция корзины — готовая вещь: название (ссылка на товар), цена за штуку, степперы размеров, принты, правка. */
const CartItem: React.FC<{ elem: ICartOrderElement; index: number }> = ({ elem, index }) => {
  const dispatch = useAppDispatch();
  const { item } = elem;
  const sizes = item.sizes.filter((size) => (size.userQty ?? 0) > 0);
  const qty = sizes.reduce((sum, size) => sum + (size.userQty ?? 0), 0);
  const prints = (elem.prints ?? []).filter((print) => print.file?.url);
  const total = (item.price + itemPrintUnitPrice(elem)) * qty;
  const productHref = `/shop/${item.slug}`;
  // Просмотр крупно — те же фото, что в галерее товара; у старых товаров без списка фото — главное фото
  const photos = item.photos?.length ? item.photos : [productMainPhotoUrl(item)];
  const [zoom, setZoom] = useState<number | null>(null);

  // Размеры, которые были в позиции при открытии корзины: строка, сведённая к нулю, не пропадает из-под пальца.
  const shown = useRef(new Set(sizes.map((size) => size.name)));
  sizes.forEach((size) => shown.current.add(size.name));
  const rows = item.sizes.filter((size) => shown.current.has(size.name));

  // Позиция уходит из корзины сразу, а сворачивается уже на выходе (AnimatePresence в списке):
  // корзина и итог не зависят от того, доиграла ли анимация.
  const remove = () => {
    dispatch(cartActions.deleteItemFromCart({ itemCartId: elem.itemCartId }));
    trackRemove({ id: item._id, name: item.name, price: item.price, quantity: qty, variant: item.color });
  };

  return (
    <CartRow
      index={index}
      removeLabel={`Удалить ${item.name}`}
      onRemove={remove}
      qty={qty}
      total={total}
      visual={
        <CartPhoto label={`Рассмотреть фото крупно: ${item.name}`} onOpen={() => setZoom(0)}>
          {/* sizes повторяет --cart-thumb (112 / 176 px): переменную CSS сюда не передать */}
          <Image src={productMainPhotoUrl(item)} alt="" fill sizes="(max-width: 599px) 112px, 176px" className={styles.image} />
        </CartPhoto>
      }
    >
      <h2 className={styles.name}>
        <Link href={productHref} className={styles.nameLink}>
          {item.name}
        </Link>
      </h2>
      <p className={styles.unit}>
        {rub(item.price)} за&nbsp;шт.
      </p>

      <ul className={styles.sizes} aria-label={`Размеры: ${item.name}`}>
        {rows.map((size) => (
          <SizeRow key={size.name} elem={elem} name={size.name} userQty={size.userQty ?? 0} stock={size.qty} last={qty <= 1} />
        ))}
      </ul>

      {prints.length > 0 && (
        <ul className={styles.prints} aria-label="Принты">
          {prints.map((print, i) => (
            <li key={print.id || i} className={styles.print}>
              {/* eslint-disable-next-line @next/next/no-img-element -- файл принта лежит на стороннем хранилище, размеры неизвестны */}
              <img src={print.file!.url} alt="" className={styles.printThumb} loading="lazy" />
              <span className={styles.printText}>
                {ruPrintPlace(print.cartParams?.place ?? '') || `Принт ${i + 1}`}
                {print.cartParams?.format ? `, ${print.cartParams.format}` : ''}
                {print.cartParams?.size ? `, ${print.cartParams.size}` : ''}
              </span>
              <span className={styles.printPrice}>
                {qty} × {rub(print.cartParams?.price ?? 0)}
              </span>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.links}>
        <Link href={`${productHref}?itemCartId=${elem.itemCartId}`} className={styles.edit}>
          <Icon name="plus" size="1.25em" stroke={2} />
          Другой размер
        </Link>
        {item.isForPrinting && (
          // Конструктор откроет эту вещь с теми же размерами; изделие с принтом заменит её в корзине.
          <Link
            href={`/constructor?product=${encodeURIComponent(item.slug)}&replace=${encodeURIComponent(elem.itemCartId)}`}
            className={styles.edit}
          >
            <Icon name="image" size="1.25em" stroke={2} />
            Нанести принт
          </Link>
        )}
      </div>

      <GalleryLightbox
        open={zoom !== null}
        name={item.name}
        srcs={photos}
        index={zoom ?? 0}
        onIndex={setZoom}
        onClose={() => setZoom(null)}
      />
    </CartRow>
  );
};

export default CartItem;
