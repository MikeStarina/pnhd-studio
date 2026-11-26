'use client';
import { useEffect, useRef, useState } from 'react';
import { useAssetUrl } from '../cart/assets';
import type { CartDesign } from '../cart/types';
import { SIDE_TAB } from '../model/types';
import s from './constructor.module.css';
import { useDismiss } from './useDismiss';

const rub = (n: number) => `${n.toLocaleString('ru-RU')} ₽`;

/** Изделие легло в корзину: что дальше. «Ещё вариант» оставляет макет на холсте — можно сменить цвет или размеры. */
export function AddedPrompt({ design, onCart, onMore, onShop }: {
  design: CartDesign;
  onCart: () => void;
  onMore: () => void;
  onShop: () => void;
}) {
  const { leaving, dismiss } = useDismiss();
  const preview = design.previews[0];
  const url = useAssetUrl(preview?.asset);
  // Куда вернуть фокус: запоминаем при первом рендере — до того, как autoFocus перенесёт его в окно.
  const [back] = useState(() => document.activeElement as HTMLElement | null);
  const more = useRef(onMore);
  more.current = onMore;
  // Escape и подложка — то же, что «Сделать ещё вариант»: остаться в конструкторе.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(more.current); };
    window.addEventListener('keydown', onKey);
    return () => {
      window.removeEventListener('keydown', onKey);
      back?.focus?.();
    };
  }, [dismiss, back]);
  return (
    <div className={s.modalBg} data-leaving={leaving || undefined} onClick={(e) => e.target === e.currentTarget && dismiss(onMore)}>
      <div className={s.modal} role="dialog" aria-modal="true" aria-labelledby="added-title">
        <h3 id="added-title">Добавлено в корзину</h3>
        <div className={s.added}>
          {/* eslint-disable-next-line @next/next/no-img-element -- снимок из IndexedDB, object URL */}
          {url ? <img src={url} alt={preview ? `${SIDE_TAB[preview.side]}, ${preview.color}` : ''} /> : <span aria-hidden />}
          <p>
            <b>{design.garment.name}</b>
            <span className={s.muted}>свой принт · {design.price.qty} шт · {rub(design.price.total)}</span>
          </p>
        </div>
        {/* autoFocus: окно открывается по нажатию, фокус сразу на главном действии */}
        {/* eslint-disable-next-line jsx-a11y/no-autofocus */}
        <button className={s.cta} autoFocus onClick={() => dismiss(onCart)}>Перейти в корзину</button>
        <button className={s.btn} onClick={() => dismiss(onMore)}>Сделать ещё вариант</button>
        <button className={s.btn} onClick={() => dismiss(onShop)}>Продолжить покупки</button>
      </div>
    </div>
  );
}
