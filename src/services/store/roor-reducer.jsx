import { combineReducers } from "redux";
import { utilityReducer } from "../reducers/utility-reducer.jsx";



export const rootReducer = combineReducers({
    utilityState: utilityReducer,
});