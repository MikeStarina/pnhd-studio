'use client';
import { useEffect } from 'react';
import { useStore } from 'react-redux';
import { ICartOrderElement } from '@/app/utils/types';
import type { CartDesign } from '@/features/constructor/cart/types';
import { collectGarbage, deleteDesignAssets } from '@/features/constructor/cart/assets';
import { actions as cartActions } from './cart-slice/cart.slice';
import { actions as designActions } from './cart-designs-slice/cart-designs.slice';
import type { AppDispatch, RootState } from './store';

const KEY = 'order';
/** Позиции «свой принт»: только описание, картинки — в IndexedDB (features/constructor/cart/assets). */
const DESIGNS_KEY = 'cart-designs';

/** Массив из хранилища; пустая строка (так раньше чистили после заказа) и битый JSON — пусто. */
const readList = <T,>(raw: string | null): T[] => {
    if (!raw) return [];
    try {
        const parsed: unknown = JSON.parse(raw);
        return Array.isArray(parsed) ? (parsed as T[]) : [];
    } catch {
        return [];
    }
};
const readOrder = (raw: string | null) => readList<ICartOrderElement>(raw);
const readDesigns = (raw: string | null) => readList<CartDesign>(raw);

/**
 * Корзина при открытии страницы, с переносом старого значения из sessionStorage.
 * Закрытое хранилище (Safari с блокировкой cookie) бросает SecurityError — тогда корзина пустая, но страницы работают.
 */
const load = (): ICartOrderElement[] => {
    try {
        const legacy = sessionStorage.getItem(KEY);
        if (legacy !== null) {
            if (!localStorage.getItem(KEY) && readOrder(legacy).length) localStorage.setItem(KEY, legacy);
            sessionStorage.removeItem(KEY);
        }
        return readOrder(localStorage.getItem(KEY));
    } catch {
        return [];
    }
};

const loadDesigns = (): CartDesign[] => {
    try {
        return readDesigns(localStorage.getItem(DESIGNS_KEY));
    } catch {
        return [];
    }
};

/** Хранилище переполнено или закрыто (Safari в приватном режиме): корзина живёт до закрытия вкладки, покупка не ломается. */
const save = (key: string, list: unknown[] | undefined) => {
    try {
        if (list?.length) localStorage.setItem(key, JSON.stringify(list));
        else localStorage.removeItem(key);
    } catch {
        // Сохранить не вышло — корзина остаётся в памяти страницы.
    }
};

/** Позиции, которых больше нет, — их картинки из IndexedDB больше не нужны. */
const dropAssets = (before: CartDesign[], after: CartDesign[]) => {
    const kept = new Set(after.map((d) => d.id));
    for (const d of before) if (!kept.has(d.id)) deleteDesignAssets(d.id).catch(() => undefined);
};

/**
 * Корзина живёт в localStorage: переживает перезагрузку, закрытие браузера и видна в соседних вкладках.
 * Раньше её держали в sessionStorage — при первом заходе старое значение переносится.
 * Пока корзина не прочитана, `cart.hydrated` = false, и страницы не считают её пустой.
 */
const CartPersist: React.FC = () => {
    const store = useStore<RootState>();

    useEffect(() => {
        const dispatch = store.dispatch as AppDispatch;
        dispatch(cartActions.restoreCart(load()));
        dispatch(designActions.restore(loadDesigns()));
        // Картинки позиций, удалённых без этой вкладки или брошенных на полпути.
        collectGarbage(store.getState().cartDesigns.items.map((d) => d.id)).catch(() => undefined);

        const last = { order: store.getState().cart.order, designs: store.getState().cartDesigns.items };
        const unsubscribe = store.subscribe(() => {
            const { cart, cartDesigns } = store.getState();
            if (cart.order !== last.order) {
                last.order = cart.order;
                save(KEY, cart.order);
            }
            if (cartDesigns.items !== last.designs) {
                dropAssets(last.designs, cartDesigns.items);
                last.designs = cartDesigns.items;
                save(DESIGNS_KEY, cartDesigns.items);
            }
        });

        // Другая вкладка поменяла корзину — подхватываем, чтобы не затереть её своим старым состоянием.
        const onStorage = (event: StorageEvent) => {
            if (event.key === KEY || event.key === null) {
                dispatch(cartActions.restoreCart(readOrder(event.newValue ?? localStorage.getItem(KEY))));
                last.order = store.getState().cart.order;
            }
            if (event.key === DESIGNS_KEY || event.key === null) {
                // Картинки удалённых там позиций уже убрала та вкладка.
                dispatch(designActions.restore(readDesigns(event.newValue ?? localStorage.getItem(DESIGNS_KEY))));
                last.designs = store.getState().cartDesigns.items;
            }
        };
        window.addEventListener('storage', onStorage);
        return () => {
            unsubscribe();
            window.removeEventListener('storage', onStorage);
        };
    }, [store]);

    return null;
};

export default CartPersist;
