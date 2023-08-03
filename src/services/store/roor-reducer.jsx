import { combineReducers } from 'redux';
import { utilityReducer } from '../reducers/utility-reducer.jsx';
import { editorReducer } from '../reducers/editor-reducer.jsx';
import { shopDataReducer } from '../reducers/shop-data-reducer.jsx';
import { cartDataReducer } from '../reducers/cart-data-reducer.jsx';
import { userDataReducer } from '../reducers/user-data-reducer.jsx';
import { shippingReducer } from '../reducers/shipping-reducer.jsx';
import { itemReducer } from '../reducers/item-reducer.js';

export const rootReducer = combineReducers({
  utilityState: utilityReducer,
  editorState: editorReducer,
  shopData: shopDataReducer,
  cartData: cartDataReducer,
  userData: userDataReducer,
  shippingData: shippingReducer,
  itemReducer,
});
