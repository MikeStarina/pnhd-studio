import {
    ADD_ITEM_SIZE,
    CLEAR_ITEM_ORDER,
    UPDATE_ITEM_ORDER,
    DELETE_ITEM_ORDER,
    FLAG_SIZE_IS,
    FLAG_SIZE_IS_NOT,
} from '../actions/item-action';

const initialState = {
    order: [],
    isSize: false,
};

export const itemReducer = (state = initialState, action) => {
    switch (action.type) {
        case ADD_ITEM_SIZE: {
            return {
                ...state,
                order: [...state.order, action.payload],
            };
        }
        case UPDATE_ITEM_ORDER: {
            return {
                ...state,
                order: state.order.map((item) => {
                    if (item.name === action.arr.name) {
                        return {
                            ...item,
                            qty: action.arr.qty,
                            name: action.arr.name,
                        };
                    }
                    return item;
                }),
            };
        }
        case CLEAR_ITEM_ORDER: {
            return {
                ...state,
                order: state.order.map((item) => {
                    return {
                        ...item,
                        qty: 0,
                    };
                }),
            };
        }

        case DELETE_ITEM_ORDER: {
            return {
                ...state,
                order: [],
            };
        }
        case FLAG_SIZE_IS: {
            const arr = state.order.filter((item) => item.qty > 0);
            if (arr.length > 0) {
                return {
                    ...state,
                    isSize: true,
                };
            }
            return {
                ...state,
                isSize: false,
            };
        }
        default:
            return state;
    }
};
