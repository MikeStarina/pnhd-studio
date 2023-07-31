import {
  GET_DATA,
  SET_FILTER,
  SET_FIRSTSELECT,
  SET_SECONDSELECT,
  SET_THIRDSELECT,
} from "../actions/shop-data-actions.jsx";

const initialState = {
  data: [],
  filter: "",
  firstFilterSelect: [
    { categorySelect: "Мужское", selected: false, category: "man" },
    { categorySelect: "Женское", selected: false, category: "woman" },
    { categorySelect: "Детское", selected: false, category: "kids" },
    { categorySelect: "Аксессуары", selected: false, category: "accesorize" },
    { categorySelect: "PNHD & FRIENDS", selected: false, category: "friends" },
  ],
  firstFilterSelectedItem: [],
  secondFilterSelect: [
    { categorySelect: "Футболка", selected: false, category: "tshirt" },
    { categorySelect: "Худи", selected: false, category: "hoodie" },
    { categorySelect: "Шоппер", selected: false, category: "totebag" },
    { categorySelect: "Кепка", selected: false, category: "cap" },
    { categorySelect: "Лонгслив", selected: false, category: "longsleeve" },
    { categorySelect: "Свитшот", selected: false, category: "sweatshirt" },
  ],
  secondFilterSelectedItem: [],
  thirdFilterSelect: [
    { categorySelect: "Белый", selected: false, category: "белый" },
    { categorySelect: "Черный", selected: false, category: "черный" },
    { categorySelect: "Суровый", selected: false, category: "суровый" },
    { categorySelect: "Бордовый", selected: false, category: "бордовый" },
    { categorySelect: "Хаки", selected: false, category: "хаки" },
    { categorySelect: "Синий", selected: false, category: "синий" },
    { categorySelect: "Песочный", selected: false, category: "песочный" },
    { categorySelect: "Темно-синий", selected: false, category: "темно-синий" },
    { categorySelect: "Голубой", selected: false, category: "голубой" },
    { categorySelect: "Фиолетовый", selected: false, category: "фиолетовый" },
    { categorySelect: "Оранжевый", selected: false, category: "оранжевый" },
    { categorySelect: "Красный", selected: false, category: "красный" },
    { categorySelect: "Натуральный", selected: false, category: "натуральный" },
    { categorySelect: "Василек", selected: false, category: "василек" },
    { categorySelect: "Серый", selected: false, category: "серый" },
    { categorySelect: "Зеленый", selected: false, category: "зеленый" },
  ],
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
        (i) => i.category === action.payload.category
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
        (i) => i.category === action.payload.category
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

    default:
      return state;
  }
};
