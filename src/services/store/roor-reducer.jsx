import { combineReducers } from "redux";
import { utilityReducer } from "../reducers/utility-reducer.jsx";
import { editorReducer } from "../reducers/editor-reducer.jsx";



export const rootReducer = combineReducers({
    utilityState: utilityReducer,
    editorState: editorReducer,
});