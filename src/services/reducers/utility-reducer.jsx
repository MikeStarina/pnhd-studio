import { OPEN_MODAL_MENU, CLOSE_MODAL_MENU, SET_ACTIVE_PRICE_TABLE, GET_ORDER_FORM_DATA } from "../actions/utility-actions.jsx";




const initialState = {
    mainMenu: {
        isVisible: false,
    },
    mainMenuPriceTable: {
        activeTab: 'DTG',
    },

    orderFormData : {
        name: '',
        email: '',
        phone: '',
        message: '',
    },

    isFormDataSet: false,
}


export const utilityReducer = (state = initialState, action) => {
    switch(action.type) {
        case OPEN_MODAL_MENU: {
            return {
                ...state,
                mainMenu: {
                    isVisible: true,
                }
            }
        }


        case CLOSE_MODAL_MENU: {
            return {
                ...state,
                mainMenu: {
                    isVisible: false,
                }
            }
        }

        case SET_ACTIVE_PRICE_TABLE: {
            return {
                ...state,
                mainMenuPriceTable: {
                    activeTab: action.payload,
                }
            }
        }

        case GET_ORDER_FORM_DATA: {
            return {
                ...state,
                orderFormData: {
                    name: action.name,
                    email: action.email,
                    phone: action.phone,
                    message: action.message,
                },
                isFormDataSet: true,
            }
        }

        


        default: return state;
    }
}