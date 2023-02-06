import { ADD_TO_CART, ADD_TO_CART_WITH_PRINT, CHANGE_ITEM_QTY, CLEAR_CART, RESTORE_CART_FROM_SSTORAGE, SET_CART_VISIBILITY, SET_PAYMENT_URL, DELETE_ITEM_FROM_CART, DELETE_PRINT_FROM_CART } from "../actions/cart-actions.jsx";



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
            console.log('test');
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

            
                newOrder.map((item) => {
                    if (item.cart_item_id === action.id) {
                        item.attributes.qty = action.qty > 0 ? action.qty : 1;
                        if (item.print) {
                            item.print.qty = action.qty > 0 ? action.qty : 1;
                        }
                    }

                    return item;
                })
           

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

        case DELETE_ITEM_FROM_CART: {
            const clonedOrder = state.order;

            const newOrderList = [];

            clonedOrder.map((item) => {
                if (item.cart_item_id !== action.payload) {
                    newOrderList.push(item);
                }
            })

            sessionStorage.setItem('cart', JSON.stringify(newOrderList));

            return {
                ...state,
                order: newOrderList,
            }
        }

        case DELETE_PRINT_FROM_CART: {
        
            let clonedOrder = state.order;

            clonedOrder.map((item) => {
                if (item.cart_item_id === action.item_id) {
            
                    if (action.print_id === 'front_print') {
                        item.print.front = {
                            cartParams: undefined,
                            file: undefined,
                            stageParams: {},
                        };
                        item.print.front_preview.preview = {};
                       
                    }
                    if (action.print_id === 'back_print') {
                        item.print.back = {
                            cartParams: undefined,
                            file: undefined,
                            stageParams: {},
                        };
                        item.print.back_preview.preview = {};
                    }
                    if (action.print_id === 'lsleeve_print') {
                        item.print.lsleeve = {
                            cartParams: undefined,
                            file: undefined,
                            stageParams: {},
                        };
                        item.print.lsleeve_preview.preview = {};
                    }
                    if (action.print_id === 'lsleeve_print') {
                        item.print.rsleeve = {
                            cartParams: undefined,
                            file: undefined,
                            stageParams: {},
                        };
                        item.print.rsleeve_preview.preview = {};
                    }
                }
            })

            sessionStorage.setItem('cart', JSON.stringify(clonedOrder));

            return {
                ...state,
                order: clonedOrder,
            }
        }

        default: return state;
    }
} 