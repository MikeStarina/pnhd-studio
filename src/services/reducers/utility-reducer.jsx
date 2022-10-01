import { OPEN_MODAL_MENU, CLOSE_MODAL_MENU } from "../actions/utility-actions.jsx";




const initialState = {
    mainMenu: {
        isVisible: false,
    },
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


        default: return state;
    }
}