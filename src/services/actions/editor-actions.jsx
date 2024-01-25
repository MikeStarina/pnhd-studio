// eslint-disable-next-line no-unused-vars
import useImage from 'use-image';
import { IS_IMAGE_LOADING, openPopup } from './utility-actions';
import { apiBaseUrl } from '../../utils/constants';
import {
  setCoords,
  setFilterCoords,
  setTextCoordinates,
} from '../../utils/utils';

export const IMAGE_SELECT = 'IMAGE_SELECT';
export const IMAGE_DESELECT = 'IMAGE_DESELECT';
export const ADD_FILE = 'ADD_FILE';
export const DELETE_FILE = 'DELETE_FILE';
export const CLEAR_ALL_PRINTS = 'CLEAR_ALL_PRINTS';
export const SET_ACTIVE_VIEW = 'SET_ACTIVE_VIEW';
export const SET_FILE_STAGE_PARAMS = 'SET_FILE_PARAMS';
export const SET_FILE_CART_PARAMS = 'SET_FILE_CART_PARAMS';
export const ADD_PRINT_PREVIEW = 'ADD_PRINT_PREVIEW';
export const LOAD_PRINT_FROM_STATE = 'LOAD_PRINT_FROM_STATE';
export const SET_FILE_FILTER_SHAPE_STAGE_PARAMS =
  'SET_FILE_FILTER_SHAPE_STAGE_PARAMS';
export const CLEAR_FILE_FILTER_SHAPE_STAGE_PARAMS =
  'CLEAR_FILE_FILTER_SHAPE_STAGE_PARAMS';
export const SET_TEXT = 'SET_TEXT';
export const SET_CART_PARAMS_IMAGE_COST = 'SET_CART_PARAMS_IMAGE_COST';
export const SET_CART_PARAMS_TEXT_COST = 'SET_CART_PARAMS_TEXT_COST';
export const SET_CART_PARAMS_TEXT_COST_ZERO = 'SET_CART_PARAMS_TEXT_COST_ZERO';

export const getPriceCalc = (newAttrs, color) => {
  const width =
    newAttrs.width !== undefined
      ? newAttrs.width * 0.16
      : newAttrs.widthShape * 0.16;
  const height =
    newAttrs.height !== undefined
      ? newAttrs.height * 0.16
      : newAttrs.heightShape * 0.16;
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

  return {
    priceCounter,
    screenSize,
    displayWidth,
    displayHeight,
  };
};

export const printFilterTextCost = (
  stageParams,
  textCoordinates,
  itemColor,
  filterCoordinates,
) => {
  // console.log(
  //   stageParams,
  //   '<stageParams',
  //   textCoordinates,
  //   '<<textCoordinates',
  //   itemColor,
  //   'filterCoordinates>>>',
  //   filterCoordinates,
  // );
  let totalHeight = 0;
  let totalWidth = 0;
  const text = textCoordinates;

  const heightShape = filterCoordinates && filterCoordinates.heightShape;
  const widthShape = filterCoordinates && filterCoordinates.widthShape;

  const stageShape = (stageParams) => {
    if (filterCoordinates) {
      return {
        ...stageParams,
        width: widthShape,
        height: heightShape,
      };
    }
    return stageParams;
  };
  const stage = stageShape(stageParams);

  const firstElementY = text.y <= stage.y ? text : stage;
  const secondElementY = stage.y >= text.y ? stage : text;
  const heightFirst = firstElementY.y + firstElementY.height;
  const heightSecond = secondElementY.y + secondElementY.height;

  const firstElementX = text.x <= stage.x ? text : stage;
  const secondElementX = stage.x >= text.x ? stage : text;
  const widthFirst = firstElementX.x + firstElementX.width;
  const widthSecond = secondElementX.x + secondElementX.width;

  if (widthFirst >= widthSecond) {
    totalWidth = firstElementX.width;
  }
  if (widthFirst < widthSecond && widthFirst > secondElementX.x) {
    totalWidth = secondElementX.width + (secondElementX.x - firstElementX.x);
  }
  if (widthFirst < secondElementX.x) {
    // Закоментирован код для вычесления обьема по каждому елемнту отдельно
    // totalWidth = firstElementX.width + secondElementX.width;
    totalWidth = secondElementX.width + (secondElementX.x - firstElementX.x);
  }

  if (heightFirst >= heightSecond) {
    totalHeight = firstElementY.height;
  }
  if (heightFirst < heightSecond && heightFirst > secondElementY.y) {
    totalHeight = secondElementY.height + (secondElementY.y - firstElementY.y);
  }
  if (heightFirst < secondElementY.y) {
    // Закоментирован код для вычесления обьема по каждому елемнту отдельно
    // totalHeight = firstElementY.height + secondElementY.height;
    totalHeight = heightSecond - firstElementY.y;
  }

  return getPriceCalc({ width: totalWidth, height: totalHeight }, itemColor);
};

