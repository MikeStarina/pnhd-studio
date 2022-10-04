import { ADD_TO_CART } from "../actions/cart-actions.jsx";



const initialState = {
    order: []
}



export const cartDataReducer = (state = initialState, action) => {
    switch(action.type) {
        case ADD_TO_CART: {
            const clonedOrder = state.order;
            clonedOrder.push(action.payload);


            return {
                

                ...state,
                order: clonedOrder,

            }
        }

        default: return state;
    }
} 