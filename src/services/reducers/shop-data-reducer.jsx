import {
  GET_DATA,
  SET_FILTER,
  SET_FIRSTSELECT,
} from "../actions/shop-data-actions.jsx";

const initialState = {
  data: [],
  filter: "",
  firstFilterSelect: [
    { category: "Мужское", selected: false },
    { category: "Женское", selected: false },
  ],
  firstFilterSelectedItem: [],
  secondFilterSelect: [],
  secondFilterSelectedItem: [],
  thirdFilterSelect: [],
  thirdFilterSelectedItem: [],
  firstCount: 0,
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
    case SET_FIRSTSELECT: {
      const selected = state.firstFilterSelectedItem;
      const selectItems = state.firstFilterSelect;
      const indexItem = selected.indexOf(action.payload);
      const findIndex = selectItems.findIndex(
        (i) => i.category === action.payload
      );
      let cnt = 0;

      if (indexItem != -1) {
        cnt = state.firstCount - 1;
        selected.splice(indexItem, 1);
        selectItems[findIndex].selected = false;
      } else {
        cnt = state.firstCount + 1;
        selected.push(action.payload);
        selectItems[findIndex].selected = true;
      }

      return {
        ...state,
        firstFilterSelect: selectItems,
        firstFilterSelectedItem: selected,
        firstCount: cnt,
      };
    }

    default:
      return state;
  }
};
