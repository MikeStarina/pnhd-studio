import { IMAGE_SELECT, IMAGE_DESELECT, ADD_FILE, DELETE_FILE, SET_ACTIVE_VIEW } from "../actions/editor-actions";



const initialState = {
    isSelected: false,
    file: '',
    activeView: 'front',
}



export const editorReducer = (state = initialState, action) => {

    switch(action.type) {
        
        case IMAGE_SELECT: {

           
            return {
                ...state,
                isSelected: true,
            }
        }

        case IMAGE_DESELECT: {
            return {
                ...state,
                isSelected: false,
            }
        }

        case ADD_FILE: {
            return {
                ...state,
                file: action.payload,
            }
        }

        case DELETE_FILE: {
            return {
                ...state,
                file: '',
            }
        }
        case SET_ACTIVE_VIEW: {
            return {
                ...state,
                activeView: action.payload,
            }
        }
        

        default: return state;
    }
}