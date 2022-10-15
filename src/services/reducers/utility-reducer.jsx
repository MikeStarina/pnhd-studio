import { OPEN_MODAL_MENU, CLOSE_MODAL_MENU, SET_ACTIVE_PRICE_TABLE } from "../actions/utility-actions.jsx";




const initialState = {
    mainMenu: {
        isVisible: false,
    },
    mainMenuPriceTable: {
        activeTab: 'DTG',
    }
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


        default: return state;
    }
}