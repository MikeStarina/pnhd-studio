import { GET_DATA } from "../actions/shop-data-actions.jsx";







const initialState = {
    data: [],
}



export const shopDataReducer = ( state = initialState, action ) => {

    switch(action.type) {
        case GET_DATA: {
            return {
                ...state,
                data: action.payload,
            }
        }


        default: return state
    }
}