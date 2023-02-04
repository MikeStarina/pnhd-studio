import { OPEN_MODAL_MENU, CLEAR_LEAD_FORM_DATA, CLOSE_MODAL_MENU, SET_ACTIVE_PRICE_TABLE, GET_ORDER_FORM_DATA, IS_IMAGE_LOADING, SET_POPUP_VISIBILITY } from "../actions/utility-actions.jsx";




const initialState = {
    mainMenu: {
        isVisible: false,
    },
    isPopupVisible: false,
    mainMenuPriceTable: {
        activeTab: 'DTG',
    },

    orderFormData : {
        name: '',
        phone: '',
    },

    isFormDataSet: false,
    isImageLoading: false,
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

        case CLEAR_LEAD_FORM_DATA: {

            return {
                ...state,
                orderFormData: {
                    name: '',
                    phone: ''
                }
            }
        }

        case SET_POPUP_VISIBILITY: {
            return {
                ...state,
                isPopupVisible: !state.isPopupVisible
            }
        };


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
                    name: action.field === 'name' ? action.data : state.orderFormData.name,
                    phone: action.field === 'phone' ? action.data : state.orderFormData.phone
                },
                isFormDataSet: true,
            }
        }
        case IS_IMAGE_LOADING: {
            return {
                ...state,
                isImageLoading: action.payload
            }
        }

        


        default: return state;
    }
}