import {
  GET_USER_LOGIN_DATA,
  USER_LOGGING_IN,
  UPDATE_USER_AUTH,
  SET_NEW_USER_DATA,
  CREATE_NEW_USER,
  SET_FORGOT_PASSWORD_DATA,
  SET_USER_DATA,
  SET_SHIPPING_CITIES,
  SET_SHIPPING_PVZ,
  SET_DEFAULT_USERSHIPPINGDATA,
} from '../actions/user-data-actions';

const initialState = {
  userLoginData: {
    login: '',
    password: '',
  },
  userAuth: {
    isAuthenticated: false,
    token: '',
  },
  userData: {
    id: 0,
    username: '',
    email: '',
  },
  registerFormData: {
    name: '',
    email: '',
    password: '',
  },
  forgotPasswordData: '',
  userCartData: {
    name: '',
    isNameValid: false,
    surname: '',
    isSurnameValid: false,
    email: '',
    isEmailValid: false,
    phone: '',
    isPhoneValid: false,
    isFormValid: false,
  },
  userShippingData: {
    city: '',
    isCityValid: true,
    pvz: null,
    isPvzValid: true,
  },
};

export const userDataReducer = (state = initialState, action) => {
  switch (action.type) {
    case GET_USER_LOGIN_DATA: {
      return {
        ...state,
        userLoginData: {
          login: action.login,
          password: action.password,
        },
      };
    }
    case USER_LOGGING_IN: {
      return {
        ...state,
        userAuth: {
          isAuthenticated: true,
          token: action.token,
        },
        userData: {
          id: action.id,
          username: action.username,
          email: action.email,
        },
        userLoginData: {
          login: '',
          password: '',
        },
      };
    }
    case UPDATE_USER_AUTH: {
      return {
        ...state,
        userAuth: {
          isAuthenticated: true,
          token: action.token,
        },
        userData: {
          id: action.id,
          username: action.username,
          email: action.email,
        },
      };
    }
    case SET_NEW_USER_DATA: {
      return {
        ...state,
        registerFormData: {
          name: action.name,
          email: action.email,
          password: action.password,
        },
      };
    }
    case CREATE_NEW_USER: {
      return {
        ...state,
        userAuth: {
          isAuthenticated: true,
          token: action.token,
        },
        userData: {
          id: action.id,
          username: action.username,
          email: action.email,
        },
        registerFormData: {
          name: '',
          email: '',
          password: '',
        },
      };
    }
    case SET_FORGOT_PASSWORD_DATA: {
      return {
        ...state,
        forgotPasswordData: action.email,
      };
    }
    case SET_USER_DATA: {
      return {
        ...state,
        userCartData: {
          name:
                        action.inputName === 'name' ?
                          action.inputValue
                          : state.userCartData.name,
          isNameValid:
                        action.inputName === 'name' ?
                          action.validity
                          : state.userCartData.isNameValid,
          surname:
                        action.inputName === 'surname' ?
                          action.inputValue
                          : state.userCartData.surname,
          isSurnameValid:
                        action.inputName === 'surname' ?
                          action.validity
                          : state.userCartData.isSurnameValid,
          phone:
                        action.inputName === 'phone' ?
                          action.inputValue
                          : state.userCartData.phone,
          isPhoneValid:
                        action.inputName === 'phone' ?
                          action.validity
                          : state.userCartData.isPhoneValid,
          email:
                        action.inputName === 'email' ?
                          action.inputValue
                          : state.userCartData.email,
          isEmailValid:
                        action.inputName === 'email' ?
                          action.validity
                          : state.userCartData.isEmailValid,
        },
      };
    }
    case SET_SHIPPING_CITIES: {
      return {
        ...state,
        userShippingData: {
          ...state.userShippingData,
          city: action.payload.item,
          isCityValid: action.payload.isCityValid,
        },
      };
    }

    case SET_SHIPPING_PVZ: {
      return {
        ...state,
        userShippingData: {
          ...state.userShippingData,
          pvz: action.payload.item,
          isPvzValid: action.payload.isPvzValid,
        },
      };
    }

    case SET_DEFAULT_USERSHIPPINGDATA: {
      return {
        ...state,
        userShippingData: {
          city: '',
          isCityValid: true,
          pvz: null,
          isPvzValid: true,
        },
      };
    }

    default:
      return state;
  }
};
