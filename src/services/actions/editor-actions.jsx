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
export const SET_EDITOR_VIEW = 'SET_EDITOR_VIEW';







export const getSize = (newAttrs, activeView, color) => {
    //console.log(color)
    
    return function(dispatch) {
    
    const width = newAttrs.width * 0.16;
    const height = newAttrs.height * 0.14;
    const printSqr = width * height;
   
    let screenSize = '';
    let priceCounter = 0;

    if (printSqr <= 150) {
        screenSize = 'А6';
        priceCounter = color && color === 'белый' ? 300 : 400;
    } else if (printSqr > 150 && printSqr <= 315) {
    
        screenSize = 'А5';
        priceCounter = color && color === 'белый' ? 400 : 500;
        
    } else if (printSqr > 315 && printSqr <= 609) {
        screenSize = 'А4';
        priceCounter = color && color === 'белый' ? 500 : 650;
    } else if (printSqr > 609 && printSqr <= 1218) {
        screenSize = 'А3';
        priceCounter = color && color === 'белый' ? 650 : 750;
    } else if (printSqr > 1218 && printSqr <= 1420) {
        screenSize = 'А3+';
        priceCounter = color && color === 'белый' ? 750 : 900;
    } else {
        screenSize = 'А3+';
        priceCounter = color && color === 'белый' ? 750 : 900;
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





export const printUploadFunc = (data, activeView, itemType, itemColor) => {



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
              let imageCoords = setCoords(currentImage, activeView, itemType);
              
              dispatch(getSize(imageCoords, activeView, itemColor));
              dispatch({
                type: SET_FILE_STAGE_PARAMS,
                payload: imageCoords,
                view: activeView,
              });
              
      
              
            });

    }
}



export const uploadPreview = (data, activeView) => {

  //console.log(data);

  return function (dispatch) {
      fetch(`${apiBaseUrl}/api/upload/`, {
          method: "POST",
          body: data,
        })
          .then((res) => res.json())
          .then((res) => {
              //console.log(res)
              dispatch({
                type: ADD_PRINT_PREVIEW,
                data: data,
                preview: `${apiBaseUrl}${res[0].url}`,
                view: activeView,
              })
          })
  }

}



