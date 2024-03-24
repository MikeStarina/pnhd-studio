import { configureStore } from '@reduxjs/toolkit'
import { reducer as utilsReducer } from './utils-slice/utils.slice';
import { reducer as cartReducer } from './cart-slice/cart.slice';
import { reducer as constructorReducer } from './constructor-slice/constructor.slice';
import { reducer as leadReducer } from './lead-slice/lead.slice';
import { api } from '@/api/api';
import { setupListeners } from '@reduxjs/toolkit/query'



export const store = configureStore({
  reducer: {
    utils: utilsReducer,
    printConstructor: constructorReducer,
    cart: cartReducer,
    leads: leadReducer,
    [ api.reducerPath ]: api.reducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware().concat(api.middleware),
})

setupListeners(store.dispatch)
// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch