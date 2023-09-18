import { GET_FRIEND_PRODUCT } from '../actions/friends-actions';

export const initialState = {
  data: null,
  products: null,
};

export const friendReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_FRIEND_PRODUCT: {
      return { ...state, data: action.payload.data, products: action.payload.data.products };
    }
    default:
      return state;
  }
};
