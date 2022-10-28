import { IS_IMAGE_LOADING } from "./utility-actions";
import { apiBaseUrl } from "../../utils/constants";
import { setCoords } from "../../utils/utils";


export const IMAGE_SELECT = 'IMAGE_SELECT';
export const IMAGE_DESELECT = 'IMAGE_DESELECT';
export const ADD_FILE = 'ADD_FILE';
export const DELETE_FILE = 'DELETE_FILE';
export const CLEAR_ALL_PRINTS = 'CLEAR_ALL_PRINTS';
export const SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW';
export const SET_FILE_STAGE_PARAMS = 'SET_FILE_PARAMS';
export const SET_FILE_CART_PARAMS = 'SET_FILE_CART_PARAMS';
export const ADD_PRINT_PREVIEW = 'ADD_PRINT_PREVIEW';







export const getSize = (newAttrs, activeView) => {

    
    return function(dispatch) {
    
    const width = newAttrs.width * 0.16;
    const height = newAttrs.height * 0.14;
    const printSqr = width * height;
   
    let screenSize = '';
    let priceCounter = 0;

    if (printSqr <= 150) {
        screenSize = 'А6';
        priceCounter = 300;
    } else if (printSqr > 150 && printSqr <= 315) {
    
        screenSize = 'А5';
        priceCounter = 400;
        
    } else if (printSqr > 315 && printSqr <= 609) {
        screenSize = 'А4';
        priceCounter = 500;
    } else if (printSqr > 609 && printSqr <= 1218) {
        screenSize = 'А3';
        priceCounter = 600;
    } else if (printSqr > 1218 && printSqr <= 1420) {
        screenSize = 'А3+';
        priceCounter = 700;
    } else {
        screenSize = 'А3+';
        priceCounter = 700;
    }

    const displayWidth = Math.round(width) > 35 ? 35 : Math.round(width);
    const displayHeight = Math.round(height) > 42 ? 42 : Math.round(height);

    
    dispatch({
        type: SET_FILE_CART_PARAMS,
        payload: {
            price: priceCounter,
            format: screenSize,
            size: `${displayWidth} x ${displayHeight} см.`,
            place: activeView
        },
        view: activeView
    })
  }
}





export const printUploadFunc = (data, activeView, getScene) => {



    return function(dispatch) {

        dispatch({
          type: IS_IMAGE_LOADING,
          payload: true,
        });

        fetch(`${apiBaseUrl}/api/upload/`, {
            method: "POST",
            body: data,
          })
            .then((res) => res.json())
            .then((res) => {


              dispatch({
                type: ADD_FILE,
                payload: {
                  url: `${apiBaseUrl}${res[0].url}`,
                  name: res[0].name,
                },
                view: activeView,
              });


              dispatch({
                type: IS_IMAGE_LOADING,
                payload: false,
              });
      
              const currentImage = res[0];
              let imageCoords = setCoords(currentImage, activeView);
              
              dispatch(getSize(imageCoords, activeView));
              dispatch({
                type: SET_FILE_STAGE_PARAMS,
                payload: imageCoords,
                view: activeView,
              });
              
      
              
            });

    }
}


