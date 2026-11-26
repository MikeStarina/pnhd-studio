'use client';
import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useStore } from 'react-redux';
import { AddedPrompt, ConstructorApp } from '@/features/constructor';
import { findBySlug } from '@/features/constructor/api/catalog';
import { getAsset } from '@/features/constructor/cart/assets';
import type { CartDesign } from '@/features/constructor/cart/types';
import type { DraftState } from '@/features/constructor/model/draft';
import type { Garment } from '@/features/constructor/model/types';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import type { RootState } from '@/redux/store';
import { actions as designActions } from '@/redux/cart-designs-slice/cart-designs.slice';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { trackAdd, trackRemove } from '@/components/site/analytics';
import { useConstructor } from '@/features/constructor/model/store';

/**
 * Конструктор на сайте: готовое изделие с принтом уходит в корзину (adr/0001).
 * - `?edit=<id позиции>` — правка позиции «свой принт»: открывается её макет, «Сохранить» заменяет позицию;
 * - `?product=<slug>&replace=<itemCartId>` — принт на товар из корзины: та же вещь, те же размеры,
 *   а голая вещь из корзины уходит, когда изделие с принтом туда ляжет.
 */
export function ConstructorWithCart() {
  const dispatch = useAppDispatch();
  const store = useStore<RootState>();
  const router = useRouter();
  // Только что добавленное изделие: окно «Добавлено в корзину». При правке позиции окна нет — сразу в корзину.
  const [added, setAdded] = useState<CartDesign | null>(null);
  // Параметры запоминаем при первом рендере: конструктор сам убирает ?product из адреса.
  // useSearchParams, а не window.location: при переходе по ссылке без перезагрузки адрес в окне ещё старый.
  const search = useSearchParams();
  const params = useRef<{ edit: string | null; replace: string | null; product: string | null }>();
  params.current ??= { edit: search.get('edit'), replace: search.get('replace'), product: search.get('product') };
  const { edit, replace, product } = params.current;
  // Позиции из ссылки ?edit= может уже не быть (удалена, «Назад» после сохранения) — тогда это обычное добавление.
  const editFound = useAppSelector((s) => !!edit && (!s.cartDesigns.hydrated || s.cartDesigns.items.some((d) => d.id === edit)));

  const initial = async (garments: Garment[]): Promise<{ start?: DraftState; notice?: string }> => {
    await cartRead(store);
    if (edit) {
      const design = store.getState().cartDesigns.items.find((d) => d.id === edit);
      if (design) return { start: await fromDesign(design) };
      return { notice: 'Этого изделия уже нет в корзине — собери новое.' };
    }
    if (replace && product) {
      const elem = store.getState().cart.order?.find((e) => e.itemCartId === replace);
      const found = findBySlug(garments, product);
      if (!elem || !found) return {};
      const sizes = Object.fromEntries(elem.item.sizes.filter((z) => (z.userQty ?? 0) > 0).map((z) => [z.name, z.userQty ?? 0]));
      return {
        start: {
          garmentId: found.garment.id, variantId: found.variant.productId, side: 'front', method: useConstructor.getState().method,
          quantities: { [found.variant.productId]: sizes }, layers: [],
        },
      };
    }
    return {};
  };

  const add = (design: CartDesign) => {
    const old = edit ? store.getState().cartDesigns.items.find((d) => d.id === edit) : undefined;
    const editing = !!old;
    // Для Метрики правка — это замена: старая позиция ушла, новая пришла, иначе каждая правка раздувает «добавления».
    for (const line of old?.price.lines ?? []) {
      trackRemove({ id: line.productId, name: `${old!.garment.name} — свой принт`, price: line.perItem, variant: line.color, quantity: line.qty });
    }
    if (old) dispatch(designActions.replace({ id: old.id, design }));
    else dispatch(designActions.add(design));
    if (replace && store.getState().cart.order?.some((e) => e.itemCartId === replace)) {
      dispatch(cartActions.deleteItemFromCart({ itemCartId: replace }));
    }
    for (const line of design.price.lines) {
      trackAdd({ id: line.productId, name: `${design.garment.name} — свой принт`, price: line.perItem, variant: line.color, quantity: line.qty });
    }
    if (editing) router.push('/cart');
    else setAdded(design);
  };

  return (
    <ConstructorApp
      onAddToCart={add}
      initial={edit || replace ? initial : undefined}
      draftScope={edit ? `edit:${edit}` : replace ? `replace:${replace}` : undefined}
      addLabel={editFound ? 'Сохранить в корзине' : undefined}
    >
      {added && (
        <AddedPrompt
          design={added}
          onCart={() => router.push('/cart')}
          onMore={() => setAdded(null)}
          onShop={() => router.push('/shop')}
        />
      )}
    </ConstructorApp>
  );
}

/** Корзина читается из хранилища браузера при загрузке страницы (cart-persist) — дожидаемся. */
function cartRead(store: ReturnType<typeof useStore<RootState>>): Promise<void> {
  const ready = () => store.getState().cart.hydrated && store.getState().cartDesigns.hydrated;
  if (ready()) return Promise.resolve();
  return new Promise((resolve) => {
    const stop = store.subscribe(() => {
      if (!ready()) return;
      stop();
      resolve();
    });
  });
}

/** Позиция корзины → состояние конструктора. Картинки — из IndexedDB, как временные адреса blob:. */
async function fromDesign(d: CartDesign): Promise<DraftState> {
  const layers = await Promise.all(d.layers.map(async (l) => {
    if (l.kind !== 'image' || !l.src.startsWith(`${d.id}/`)) return l;
    const blob = await getAsset(l.src);
    return blob ? { ...l, src: URL.createObjectURL(blob) } : l;
  }));
  return {
    garmentId: d.garment.id,
    variantId: d.price.lines[0]?.productId ?? Object.keys(d.quantities)[0] ?? null,
    side: d.sides[0] ?? 'front',
    method: d.method,
    quantities: d.quantities,
    layers,
  };
}
