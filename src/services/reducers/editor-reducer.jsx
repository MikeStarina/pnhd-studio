import { IMAGE_SELECT, IMAGE_DESELECT, ADD_FILE } from "../actions/editor-actions";



const initialState = {
    isSelected: false,
    file: '',
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
        

        default: return state;
    }
}