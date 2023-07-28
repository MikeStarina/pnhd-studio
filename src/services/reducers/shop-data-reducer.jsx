import { GET_DATA, SET_FILTER, SET_FIRSTSELECT } from "../actions/shop-data-actions.jsx";



const initialState = {
    data: [],
    filter: '',
    firstFilterSelect: [{category:'one', selected: false}, {category:'two', selected: false}, {category:'three', selected: false}],
    firstFilterSelectedItem:[],
    secondFilterSelect: [],
    secondFilterSelectedItem:[],
    thirdFilterSelect: [],
    thirdFilterSelectedItem:[],
    count:0,
}



export const shopDataReducer = ( state = initialState, action ) => {

    switch(action.type) {
        case GET_DATA: {
            return {
                ...state,
                data: action.payload,
            }
        }
        case SET_FILTER: {
            return {
                ...state,
                filter: action.payload,
            }
        }
        case SET_FIRSTSELECT: {
            const selected = state.firstFilterSelectedItem;
            const indexItem = selected.indexOf(action.payload);
            let cnt = 0;

            if(indexItem!=-1){
                selected.splice(indexItem,1);
                cnt = state.count - 1;
            }else{              
                cnt = state.count + 1;
                selected.push(action.payload);  
            }          
            

            return{
                ...state,
                firstFilterSelectedItem: selected,
                count: cnt,
            }
        }


        default: return state
    }
}