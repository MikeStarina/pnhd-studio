import {
  GET_DATA,
  SET_FIRSTSELECT,
  SET_SECONDSELECT,
  SET_THIRDSELECT,
  SET_FIRSTSELECTEDITEM,
  SET_SECONDSELECTEDITEM,
  SET_THIRDSELECTEDITEM,
  SET_DEFAULTFILTER,
  SET_FILTERS,
} from '../actions/shop-data-actions';

const initialState = {
  data: [],
  firstFilterSelect: [],
  firstFilterSelectedItem: [],
  secondFilterSelect: [],
  secondFilterSelectedItem: [],
  thirdFilterSelect: [],
  thirdFilterSelectedItem: [],
  firstCount: 0,
  secondCount: 0,
  thirdCount: 0,
};

const shopDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_DATA: {
      return {
        ...state,
        data: action.payload,
      };
    }

    case SET_FIRSTSELECT: {
      const selected = state.firstFilterSelectedItem;
      const selectItems = state.firstFilterSelect;
      const indexItem = selected.indexOf(action.payload.category);
      const findIndex = selectItems.findIndex(
        (i) => i.category === action.payload.category,
      );
      let cnt = 0;
      if (indexItem != -1) {
        cnt = state.firstCount - 1;
        selected.splice(indexItem, 1);
        selectItems[findIndex].selected = false;
      } else {
        cnt = state.firstCount + 1;
        selected.push(action.payload.category);
        selectItems[findIndex].selected = true;
      }

      return {
        ...state,
        firstFilterSelect: selectItems,
        firstFilterSelectedItem: selected,
        firstCount: cnt,
      };
    }

    case SET_SECONDSELECT: {
      const selected = state.secondFilterSelectedItem;
      const selectItems = state.secondFilterSelect;
      const indexItem = selected.indexOf(action.payload.category);
      const findIndex = selectItems.findIndex(
        (i) => i.category === action.payload.category,
      );
      let cnt = 0;
      if (indexItem != -1) {
        cnt = state.secondCount - 1;
        selected.splice(indexItem, 1);
        selectItems[findIndex].selected = false;
      } else {
        cnt = state.secondCount + 1;
        selected.push(action.payload.category);
        selectItems[findIndex].selected = true;
      }

      return {
        ...state,
        secondFilterSelect: selectItems,
        secondFilterSelectedItem: selected,
        secondCount: cnt,
      };
    }

    case SET_THIRDSELECT: {
      const selected = state.thirdFilterSelectedItem;
      const selectItems = state.thirdFilterSelect;
      const indexItem = selected.indexOf(action.payload.category);
      const findIndex = selectItems.findIndex(
        (i) => i.category === action.payload.category,
      );
      let cnt = 0;
      if (indexItem != -1) {
        cnt = state.thirdCount - 1;
        selected.splice(indexItem, 1);
        selectItems[findIndex].selected = false;
      } else {
        cnt = state.thirdCount + 1;
        selected.push(action.payload.category);
        selectItems[findIndex].selected = true;
      }

      return {
        ...state,
        thirdFilterSelect: selectItems,
        thirdFilterSelectedItem: selected,
        thirdCount: cnt,
      };
    }

    case SET_FIRSTSELECTEDITEM: {
      return {
        ...state,
        firstFilterSelect: action.payload.filtr1,
        firstFilterSelectedItem: action.payload.frstFilter,
        firstCount: action.payload.count1,
      };
    }

    case SET_SECONDSELECTEDITEM: {
      return {
        ...state,
        secondFilterSelect: action.payload.filtr2,
        secondFilterSelectedItem: action.payload.secondFilter,
        secondCount: action.payload.count2,
      };
    }

    case SET_THIRDSELECTEDITEM: {
      return {
        ...state,
        thirdFilterSelect: action.payload.filtr3,
        thirdFilterSelectedItem: action.payload.thirdFilter,
        thirdCount: action.payload.count3,
      };
    }

    case SET_DEFAULTFILTER: {
      const arr1 = [];
      const arr2 = [];
      const arr3 = [];
      const resultArr1 = [];
      const resultArr2 = [];
      const resultArr3 = [];
      state.data.forEach((item) => {
        if (!arr1.includes(item.filter_category)) {
          arr1.push(item.filter_category);
          resultArr1.push({ selected: false, category: `${item.filter_category}` });
        }
        if (!arr2.includes(item.filter_type)) {
          arr2.push(item.filter_type);
          resultArr2.push({ selected: false, category: `${item.filter_type}` });
        }
        if (!arr3.includes(item.filter_color)) {
          arr3.push(item.filter_color);
          resultArr3.push({ selected: false, category: `${item.filter_color}` });
        }
      });
      return {
        ...state,
        firstFilterSelect: resultArr1,
        firstFilterSelectedItem: [],
        firstCount: 0,
        secondFilterSelect: resultArr2,
        secondFilterSelectedItem: [],
        secondCount: 0,
        thirdFilterSelect: resultArr3,
        thirdFilterSelectedItem: [],
        thirdCount: 0,
      };
    }

    case SET_FILTERS: {
      const arr1 = [];
      const arr2 = [];
      const arr3 = [];
      const resultArr1 = [];
      const resultArr2 = [];
      const resultArr3 = [];
      action.payload.forEach((item) => {
        if (!arr1.includes(item.filter_category)) {
          arr1.push(item.filter_category);
          resultArr1.push({ selected: false, category: `${item.filter_category}` });
        }
        if (!arr2.includes(item.filter_type)) {
          arr2.push(item.filter_type);
          resultArr2.push({ selected: false, category: `${item.filter_type}` });
        }
        if (!arr3.includes(item.filter_color)) {
          arr3.push(item.filter_color);
          resultArr3.push({ selected: false, category: `${item.filter_color}` });
        }
      });
      return {
        ...state,
        firstFilterSelect: resultArr1,
        secondFilterSelect: resultArr2,
        thirdFilterSelect: resultArr3,
        defaultFirstFilterSelect: resultArr1,
        defaultSecondFilterSelect: resultArr2,
        defaulthirdFilterSelect: resultArr3,
      };
    }
    default:
      return state;
  }
};

export default shopDataReducer;
