import {
  GET_DATA,
  SET_FILTER,
  SET_FIRSTSELECT,
} from "../actions/shop-data-actions.jsx";

const initialState = {
  data: [],
  filter: "",
  firstFilterSelect: [
    { categorySelect: "Мужское", selected: false, category: 'man' },
    { categorySelect: "Женское", selected: false, category: 'woman' }, 
  ],
  firstFilterSelectedItem: [],
  secondFilterSelect: [],
  secondFilterSelectedItem: [],
  thirdFilterSelect: [],
  thirdFilterSelectedItem: [],
  firstCount: 0,
  secondCount: 0,
  thirdCount: 0,
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
      const indexItem = selected.indexOf(action.payload.category);
      const findIndex = selectItems.findIndex(
        
        (i) => i.category === action.payload.category
      );
      let cnt = 0;
      if (indexItem != -1) {
        cnt = state.firstCount - 1;
        selected.splice(indexItem, 1);
        console.log(findIndex)
        selectItems[findIndex].selected = false;
      } else {
        cnt = state.firstCount + 1;
        selected.push(action.payload.category);
        console.log(findIndex)
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
