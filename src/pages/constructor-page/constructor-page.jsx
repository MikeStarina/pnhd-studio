import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Stage, Layer } from 'react-konva';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import styles from './constructor-page.module.css';
import {
  IMAGE_SELECT,
  IMAGE_DESELECT,
  DELETE_FILE,
  CLEAR_ALL_PRINTS,
  SET_ACTIVE_VIEW,
  SET_FILE_STAGE_PARAMS,
  printUploadFunc,
  loadPrintFromState,
  getSize,
  uploadPreview,
} from '../../services/actions/editor-actions.jsx';
import { ADD_TO_CART_WITH_PRINT } from '../../services/actions/cart-actions';
import Print from './print.jsx';
import Mockup from './mockup';
import { fileSelect } from '../../utils/utils';
import PopupModel from '../../components/popupModel/popupModel';
import {
  closePopup,
  openPopup,
  SET_POPUP_VISIBILITY,
} from '../../services/actions/utility-actions';
import { instructionForPopup } from '../../data/instructionForPopup/instructionForPopup';
import { photoProcessing } from '../../data/photo-processing/photo-processing';
import { clearItemOrder } from '../../services/actions/item-action';
// sideItemForPrint - задает окно видимости (его размеры) где отобразится привью картинки
import sideItemForPrint from '../../utils/sideItemForPrint';
import totalPrintPrice from '../../utils/totalPrintPrice';
import addToMemory from '../../utils/addToMemory';
import { Square } from '../../ui/icons/square';
import { SquareCircle } from '../../ui/icons/squareCircle';
import { WordT } from '../../ui/icons/wordT';

