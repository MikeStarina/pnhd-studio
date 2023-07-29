export const ADD_ITEM_SIZE = 'ADD_ITEM_SIZE';
export const UPDATE_ITEM_ORDER = 'UPDATE_ITEM_ORDER';
export const CLEAR_ITEM_ORDER = 'CLEAR_ITEM_ORDER';
export const DELETE_ITEM_ORDER = 'DELETE_ITEM_ORDER';
export const FLAG_SIZE_IS = 'FLAG_SIZE_IS';
export const FLAG_SIZE_IS_NOT = 'FLAG_SIZE_IS_NOT';

export const addItemSize = (payload) => {
  return function (dispatch) {
    dispatch({ type: ADD_ITEM_SIZE, payload });
  };
};

export const updateItemOrder = (arr) => {
  return function (dispatch) {
    dispatch({ type: UPDATE_ITEM_ORDER, arr });
  };
};

export const clearItemOrder = () => ({
  type: CLEAR_ITEM_ORDER,
});

export const deleteItemOrder = () => ({
  type: DELETE_ITEM_ORDER,
});

export const getSizeFlag = () => ({
  type: FLAG_SIZE_IS,
});

export const dropSizeFlag = () => ({
  type: FLAG_SIZE_IS_NOT,
});
