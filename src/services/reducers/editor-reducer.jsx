import {
  IMAGE_SELECT,
  IMAGE_DESELECT,
  ADD_FILE,
  DELETE_FILE,
  SET_ACTIVE_VIEW,
  SET_FILE_STAGE_PARAMS,
  SET_FILE_FILTER_SHAPE_STAGE_PARAMS,
  SET_FILE_CART_PARAMS,
  CLEAR_ALL_PRINTS,
  ADD_PRINT_PREVIEW,
  LOAD_PRINT_FROM_STATE,
  SET_TEXT,
  SET_CART_PARAMS_TEXT_COST_ZERO,
} from '../actions/editor-actions';

const initialState = {
  isBlockButton: false,
  isSelected: false,
  front_file: {},
  front_file_preview: {},
  back_file: {},
  back_file_preview: {},
  lsleeve_file: {},
  lsleeve_file_preview: {},
  rsleeve_file: {},
  rsleeve_file_preview: {},
  badge_file: {},
  activeView: 'front',
};

const editorReducer = (state = initialState, action) => {
  switch (action.type) {
    case IMAGE_SELECT: {
      return {
        ...state,
        isSelected: true,
      };
    }

    case IMAGE_DESELECT: {
      return {
        ...state,
        isSelected: false,
      };
    }

    case ADD_FILE: {
      return {
        ...state,
        front_file: {
          ...state.front_file,
          file:
                        action.view === 'front' ? action.payload : state.front_file.file,
        },
        back_file: {
          ...state.back_file,
          file:
                        action.view === 'back' ? action.payload : state.back_file.file,
        },
        lsleeve_file: {
          ...state.lsleeve_file,
          file:
                        action.view === 'lsleeve' ? action.payload : state.lsleeve_file.file,
        },
        rsleeve_file: {
          ...state.rsleeve_file,
          file:
                        action.view === 'rsleeve' ? action.payload : state.rsleeve_file.file,
        },
        badge_file: {
          ...state.badge_file,
          file:
                        action.view === 'badge' ? action.payload : state.badge_file.file,
        },
        isBlockButton: true,
      };
    }

    case SET_FILE_STAGE_PARAMS: {
      return {
        ...state,
        front_file: {
          ...state.front_file,
          stageParams:
                        action.view === 'front' ? action.payload : state.front_file.stageParams,
        },
        back_file: {
          ...state.back_file,
          stageParams:
                        action.view === 'back' ? action.payload : state.back_file.stageParams,
        },
        lsleeve_file: {
          ...state.lsleeve_file,
          stageParams:
                        action.view === 'lsleeve' ? action.payload : state.lsleeve_file.stageParams,
        },
        rsleeve_file: {
          ...state.rsleeve_file,
          stageParams:
                        action.view === 'rsleeve' ? action.payload : state.rsleeve_file.stageParams,
        },
        badge_file: {
          ...state.badge_file,
          stageParams:
                        action.view === 'badge' ? action.payload : state.badge_file.stageParams,
        },
      };
    }

    case SET_FILE_FILTER_SHAPE_STAGE_PARAMS: {
      return {
        ...state,
        front_file: {
          ...state.front_file,
          stageParamsFilterCircle:
            action.view === 'front' ? action.payload : state.front_file.stageParamsFilterCircle,
        },
        back_file: {
          ...state.back_file,
          stageParamsFilterCircle:
            action.view === 'back' ? action.payload : state.back_file.stageParamsFilterCircle,
        },
        lsleeve_file: {
          ...state.lsleeve_file,
          stageParamsFilterCircle:
            action.view === 'lsleeve' ? action.payload : state.lsleeve_file.stageParamsFilterCircle,
        },
        rsleeve_file: {
          ...state.rsleeve_file,
          stageParamsFilterCircle:
            action.view === 'rsleeve' ? action.payload : state.rsleeve_file.stageParamsFilterCircle,
        },
      };
    }

    case SET_TEXT: {
      return {
        ...state,
        front_file: {
          ...state.front_file,
          text:
            action.view === 'front' ? action.payload : state.front_file.text,
        },
        back_file: {
          ...state.back_file,
          text:
            action.view === 'back' ? action.payload : state.back_file.text,
        },
        lsleeve_file: {
          ...state.lsleeve_file,
          text:
            action.view === 'lsleeve' ? action.payload : state.lsleeve_file.text,
        },
        rsleeve_file: {
          ...state.rsleeve_file,
          text:
            action.view === 'rsleeve' ? action.payload : state.rsleeve_file.text,
        },
      };
    }

    case SET_CART_PARAMS_TEXT_COST_ZERO: {
      return {
        ...state,
        front_file: {
          ...state.front_file,
          textCost: action.view === 'front' ? 0 : state.front_file.textCost,
          cartParams: action.view === 'front' ? { price: state.front_file.imageCost } : state.front_file.cartParams,
        },
        back_file: {
          ...state.back_file,
          textCost:
            action.view === 'back' ? 0 : state.back_file.textCost,
        },
        lsleeve_file: {
          ...state.lsleeve_file,
          textCost:
            action.view === 'lsleeve' ? 0 : state.lsleeve_file.textCost,
        },
        rsleeve_file: {
          ...state.rsleeve_file,
          textCost:
            action.view === 'rsleeve' ? 0 : state.rsleeve_file.textCost,
        },
      };
    }

    case SET_FILE_CART_PARAMS: {
      // console.log('SET_FILE_CART_PARAMS>>', action.payload);
      return {
        ...state,
        front_file: {
          ...state.front_file,
          cartParams:
            action.view === 'front' ? action.payload : state.front_file.cartParams,
        },
        back_file: {
          ...state.back_file,
          cartParams:
                        action.view === 'back' ? action.payload : state.back_file.cartParams,
        },
        lsleeve_file: {
          ...state.lsleeve_file,
          cartParams:
                        action.view === 'lsleeve' ? action.payload : state.lsleeve_file.cartParams,
        },
        rsleeve_file: {
          ...state.rsleeve_file,
          cartParams:
                        action.view === 'rsleeve' ? action.payload : state.rsleeve_file.cartParams,

        },
        badge_file: {
          ...state.badge_file,
          cartParams:
                        action.view === 'badge' ? action.payload : state.badge_file.cartParams,
        },
      };
    }

    case CLEAR_ALL_PRINTS: {
      return (state = initialState);
    }
    case SET_ACTIVE_VIEW: {
      return {
        ...state,
        activeView: action.payload,
      };
    }
    case DELETE_FILE: {
      return {
        ...state,
        front_file: action.view === 'front' ? {} : state.front_file,
        front_file_preview:
                    action.view === 'front' ? {} : state.front_file_preview,
        back_file: action.view === 'back' ? {} : state.back_file,
        back_file_preview:
                    action.view === 'back' ? {} : state.back_file_preview,
        lsleeve_file:
                    action.view === 'lsleeve' ? {} : state.lsleeve_file,
        lsleeve_file_preview:
                    action.view === 'lsleeve' ? {} : state.lsleeve_file_preview,
        rsleeve_file:
                    action.view === 'rsleeve' ? {} : state.rsleeve_file,
        rsleeve_file_preview:
                    action.view === 'rsleeve' ? {} : state.rsleeve_file_preview,
        badge_file: action.view === 'badge' ? {} : state.badge_file,
      };
    }
    case ADD_PRINT_PREVIEW: {
      return {
        ...state,
        front_file_preview:
                    action.view === 'front' ? { data: action.data, preview: action.preview } : state.front_file_preview,
        back_file_preview:
                    action.view === 'back' ? { data: action.data, preview: action.preview } : state.back_file_preview,
        lsleeve_file_preview:
                    action.view === 'lsleeve' ? { data: action.data, preview: action.preview } : state.lsleeve_file_preview,
        rsleeve_file_preview:
                    action.view === 'rsleeve' ? { data: action.data, preview: action.preview } : state.rsleeve_file_preview,
        isBlockButton: false,
      };
    }
    case LOAD_PRINT_FROM_STATE: {
      return {
        ...state,
        front_file: {
          ...state.front_file,
          file: action.payload.front.file,
          stageParams: action.payload.front.stageParams,
          cartParams: action.payload.front.cartParams,
          stageParamsFilterCircle: action.payload.front.stageParamsFilterCircle,
          text: action.payload.front.text,
        },
        front_file_preview: {
          ...state.front_file_preview,
          preview: action.payload.front_preview.preview,
        },
        back_file: {
          ...state.back_file,
          file: action.payload.back.file,
          stageParams: action.payload.back.stageParams,
          cartParams: action.payload.back.cartParams,
          stageParamsFilterCircle: action.payload.back.stageParamsFilterCircle,
          text: action.payload.back.text,
        },
        back_file_preview: {
          ...state.back_file_preview,
          preview: action.payload.back_preview.preview,
        },
        lsleeve_file: {
          ...state.lsleeve_file,
          file: action.payload.lsleeve.file,
          stageParams: action.payload.lsleeve.stageParams,
          cartParams: action.payload.lsleeve.cartParams,
          stageParamsFilterCircle: action.payload.lsleeve.stageParamsFilterCircle,
          text: action.payload.lsleeve.text,
        },
        lsleeve_file_preview: {
          ...state.lsleeve_file_preview,
          preview: action.payload.lsleeve_preview.preview,
        },
        rsleeve_file: {
          ...state.rsleeve_file,
          file: action.payload.rsleeve.file,
          stageParams: action.payload.rsleeve.stageParams,
          cartParams: action.payload.rsleeve.cartParams,
          stageParamsFilterCircle: action.payload.rsleeve.stageParamsFilterCircle,
          text: action.payload.rsleeve.text,
        },
        rsleeve_file_preview: {
          ...state.rsleeve_file_preview,
          preview: action.payload.rsleeve_preview.preview,
        },
      };
    }

    default:
      return state;
  }
};

export default editorReducer;
