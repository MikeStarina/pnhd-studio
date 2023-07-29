import { GET_DATA, SET_FILTER } from '../actions/shop-data-actions.jsx';

const initialState = {
  data: [],
  filter: '',
};

export const shopDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DATA: {
      return {
        ...state,
        data: action.payload,
      };
    }
    case SET_FILTER: {
      return {
        ...state,
        filter: action.payload,
      };
    }

    default:
      return state;
  }
};
