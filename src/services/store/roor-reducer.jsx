import { combineReducers } from 'redux';
import utilityReducer from '../reducers/utility-reducer';
import editorReducer from '../reducers/editor-reducer';
import shopDataReducer from '../reducers/shop-data-reducer';
import cartDataReducer from '../reducers/cart-data-reducer';
import userDataReducer from '../reducers/user-data-reducer';
import shippingReducer from '../reducers/shipping-reducer';
import itemReducer from '../reducers/item-reducer';
import friendReducer from '../reducers/friends-reducer';

const rootReducer = combineReducers({
  utilityState: utilityReducer,
  editorState: editorReducer,
  shopData: shopDataReducer,
  cartData: cartDataReducer,
  userData: userDataReducer,
  shippingData: shippingReducer,
  friendData: friendReducer,
  itemReducer,
});

export default rootReducer;
