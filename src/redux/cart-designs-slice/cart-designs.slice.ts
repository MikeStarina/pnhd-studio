import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { CartDesign } from '@/features/constructor/cart/types';

/**
 * Позиции «свой принт» в корзине. Отдельно от `cart.order`: у них свой формат и своя отправка
 * (adr/0001), а оформление каталога их не трогает и не стирает.
 */
interface State {
  items: CartDesign[];
  /** Прочитаны из хранилища браузера (см. cart-persist). */
  hydrated: boolean;
}

const initialState: State = { items: [], hydrated: false };

const slice = createSlice({
  name: 'cartDesigns',
  initialState,
  reducers: {
    restore: (state, action: PayloadAction<CartDesign[]>) => {
      state.items = action.payload;
      state.hydrated = true;
    },
    add: (state, action: PayloadAction<CartDesign>) => {
      state.items.push(action.payload);
    },
    /** Правка из конструктора: та же позиция на том же месте. */
    replace: (state, action: PayloadAction<{ id: string; design: CartDesign }>) => {
      const i = state.items.findIndex((d) => d.id === action.payload.id);
      if (i >= 0) state.items[i] = action.payload.design;
    },
    /** Количество правится в корзине: вместе с ним — пересчитанная цена, иначе без каталога показалась бы старая. */
    setQuantities: (state, action: PayloadAction<{ id: string; quantities: CartDesign['quantities']; price: CartDesign['price'] }>) => {
      const design = state.items.find((d) => d.id === action.payload.id);
      if (!design) return;
      design.quantities = action.payload.quantities;
      design.price = action.payload.price;
    },
    remove: (state, action: PayloadAction<string>) => {
      state.items = state.items.filter((d) => d.id !== action.payload);
    },
    /** Заказ оформлен. */
    clear: (state) => {
      state.items = [];
    },
  },
});

export const { actions, reducer } = slice;
