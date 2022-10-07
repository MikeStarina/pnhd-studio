import { ADD_TO_CART, ADD_TO_CART_WITH_PRINT } from "../actions/cart-actions.jsx";



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
        case ADD_TO_CART_WITH_PRINT: {
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