export const getSize = (
  newAttrs,
  activeView,
  color,
  textCoordinates,
  filterCoordinates,
) => function (dispatch) {
  const cost =
    textCoordinates && newAttrs
      ? printFilterTextCost(newAttrs, textCoordinates, color, filterCoordinates)
      : textCoordinates
        ? getPriceCalc(textCoordinates, color)
        : filterCoordinates
          ? getPriceCalc(filterCoordinates, color)
          : getPriceCalc(newAttrs, color);

  dispatch({
    type: SET_FILE_CART_PARAMS,
    payload: {
      price: cost.priceCounter,
      format: cost.screenSize,
      size: `${cost.displayWidth} x ${cost.displayHeight} см.`,
      place: activeView,
    },
    view: activeView,
  });
};

export const textCostZero = (activeView) => ({
  type: SET_CART_PARAMS_TEXT_COST_ZERO,
  view: activeView,
});

export const printUploadFunc = (data, activeView, itemType, itemColor) => {
  const checkResponse = (res) => {
    if (res.ok || res.created) {
      return res.json();
    }
    return res.json().then((err) => Promise.reject(err));
  };

  return function (dispatch) {
    dispatch({
      type: IS_IMAGE_LOADING,
      payload: true,
    });

    fetch(`${apiBaseUrl}/api/uploads/`, {
      method: 'POST',
      body: data,
    })
      .then(checkResponse)
      .then((res) => {
        dispatch({
          type: ADD_FILE,
          payload: {
            url: `${apiBaseUrl}${res.url}`,
            name: res.name,
          },
          view: activeView,
        });

        dispatch({
          type: IS_IMAGE_LOADING,
          payload: false,
        });

        const currentImage = res;
        // setCoords - Задает координаты появления привью изображения,
        const imageCoords = setCoords(currentImage, activeView, itemType);
        dispatch(getSize(imageCoords, activeView, itemColor));
        dispatch({
          type: SET_FILE_STAGE_PARAMS,
          payload: imageCoords,
          view: activeView,
        });
      })
      // eslint-disable-next-line no-unused-vars
      .catch((err) => {
        dispatch(openPopup(['Что-то пошло не так :(']));
      });
  };
};

export const uploadPreview = (data, activeView) => function (dispatch) {
  fetch(`${apiBaseUrl}/api/uploads/`, {
    method: 'POST',
    body: data,
  })
    .then((res) => res.json())
    .then((res) => {
      dispatch({
        type: ADD_PRINT_PREVIEW,
        data,
        preview: `${apiBaseUrl}${res.url}`,
        view: activeView,
      });
    });
};

export const loadPrintFromState = (payload) => function (dispatch) {
  dispatch({
    type: LOAD_PRINT_FROM_STATE,
    payload,
  });
};

export const loadFilterCoordinates = (
  initialImageCoords,
  activeView,
) => {
  const filterCoordinates = setFilterCoords(activeView);
  return function (dispatch) {
    dispatch({
      type: SET_FILE_FILTER_SHAPE_STAGE_PARAMS,
      payload: filterCoordinates,
      view: activeView,
    });
  };
};

export const setText = (
  initialImageCoords,
  activeView,
  itemColor,
  initialFilterCoords,
) => {
  const textCoordinates = setTextCoordinates(activeView);
  return function (dispatch) {
    dispatch({
      type: SET_TEXT,
      payload: textCoordinates,
      view: activeView,
    });
    dispatch(
      getSize(
        initialImageCoords,
        activeView,
        itemColor,
        textCoordinates,
        initialFilterCoords,
      ),
    );
  };
};

export const changeTextState = (payload, activeView) => function (dispatch) {
  dispatch({
    type: SET_TEXT,
    payload,
    view: activeView,
  });
};
