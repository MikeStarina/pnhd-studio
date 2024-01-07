/* eslint-disable no-promise-executor-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { useSelector, useDispatch } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { useParams, useLocation, useHistory } from 'react-router-dom';
import Model from '../../components/threeJsConstructor-components/Model/Model';
import Scenes from '../../components/threeJsConstructor-components/Scenes/Scenes';
import styles from './threeJsConstructor-page.module.css';
import UploadedImage from '../../components/threeJsConstructor-components/UploadedImage/UploadedImage';
import { fileSelect } from '../../utils/utils';
import photoProcessing from '../../data/photo-processing/photo-processing';
import SquareCircle from '../../ui/icons/squareCircle';
import WordT from '../../ui/icons/wordT';
import totalPrintPrice from '../../utils/totalPrintPrice';
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
} from '../../services/actions/editor-actions';
import {
  ADD_TO_CART,
  ADD_TO_CART_WITH_PRINT,
} from '../../services/actions/cart-actions';
import { closePopup, openPopup } from '../../services/actions/utility-actions';
import Square from '../../ui/icons/square';
import instructionForPopup from '../../data/instructionForPopup/instructionForPopup';
import addToMemory from '../../utils/addToMemory';
import { clearItemOrder } from '../../services/actions/item-action';

function ThreeJsConstructor() {
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
  const canvRef = useRef();
  const dispatch = useDispatch();
  const [applyImage, setApplyImage] = useState(false);
  const [price, setPrice] = useState('');
  const [format, setFormat] = useState('');
  const [cords, setCords] = useState();
  const [imgSize, setImgSize] = useState({ w: 100, h: 100 });
  const [xyzRotation, setXyzRotation] = useState([0, 0, 120]);
  const [rotationModel, setRotationModel] = useState(true);
  const [imageURL, setImageURL] = useState();
  const [dataURL, setDataUrl] = useState();
  const fileReader = new FileReader();
  const history = useHistory();
  const location = useLocation();
  const { data } = useSelector((store) => store.shopData);
  const { order } = useSelector((store) => store.cartData);
  const { isImageLoading } = useSelector((store) => store.utilityState);
  const { id } = useParams();
  const [dash, setDash] = useState(false);
  const slug = id;
  const [squareCircleComponentColor, setSquareCircleComponentColor] =
    useState(false);
  const element = location.state.from.includes('cart')
    ? data &&
      data.length > 0 &&
      order &&
      order.find((elem) => elem.cart_item_id === location.state.state)
    : data && data.length > 0 && data.find((elem) => elem.slug === slug);
  const item = location.state.from.includes('cart')
    ? element.attributes
    : element;

  // console.log(item);
  const addToCart = () => {
    const variant = 'с принтом';
    // Создает обьект заказа, для сохранения в сесионой памяти
    const data = addToMemory(
      variant,
      item.size,
      item,
      element.cart_item_id,
      front_file,
      front_file_preview,
      back_file,
      back_file_preview,
      lsleeve_file,
      lsleeve_file_preview,
      rsleeve_file,
      rsleeve_file_preview,
      badge_file,
    );

    dispatch({
      type: ADD_TO_CART_WITH_PRINT,
      payload: { ...data },
    });

    dispatch({
      type: CLEAR_ALL_PRINTS,
    });

    dispatch(clearItemOrder());

    history.goBack();
  };

  const uuId = uuidv4();
  const addToPrint = () => {
    const variant = 'с принтом';
    // Создает обьект заказа, для сохранения в сесионой памяти
    const data = addToMemory(
      variant,
      location.state.size,
      item,
      uuId,
      front_file,
      front_file_preview,
      back_file,
      back_file_preview,
      lsleeve_file,
      lsleeve_file_preview,
      rsleeve_file,
      rsleeve_file_preview,
      badge_file,
    );

    dispatch({
      type: ADD_TO_CART,
      payload: { ...data },
    });

    dispatch({
      type: CLEAR_ALL_PRINTS,
    });

    dispatch(clearItemOrder());

    history.go(-2);
  };
  const totalPricePrint = totalPrintPrice(
    front_file,
    back_file,
    lsleeve_file,
    rsleeve_file,
    badge_file,
  );

  const itemSize = location.state.from.includes('cart')
    ? item.size
    : location.state.size;

  const volumeSize =
    itemSize &&
    itemSize.reduce((total, element) => {
      let accTotal;
      // что линтеру тут не нравится мне сложно понять =)
      // eslint-disable-next-line no-unused-vars
      return (accTotal = total + element.qty);
    }, 0);
  const handleOnChange = (event) => {
    event.preventDefault();
    setRotationModel(false);
    const data = new FormData();
    const print = photoProcessing(event.target.files[0]);

    if (print === undefined) {
      dispatch(openPopup(['Не тот формат файла']));
    } else {
      data.append('files', print, `${uuidv4()}_${print.name}`);

      /* printUploadFunc - так-же вызывает ф-цию setCoords
      - которая задает позицию появления привью изображения */
      dispatch(printUploadFunc(data, activeView, item.type, item.color));
      // setImageURL(fileReader.result);
    }
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      fileReader.readAsDataURL(file);
      fileReader.onloadend = () => {
        setImageURL(fileReader.result);
      };
    }

    event.currentTarget.reset();
  };

  // console.log(imageURL);
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

    console.log(print);
    if (print === undefined) {
      dispatch(openPopup(['Не тот формат файла']));
    } else {
      data.append('files', print, `${uuidv4()}_${print.name}`);

      /* printUploadFunc - так-же вызывает ф-цию setCoords
      - которая задает позицию появления привью изображения */
      dispatch(printUploadFunc(data, activeView, item.type, item.color));
      // setImageURL(fileReader.result);
    }
    e.currentTarget.reset();
  };
  const openPopupConstructor = () => {
    dispatch(openPopup(instructionForPopup));
  };

  const openPopupInfo = () => {
    dispatch(
      openPopup(['Привет! Сейчас эта функция находится в разработке :)']),
    );
  };

  const closePopupConstructor = () => {
    dispatch(closePopup());
  };
  const deletePrint = () => {
    dispatch({
      type: DELETE_FILE,
      view: activeView,
    });
    setImageURL();
  };

  const getModelColor = (itemColor) => {
    switch (itemColor) {
      case itemColor = 'черный':
        return 0x000000;
      case itemColor = 'белый':
        return 0xffffff;
      case itemColor = 'голубой':
        return 0x7FC7FF;
      case itemColor = 'фиолетовый':
        return 0x9C9CFF;
      case itemColor = 'оранжевый':
        return 0xFF7F00;
      case itemColor = 'красный':
        return 0xFE0000;
      case itemColor = 'натуральный':
        return 0xDED4D2;
      case itemColor = 'песочный':
        return 0xCCB49C;
      case itemColor = 'темно-синий':
        return 0x263451;
      default:
        return 0x330099;
    }
  };
  return (
    <div className={styles.main}>
      {/* <div className={styles.wrap_buttons}> */}
      {/* <div className={styles.tabs_container}>
          <button
            type="button"
            className={styles.tab}
            id="front"
            onClick={() => {
              setXyzRotation([0, 0, 120]);
            }}
          >
            Грудь &gt;
          </button>
          <button
            type="button"
            className={styles.tab}
            id="back"
            onClick={() => {
              setXyzRotation([0, 0, -120]);
            }}
          >
            Спина &gt;
          </button>

          <button
            className={styles.tab}
            id="lsleeve"
            type="button"
            onClick={() => {
              setXyzRotation([-100, 0, 0]);
            }}
          >
            Л.&nbsp;рукав &gt;
          </button>

          <button
            className={styles.tab}
            id="rsleeve"
            type="button"
            onClick={() => {
              setXyzRotation([100, 0, 0]);
            }}
          >
            П.&nbsp;рукав &gt;
          </button>
        </div> */}
      <div className={styles.controls_container}>
        <div className={styles.tabs_container}>
          <button
            type="button"
            className={
                activeView === 'front' ? styles.active_tab : styles.tab
              }
            id="front"
              // onClick={setActiveTab}
            onClick={(e) => {
              setXyzRotation([0, 0, 120]);
              setActiveTab(e);
            }}
          >
            Грудь &gt;
          </button>
          <button
            type="button"
            className={activeView === 'back' ? styles.active_tab : styles.tab}
            id="back"
              // onClick={setActiveTab}
            onClick={(e) => {
              setXyzRotation([0, 0, -120]);
              setActiveTab(e);
            }}
          >
            Спина &gt;
          </button>
          {item.type !== 'totebag' && (
          <button
            className={
                  activeView === 'lsleeve' ? styles.active_tab : styles.tab
                }
            id="lsleeve"
                // onClick={setActiveTab}
            onClick={(e) => {
              setXyzRotation([-100, 0, 0]);
              setActiveTab(e);
            }}
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
                // onClick={setActiveTab}
            onClick={(e) => {
              setXyzRotation([100, 0, 0]);
              setActiveTab(e);
            }}
            type="button"
          >
            П.&nbsp;рукав &gt;
          </button>
          )}
        </div>

        <div className={styles.input_container}>
          <form
            className={styles.input_form}
              // onChange={onChange}
            onChange={handleOnChange}
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
          {/* <div className={styles.btn_img_control}>
              <button
                onClick={() => setDash((dash) => !dash)}
                className={
                  dash
                    ? `${styles.item_button_quest} ${styles.item_button_quest_active}`
                    : `${styles.item_button_quest}`
                }
                type="button"
              >
                <Square className={styles.btn_svg} />
              </button>
              <button
                onClick={openPopupInfo}
                className={styles.item_button_quest}
                onMouseEnter={() => setSquareCircleComponentColor(true)}
                onMouseLeave={() => setSquareCircleComponentColor(false)}
                type="button"
              >
                <SquareCircle
                  className={styles.btn_svg}
                  style={{
                    color: squareCircleComponentColor ? '#00ff00' : '#ffffff',
                  }}
                />
              </button>
              <button
                onClick={openPopupInfo}
                className={styles.item_button_quest}
                type="button"
              >
                <WordT className={styles.btn_svg} />
              </button>
            </div> */}
          <button
            onClick={openPopupConstructor}
            className={styles.item_button_quest}
            type="button"
          >
            ?
          </button>
        </div>
        <div className={styles.order_info}>
          <p className={styles.order_info_title}>{item.name}</p>
          <p className={styles.order_info_subtitle}>
            <span className={styles.order_info_line_span}>
              {`${item.price} Р. X ${volumeSize} шт.`}
              <span className={styles.order_info_line_span_end}>
                {` - ${item.price * volumeSize} Р.`}
              </span>
            </span>
          </p>
          <p className={styles.order_info_line}>
            <span className={styles.order_info_line_span_title}>
              Печать на груди:
              {front_file && front_file.cartParams ? ' ' : ' -'}
            </span>
            <span
              className={
                  front_file &&
                  front_file.cartParams &&
                  `${styles.order_info_line_span}`
                }
            >
              {front_file &&
                  front_file.cartParams &&
                  `${front_file.cartParams.format}, ${front_file.cartParams.size}, ${front_file.cartParams.price} Р. X ${volumeSize} шт.`}
              <span className={styles.order_info_line_span_end}>
                {front_file &&
                    front_file.cartParams &&
                    ` - ${front_file.cartParams.price * volumeSize} Р.`}
              </span>
            </span>
          </p>
          <p className={styles.order_info_line}>
            <span className={styles.order_info_line_span_title}>
              Печать на спине:
              {back_file && back_file.cartParams ? ' ' : ' -'}
            </span>
            <span
              className={
                  back_file &&
                  back_file.cartParams &&
                  `${styles.order_info_line_span}`
                }
            >
              {back_file &&
                  back_file.cartParams &&
                  `${back_file.cartParams.format}, ${back_file.cartParams.size}, ${back_file.cartParams.price} Р. X ${volumeSize} шт.`}
              <span className={styles.order_info_line_span_end}>
                {back_file &&
                    back_file.cartParams &&
                    ` - ${back_file.cartParams.price * volumeSize} Р.`}
              </span>
            </span>
          </p>
          <p className={styles.order_info_line}>
            <span className={styles.order_info_line_span_title}>
              Печать на левом рукаве:
              {lsleeve_file && lsleeve_file.cartParams ? ' ' : ' -'}
            </span>
            <span
              className={
                  lsleeve_file &&
                  lsleeve_file.cartParams &&
                  `${styles.order_info_line_span}`
                }
            >
              {lsleeve_file &&
                  lsleeve_file.cartParams &&
                  `${lsleeve_file.cartParams.format}, ${lsleeve_file.cartParams.size}, ${lsleeve_file.cartParams.price} Р. X ${volumeSize} шт.`}
              <span className={styles.order_info_line_span_end}>
                {lsleeve_file &&
                    lsleeve_file.cartParams &&
                    ` - ${lsleeve_file.cartParams.price * volumeSize} Р.`}
              </span>
            </span>
          </p>
          <p className={styles.order_info_line}>
            <span className={styles.order_info_line_span_title}>
              Печать на правом рукаве:
              {rsleeve_file && rsleeve_file.cartParams ? ' ' : ' -'}
            </span>
            <span
              className={
                  rsleeve_file &&
                  rsleeve_file.cartParams &&
                  `${styles.order_info_line_span}`
                }
            >
              {rsleeve_file &&
                  rsleeve_file.cartParams &&
                  `${rsleeve_file.cartParams.format}, ${rsleeve_file.cartParams.size}, ${rsleeve_file.cartParams.price} Р. X ${volumeSize} шт.`}
              <span className={styles.order_info_line_span_end}>
                {rsleeve_file &&
                    rsleeve_file.cartParams &&
                    ` - ${rsleeve_file.cartParams.price * volumeSize} Р.`}
              </span>
            </span>
          </p>

          <p className={styles.order_info_title}>
            Итого:
            {' '}
            {(item.price + totalPricePrint) * volumeSize}
            {' '}
            Р.
          </p>
          <p>
            Цена и формат:
            {price}
            ,
            {' '}
            {format}
          </p>
          <p>
            Высота:
            {' '}
            {imgSize.h}
            Ширина:
            {' '}
            {imgSize.w}
          </p>
          <button
            type="button"
            onClick={() => {
              setRotationModel(!rotationModel);
            }}
          >
            включить вращение модели
          </button>
          <button
            style={{ marginBottom: '10px' }}
            onClick={() => {
              setDataUrl(canvRef.current.toDataURL());
            }}
            type="button"
          >
            Take screenshot
          </button>
        </div>
        <div className={styles.button_container_cart}>
          <button
            type="button"
            aria-label="button"
            className={styles.item_button}
            onClick={
                location.state.from.includes('cart') ? addToCart : addToPrint
              }
            disabled={isBlockButton}
          />
        </div>
      </div>
      <div className={styles.input_wrapper}>
        <input
          type="file"
          accept=".jpg, .png"
          className={styles.file_input}
          id="file_input"
          onChange={handleOnChange}
        />
        {/* <label htmlFor="file_input" className={styles.file_input_button}>
            <span
              className={styles.file_input_button_text}
              name="input_button_text"
            >
              {' '}
              Выберите файл
            </span>
          </label> */}

        {dataURL ? (
          <div
            style={{
              width: '150px',
              height: '200px',
              backgroundImage: `url(${dataURL})`,
              border: '1px solid red',
              backgroundSize: '150px 200px',
              backgroundRepeat: 'no-repeat',
            }}
          />
        ) : (
          ''
        )}
        {/* </div> */}
      </div>
      <div className={styles.canvas}>
        <Canvas
          camera={{ position: [0, 0, 120], fov: 60 }}
          ref={canvRef}
          id="canvas"
          gl={{ preserveDrawingBuffer: true }}
        >
          {imageURL ? (
            <UploadedImage
              test={imageURL || 'no_photo.jpg'}
              setCords={setCords}
              setImgSize={setImgSize}
              setApplyImage={setApplyImage}
              setImageURL={setImageURL}
              setRotationModel={setRotationModel}
            />
          ) : (
            ''
          )}
          <Scenes
            setCords={setCords}
            setImgSize={setImgSize}
            xyzRotation={xyzRotation}
            rotationModel={rotationModel}
          />
          <Model
            setCords={cords}
            imgTexture={imageURL}
            imgSize={imgSize}
            setApplyImage={setApplyImage}
            applyImage={applyImage}
            width={canvRef.current?.offsetHeight}
            height={canvRef.current?.offsetWidth}
            offsetLeft={canvRef.current?.offsetLeft}
            clientWidth={canvRef.current?.clientWidth}
            offsetTop={canvRef.current?.offsetTop}
            clientHeight={canvRef.current?.clientHeight}
            setPrice={setPrice}
            setFormat={setFormat}
            modelColor={getModelColor(item.color)}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default ThreeJsConstructor;
