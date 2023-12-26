// eslint-disable-next-line no-unused-vars
import { v4 as uuidv4 } from 'uuid';
import { IS_IMAGE_LOADING, openPopup } from './utility-actions';
import { apiBaseUrl } from '../../utils/constants';
import { setCoords } from '../../utils/utils';

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
export const LOAD_PRINT_FROM_STATE = 'LOAD_PRINT_FROM_STATE';
export const LOAD_PRINT_FROM_AI = 'LOAD_PRINT_FROM_AI';

const checkResponse = (res) => {
  if (res.ok || res.created) {
    return res.json();
  }
  return res.json().then((err) => Promise.reject(err));
};

export const getSize = (newAttrs, activeView, color) => function (dispatch) {
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
      place: activeView,
    },
    view: activeView,
  });
};
export const printUploadFunc = (data, activeView, itemType, itemColor) => function (dispatch) {
  dispatch({
    type: IS_IMAGE_LOADING,
    payload: true,
  });

  fetch(`${apiBaseUrl}/api/uploads/`, {
    method: 'POST',
    body: data,
  })
    .then((res) => checkResponse(res))
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
      const imageCoords = setCoords(
        currentImage,
        activeView,
        itemType,
      );

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

export const uploadPreview = (data, activeView) => function (dispatch) {
  fetch(`${apiBaseUrl}/api/uploads/`, {
    method: 'POST',
    body: data,
  })
    .then((res) => res.json())
    .then((res) => {
      // console.log(res)
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

export const loadPrintFromAI = (words, activeView, itemType, itemColor) => function (dispatch) {
  dispatch({
    type: IS_IMAGE_LOADING,
    payload: true,
  });

  fetch(`${apiBaseUrl}/api/aiChat/`, {
    method: 'POST',
    body: JSON.stringify({ words }),
    headers: {
      'Content-type': 'application/json; charset=UTF-8',
    },
  })
    .then((res) => checkResponse(res))
    .then((res) => {
      dispatch({
        type: ADD_FILE,
        payload: {
          url: `${apiBaseUrl}${res.url}`,
          name: res.name,
        },
        view: activeView,
      });
      const currentImage = res;
      // setCoords - Задает координаты появления привью изображения,
      const imageCoords = setCoords(
        currentImage,
        activeView,
        itemType,
      );

      dispatch(getSize(imageCoords, activeView, itemColor));
      dispatch({
        type: SET_FILE_STAGE_PARAMS,
        payload: imageCoords,
        view: activeView,
      });
      dispatch({
        type: IS_IMAGE_LOADING,
        payload: false,
      });
    })
    // eslint-disable-next-line no-unused-vars
    .catch((err) => {
      if (err.error === 403) {
        dispatch(openPopup([
          'Не удалось. Нет доступа.',
        ]));
      } else if (err.error === 429) {
        dispatch(openPopup([
          'Не удалось. Превышен лимит, подождите 2 минуты.',
        ]));
      } else {
        dispatch(openPopup([
          'Не удалось создать картинку. Попробуйте обновить страницу.',
        ]));
      }
    });
};
