import {
  GET_SDEK_CITIES,
  GET_SDEK_POINTS,
  GET_SDEK_SHIPPIG_TARIF,
  SET_SDEK_DEFAULT_STATE,
  SET_SDEK_RESET_POINTS,
} from '../actions/shipping-actions';

export const initialState = {
  shippingData: {
    isShipping: false,
    shippingCities: [],
    shippingTarif: {},
    shippingPoints: [],
  },
};

export const shippingReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_SDEK_CITIES: {
      return {
        ...state,
        shippingData: {
          ...state.shippingData,
          isShipping: true,
          shippingCities: action.payload,
        },
      };
    }

    case GET_SDEK_POINTS: {
      return {
        ...state,
        shippingData: {
          ...state.shippingData,
          shippingPoints: action.payload,
        },
      };
    }

    case GET_SDEK_SHIPPIG_TARIF: {
      return {
        ...state,
        shippingData: {
          ...state.shippingData,
          shippingTarif: action.payload,
        },
      };
    }

    case SET_SDEK_DEFAULT_STATE: {
      return {
        shippingData: {
          isShipping: false,
          shippingCities: [],
          shippingTarif: {},
          shippingPoints: [],
        },
      };
    }

    case SET_SDEK_RESET_POINTS: {
      return {
        ...state,
        shippingData: {
          ...state.shippingData,
          shippingTarif: {},
          shippingPoints: [],
        },
      };
    }

    default:
      return state;
  }
};
