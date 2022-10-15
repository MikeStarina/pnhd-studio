import { IMAGE_SELECT, IMAGE_DESELECT, ADD_FILE, DELETE_FILE, SET_ACTIVE_VIEW, SET_FILE_STAGE_PARAMS, SET_FILE_CART_PARAMS } from "../actions/editor-actions";



const initialState = {
    isSelected: false,
    front_file: {},
    back_file: {},
    lsleeve_file: {},
    rsleeve_file: {},
    badge_file: {},
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
                front_file: {...state.front_file, file: action.view === 'front' ? action.payload : state.front_file.file,},
                back_file: {...state.back_file, file: action.view === 'back' ? action.payload : state.back_file.file,},
                lsleeve_file: {...state.lsleeve_file, file: action.view === 'lsleeve' ? action.payload : state.lsleeve_file.file,},
                rsleeve_file: {...state.rsleeve_file, file: action.view === 'rsleeve' ? action.payload : state.rsleeve_file.file,},
                badge_file: {...state.badge_file, file: action.view === 'badge' ? action.payload : state.badge_file.file,},
            }
        }

        case SET_FILE_STAGE_PARAMS: {
            return {
                ...state,
                front_file: {...state.front_file, stageParams: action.view === 'front' ? action.payload : state.front_file.stageParams,},
                back_file: {...state.back_file, stageParams: action.view === 'back' ? action.payload : state.back_file.stageParams,},
                lsleeve_file: {...state.lsleeve_file, stageParams: action.view === 'lsleeve' ? action.payload : state.lsleeve_file.stageParams,},
                rsleeve_file: {...state.rsleeve_file, stageParams: action.view === 'rsleeve' ? action.payload : state.rsleeve_file.stageParams,},
                badge_file: {...state.badge_file, stageParams: action.view === 'badge' ? action.payload : state.badge_file.stageParams,},
            }
        }

        case SET_FILE_CART_PARAMS: {
            return {
                ...state,
                front_file: {...state.front_file, cartParams: action.view === 'front' ? action.payload : state.front_file.cartParams,},
                back_file: {...state.back_file, cartParams: action.view === 'back' ? action.payload : state.back_file.cartParams,},
                lsleeve_file: {...state.lsleeve_file, cartParams: action.view === 'lsleeve' ? action.payload : state.lsleeve_file.cartParams,},
                rsleeve_file: {...state.rsleeve_file, cartParams: action.view === 'rsleeve' ? action.payload : state.rsleeve_file.cartParams,},
                badge_file: {...state.badge_file, cartParams: action.view === 'badge' ? action.payload : state.badge_file.cartParams,},
            }
        }

        case DELETE_FILE: {
            return state = initialState
            
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