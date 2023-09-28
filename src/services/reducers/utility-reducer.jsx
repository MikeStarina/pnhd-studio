import {
  OPEN_MODAL_MENU,
  ORDER_ERROR,
  CLEAR_LEAD_FORM_DATA,
  CLOSE_MODAL_MENU,
  SET_ACTIVE_PRICE_TABLE,
  GET_ORDER_FORM_DATA,
  IS_IMAGE_LOADING,
  CLOSE_POPUP_HEADER,
  OPEN_POPUP_HEADER,
  OPEN_POPUP,
  CLOSE_POPUP,
} from '../actions/utility-actions';

const initialState = {
  mainMenu: {
    isVisible: false,
  },
  isPopupVisible: false,
  isOtherPopupVisible: null,
  mainMenuPriceTable: {
    activeTab: 'DTG',
  },

  orderFormData: {
    name: '',
    phone: '',
  },

  isFormDataSet: false,
  isImageLoading: false,
  message: '',
};

const utilityReducer = (state = initialState, action) => {
  switch (action.type) {
    case OPEN_MODAL_MENU: {
      return {
        ...state,
        mainMenu: {
          isVisible: true,
        },
      };
    }

    case CLEAR_LEAD_FORM_DATA: {
      return {
        ...state,
        orderFormData: {
          name: '',
          phone: '',
        },
        message: action.text,
      };
    }

    case OPEN_POPUP: {
      return {
        ...state,
        isOtherPopupVisible: action.arr,
        isImageLoading: false,
      };
    }

    case CLOSE_POPUP: {
      return {
        ...state,
        isOtherPopupVisible: null,
      };
    }

    case OPEN_POPUP_HEADER: {
      return {
        ...state,
        isPopupVisible: true,
      };
    }

    case CLOSE_POPUP_HEADER: {
      return {
        ...state,
        isPopupVisible: false,
      };
    }

    case CLOSE_MODAL_MENU: {
      return {
        ...state,
        mainMenu: {
          isVisible: false,
        },
      };
    }

    case SET_ACTIVE_PRICE_TABLE: {
      return {
        ...state,
        mainMenuPriceTable: {
          activeTab: action.payload,
        },
      };
    }

    case GET_ORDER_FORM_DATA: {
      return {
        ...state,
        orderFormData: {
          name: action.field === 'name' ? action.data : state.orderFormData.name,
          phone: action.field === 'phone' ? action.data : state.orderFormData.phone,
        },
        isFormDataSet: true,
        message: '',
      };
    }
    case IS_IMAGE_LOADING: {
      return {
        ...state,
        isImageLoading: action.payload,
      };
    }
    case ORDER_ERROR: {
      return {
        ...state,
        message: action.text,
      };
    }

    default:
      return state;
  }
};

export default utilityReducer;
