import { IMAGE_SELECT, IMAGE_DESELECT } from "../actions/editor-actions";



const initialState = {
    isSelected: false,
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
        

        default: return state;
    }
}