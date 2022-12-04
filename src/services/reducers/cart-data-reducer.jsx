import { ADD_TO_CART, ADD_TO_CART_WITH_PRINT, CHANGE_ITEM_QTY, CLEAR_CART, RESTORE_CART_FROM_SSTORAGE, SET_CART_VISIBILITY, SET_PAYMENT_URL } from "../actions/cart-actions.jsx";



const initialState = {
    order: [],
    isVisible: false,
    paymentUrl: ''
}



export const cartDataReducer = (state = initialState, action) => {
    switch(action.type) {
        case ADD_TO_CART: {

            const clonedOrder = state.order;

            
            clonedOrder.push(action.payload);
           
            sessionStorage.setItem('cart', JSON.stringify(clonedOrder));

            state = {
                ...state,
                order: clonedOrder,
                isVisible: true,
            }
           
            return {...state}
        }
        case ADD_TO_CART_WITH_PRINT: {

            const clonedOrder = state.order;
            clonedOrder.push({...action.payload});
            sessionStorage.setItem('cart', JSON.stringify(clonedOrder));

            return {
                

                ...state,
                order: clonedOrder,
                isVisible: true,
            }
        }
        case CHANGE_ITEM_QTY: {
            const newOrder = state.order;

            if (action.qty > 0) {
                newOrder.map((item) => {
                    if (item.cart_item_id === action.id) {
                        item.attributes.qty = action.qty;
                        if (item.print) {
                            item.print.qty = action.qty
                        }
                    }

                    return item;
                })
            } else {
                const index = newOrder.findIndex(item => item.cart_item_id === action.id);
                newOrder.splice(index, 1);
            }

            return {
                ...state,
                order: newOrder,
            }
        }
        case SET_CART_VISIBILITY: {
            return {
                ...state,
                isVisible: action.payload,
            }
        }
        case CLEAR_CART: {

            sessionStorage.setItem('cart', '');

            return {
                order: [],
                isVisible: false
            }
        }
        case RESTORE_CART_FROM_SSTORAGE: {
            return {
                ...state,
                order: action.payload,
                isVisible: true,
            }
        }
        case SET_PAYMENT_URL: {
            return {
                ...state,
                paymentUrl: action.payload,
            }

        }

        default: return state;
    }
} 