function Constructor() {
  const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
  const { id } = useParams();
  const slug = id;

  const dispatch = useDispatch();
  const {
    isBlockButton,
    isSelected,
    front_file,
    front_file_preview,
    back_file,
    back_file_preview,
    lsleeve_file,
    lsleeve_file_preview,
    rsleeve_file,
    rsleeve_file_preview,
    badge_file,
    activeView,
  } = useSelector((store) => store.editorState);
  const { data } = useSelector((store) => store.shopData);
  const { isImageLoading } = useSelector((store) => store.utilityState);
  const history = useHistory();
  const location = useLocation();
  const imgRef = useRef(null);
  const stageRef = useRef();
  const [squareCircleComponentColor, setSquareCircleComponentColor] = useState(false);

  const { order } = useSelector((store) => store.cartData);
  const element = data && data.length > 0 && order && order.find((elem) => elem.cart_item_id === location.state.state);
  const item = element.attributes;

  const volumeSize = item && item.size.reduce((total, element) => {
    let accTotal;
    return (accTotal = total + element.qty);
  }, 0);

  useEffect(() => {
    dispatch(loadPrintFromState(element.print));
    return () => {
      dispatch({
        type: DELETE_FILE,
        view: activeView,
      });
    };
  }, []);

  const setActiveTab = (e) => {
    dispatch({
      type: SET_ACTIVE_VIEW,
      payload: e.currentTarget.id,
    });
  };

  const onSelect = () => {
    dispatch({ type: IMAGE_SELECT });
  };

  const checkDeselect = (e) => {
    const clickedOnEmpty = e.currentTarget === e.currentTarget.getStage();
    if (clickedOnEmpty) {
      dispatch({ type: IMAGE_DESELECT });
    }
  };

  const file = fileSelect(
    activeView,
    front_file,
    back_file,
    lsleeve_file,
    rsleeve_file,
    badge_file,
  );

  const onChange = (e) => {
    e.preventDefault();

    const data = new FormData();
    const print = photoProcessing(e.target.files[0]);
    if (print === undefined) {
      dispatch(openPopup(['Не тот формат файла']));
    } else {
      data.append('files', print, `${uuidv4()}_${print.name}`);

      /* printUploadFunc - так-же вызывает ф-цию setCoords
      - которая задает позицию появления привью изображения */
      dispatch(printUploadFunc(data, activeView, item.type, item.color));
    }
    e.currentTarget.reset();
  };

  const deletePrint = () => {
    dispatch({
      type: DELETE_FILE,
      view: activeView,
    });
  };

  function getScene(activeView) {
    return async function (dispatch) {
      // const preview = await stageRef.current.toDataURL();
      const scene = await stageRef.current.toBlob();

      const data = new FormData();
      data.append('files', scene, `${activeView}_preview_${uuidv4()}.jpg`);

      dispatch(uploadPreview(data, activeView));
    };
  }

  // totalPrintPrice Производит подсчет стоимости
  const totalPricePrint = totalPrintPrice(
    front_file,
    back_file,
    lsleeve_file,
    rsleeve_file,
    badge_file,
  );

  const addToCart = () => {
    const variant = 'с принтом';
    // Создает обьект заказа, для сохранения в сесионой памяти
    const data = addToMemory(variant, item.size, item, element.cart_item_id, front_file, front_file_preview, back_file, back_file_preview, lsleeve_file, lsleeve_file_preview, rsleeve_file, rsleeve_file_preview, badge_file);

    dispatch({
      type: ADD_TO_CART_WITH_PRINT,
      payload: { ...data },
    });

    dispatch({
      type: CLEAR_ALL_PRINTS,
    });

    dispatch(clearItemOrder());

    if (location.state.from.includes('cart')) {
      history.goBack();
    } else {
      history.go(-2);
    }
  };

  const openPopupConstructor = () => {
    dispatch(openPopup(instructionForPopup));
  };

  const closePopupConstructor = () => {
    dispatch(closePopup());
  };

  return (
    item && (
      <section className={styles.screen}>
        <div className={styles.mockup_container}>
          <div className={styles.stage_container}>
            <Stage
              width={500}
              height={496}
              onMouseUp={checkDeselect}
              onTouchEnd={checkDeselect}
              className={styles.stage}
              ref={stageRef}
            >
              <Layer className={styles.layer}>
                <Mockup item={item} />
              </Layer>
              <Layer className={styles.layer}>
                <Print
                  initialParams={sideItemForPrint(item, activeView)}
                  isSelected={isSelected}
                  onSelect={onSelect}
                  file={file && file.file.file.url}
                  initialImageCoords={file && file.file.stageParams}
                  imgRef={imgRef}
                  scene={getScene}
                  onChange={(newAttrs) => {
                    dispatch({
                      type: SET_FILE_STAGE_PARAMS,
                      payload: newAttrs,
                      view: activeView,
                    });
                    dispatch(getScene(activeView));
                    dispatch(getSize(newAttrs, activeView, item.color));
                  }}
                />
              </Layer>
            </Stage>
          </div>
        </div>
        <div className={styles.controls_container}>
          <div className={styles.tabs_container}>
            <button
              type="button"
              className={
                activeView === 'front' ? styles.active_tab : styles.tab
              }
              id="front"
              onClick={setActiveTab}
            >
              Грудь &gt;
            </button>
            <button
              type="button"
              className={activeView === 'back' ? styles.active_tab : styles.tab}
              id="back"
              onClick={setActiveTab}
            >
              Спина &gt;
            </button>
            {item.type !== 'totebag' && (
              <button
                className={
                  activeView === 'lsleeve' ? styles.active_tab : styles.tab
                }
                id="lsleeve"
                onClick={setActiveTab}
                type="button"
              >
                Л.&nbsp;рукав &gt;
              </button>
            )}
            {item.type !== 'totebag' && (
              <button
                className={
                  activeView === 'rsleeve' ? styles.active_tab : styles.tab
                }
                id="rsleeve"
                onClick={setActiveTab}
                type="button"
              >
                П.&nbsp;рукав &gt;
              </button>
            )}
          </div>

          <div className={styles.input_container}>
            <form
              className={styles.input_form}
              onChange={onChange}
              encType="multipart/form-data"
            >
              {isImageLoading && (
                <div
                  className={
                    isImageLoading ? styles.loader_active : styles.loader
                  }
                >
                  <div className={styles.loader_icon} />
                </div>
              )}
              {!isImageLoading && file && file.name && (
                <button
                  type="button"
                  className={styles.print_delete_button}
                  onClick={deletePrint}
                >
                  X
                </button>
              )}
              <div className={styles.input_wrapper}>
                <input
                  type="file"
                  accept=".jpg, .png"
                  className={styles.file_input}
                  id="file_input"
                />
                <label
                  htmlFor="file_input"
                  className={styles.file_input_button}
                >
                  <span
                    className={styles.file_input_button_text}
                    name="input_button_text"
                  >
                    {file && file.name ? file.name : 'Выберите файл >'}
                  </span>
                </label>
              </div>
            </form>
          </div>
          <div className={styles.button_container}>
            <div className={styles.btn_img_control}>
              <button
                onClick={openPopupConstructor}
                className={styles.item_button_quest}
              >
                <Square className={styles.btn_svg} />
              </button>
              <button
                onClick={openPopupConstructor}
                className={styles.item_button_quest}
                onMouseEnter={() => setSquareCircleComponentColor(true)}
                onMouseLeave={() => setSquareCircleComponentColor(false)}
              >
                <SquareCircle className={styles.btn_svg} style={{ color: squareCircleComponentColor ? '#00ff00' : '#ffffff' }} />
              </button>
              <button
                onClick={openPopupConstructor}
                className={styles.item_button_quest}
              >
                <WordT className={styles.btn_svg} />
              </button>
            </div>
            <button
              onClick={openPopupConstructor}
              className={styles.item_button_quest}
            >
              ?
            </button>
          </div>
          <div className={styles.order_info}>
            <p className={styles.order_info_title}>{item.name}</p>
            <p className={styles.order_info_subtitle}>
              <span className={styles.order_info_line_span}>{`${item.price} Р. X ${volumeSize} шт.`}<span className={styles.order_info_line_span_end}>{` - ${item.price * volumeSize} Р.`}</span></span>
            </p>
            <p className={styles.order_info_line}>
              <span className={styles.order_info_line_span_title}>Печать на груди:{front_file && front_file.cartParams ? ' ' : ' -'}</span>
              <span className={front_file && front_file.cartParams && `${styles.order_info_line_span}`}>{front_file && front_file.cartParams && `${front_file.cartParams.format}, ${front_file.cartParams.size}, ${front_file.cartParams.price} Р. X ${volumeSize} шт.`}<span className={styles.order_info_line_span_end}>{front_file && front_file.cartParams && ` - ${front_file.cartParams.price * volumeSize} Р.`}</span></span>
            </p>
            <p className={styles.order_info_line}>
              <span className={styles.order_info_line_span_title}>Печать на спине:{back_file && back_file.cartParams ? ' ' : ' -'}</span>
              <span className={back_file && back_file.cartParams && `${styles.order_info_line_span}`}>{back_file && back_file.cartParams && `${back_file.cartParams.format}, ${back_file.cartParams.size}, ${back_file.cartParams.price} Р. X ${volumeSize} шт.`}<span className={styles.order_info_line_span_end}>{back_file && back_file.cartParams && ` - ${back_file.cartParams.price * volumeSize} Р.`}</span></span>
            </p>
            <p className={styles.order_info_line}>
              <span className={styles.order_info_line_span_title}>Печать на левом рукаве:{lsleeve_file && lsleeve_file.cartParams ? ' ' : ' -'}</span>
              <span className={lsleeve_file && lsleeve_file.cartParams && `${styles.order_info_line_span}`}>{lsleeve_file && lsleeve_file.cartParams && `${lsleeve_file.cartParams.format}, ${lsleeve_file.cartParams.size}, ${lsleeve_file.cartParams.price} Р. X ${volumeSize} шт.`}<span className={styles.order_info_line_span_end}>{lsleeve_file && lsleeve_file.cartParams && ` - ${lsleeve_file.cartParams.price * volumeSize} Р.`}</span></span>
            </p>
            <p className={styles.order_info_line}>
              <span className={styles.order_info_line_span_title}>Печать на правом рукаве:{rsleeve_file && rsleeve_file.cartParams ? ' ' : ' -'}</span>
              <span className={rsleeve_file && rsleeve_file.cartParams && `${styles.order_info_line_span}`}>{rsleeve_file && rsleeve_file.cartParams && `${rsleeve_file.cartParams.format}, ${rsleeve_file.cartParams.size}, ${rsleeve_file.cartParams.price} Р. X ${volumeSize} шт.`}<span className={styles.order_info_line_span_end}>{rsleeve_file && rsleeve_file.cartParams && ` - ${rsleeve_file.cartParams.price * volumeSize} Р.`}</span></span>
            </p>

            <p className={styles.order_info_title}>
              Итого: {item.price + totalPricePrint} Р.
            </p>
          </div>
          <div className={styles.button_container_cart}>
            <button
              type="button"
              className={styles.item_button}
              onClick={addToCart}
              disabled={isBlockButton}
            />
          </div>
        </div>
        {isOtherPopupVisible && (
          <PopupModel onClose={closePopupConstructor}>
            {isOtherPopupVisible.map((el, index) => (
              <p
                className={
                  isOtherPopupVisible.length > 1 ? styles.instruction : styles.error
                }
                key={index}
              >
                {el}
              </p>
            ))}
          </PopupModel>
        )}
      </section>
    )
  );
}

export default Constructor;
