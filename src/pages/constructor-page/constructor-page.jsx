import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import styles from './constructor-page.module.css';
import { Stage, Layer } from 'react-konva';
//import front from '../../components/images/front.png';
import { v4 as uuidv4 } from 'uuid';
import {
    IMAGE_SELECT,
    IMAGE_DESELECT,
    DELETE_FILE,
    CLEAR_ALL_PRINTS,
    SET_ACTIVE_VIEW,
    SET_FILE_STAGE_PARAMS,
    printUploadFunc,
    getSize,
    uploadPreview,
} from '../../services/actions/editor-actions.jsx';
import { ADD_TO_CART_WITH_PRINT } from '../../services/actions/cart-actions';
import { useParams, useLocation, useHistory } from 'react-router-dom';
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

const Constructor = () => {
    const { isOtherPopupVisible } = useSelector((store) => store.utilityState);
    const { id } = useParams();
    const dispatch = useDispatch();
    const {
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
    const { order } = useSelector((store) => store.itemReducer);
    const history = useHistory();
    const { state } = useLocation();
    const imgRef = useRef(null);
    const stageRef = useRef();

    const item = data.length > 0 && data.filter((elem) => elem._id === id)[0];

    let initialParams = {
        x: 140,
        y: 100,
        width: 220,
        height: 300,
    };

    if (activeView === 'back') {
        if (item.type === 'hoodie') {
            initialParams = {
                x: 150,
                y: 140,
                width: 200,
                height: 290,
            };
        } else if (item.type === 'totebag') {
            initialParams = {
                x: 150,
                y: 160,
                width: 200,
                height: 220,
            };
        } else {
            initialParams = {
                x: 140,
                y: 100,
                width: 220,
                height: 300,
            };
        }
    } else if (activeView === 'front' && item.type === 'hoodie') {
        initialParams = {
            x: 150,
            y: 130,
            width: 200,
            height: 200,
        };
    } else if (item.type === 'totebag' && activeView === 'front') {
        initialParams = {
            x: 150,
            y: 160,
            width: 200,
            height: 220,
        };
    } else if (activeView === 'lsleeve') {
        if (
            item.type === 'hoodie' ||
            item.type === 'longsleeve' ||
            item.type === 'sweatshirt'
        ) {
            initialParams = {
                x: 230,
                y: 125,
                width: 55,
                height: 200,
            };
        } else {
            initialParams = {
                x: 230,
                y: 105,
                width: 80,
                height: 90,
            };
        }
    } else if (activeView === 'rsleeve') {
        if (
            item.type === 'hoodie' ||
            item.type === 'longsleeve' ||
            item.type === 'sweatshirt'
        ) {
            initialParams = {
                x: 215,
                y: 125,
                width: 55,
                height: 200,
            };
        } else {
            initialParams = {
                x: 190,
                y: 105,
                width: 80,
                height: 90,
            };
        }
    }

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
            // console.log(print);
            data.append(`files`, print, `${uuidv4()}_${print.name}`);
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
            //const preview = await stageRef.current.toDataURL();
            const scene = await stageRef.current.toBlob();

            const data = new FormData();
            data.append(
                'files',
                scene,
                `${activeView}_preview_${uuidv4()}.jpg`,
            );

            dispatch(uploadPreview(data, activeView));
        };
    }

    let totalPrintPrice = 0;
    totalPrintPrice = front_file.cartParams
        ? totalPrintPrice + front_file.cartParams.price
        : totalPrintPrice;
    totalPrintPrice = back_file.cartParams
        ? totalPrintPrice + back_file.cartParams.price
        : totalPrintPrice;
    totalPrintPrice = lsleeve_file.cartParams
        ? totalPrintPrice + lsleeve_file.cartParams.price
        : totalPrintPrice;
    totalPrintPrice = rsleeve_file.cartParams
        ? totalPrintPrice + rsleeve_file.cartParams.price
        : totalPrintPrice;
    totalPrintPrice = badge_file.cartParams
        ? totalPrintPrice + badge_file.cartParams.price
        : totalPrintPrice;

    const addToCart = () => {
        window.dataLayer.push({
            ecommerce: {
                currencyCode: 'RUB',
                add: {
                    products: [
                        {
                            id: item._id,
                            name: `${item.name} c печатью`,
                            price: item.price + totalPrintPrice,
                            size: state.size,
                            category: item.category,
                            variant: 'с принтом',
                        },
                    ],
                },
            },
        });

        const data = {
            attributes: { ...item },
            cart_item_id: uuidv4(),
        };

        data.attributes.size = state.size;
        data.attributes.qty = 1;
        data.attributes.key = uuidv4();

        data.print = {
            front: front_file,
            front_preview: front_file_preview,
            back: back_file,
            back_preview: back_file_preview,
            lsleeve: lsleeve_file,
            lsleeve_preview: lsleeve_file_preview,
            rsleeve: rsleeve_file,
            rsleeve_preview: rsleeve_file_preview,
            badge: badge_file,
        };

        dispatch({
            type: ADD_TO_CART_WITH_PRINT,
            payload: { ...data },
        });

        dispatch({
            type: CLEAR_ALL_PRINTS,
        });

        dispatch(clearItemOrder());

        history.go(-2);
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
                                    initialParams={initialParams}
                                    isSelected={isSelected}
                                    onSelect={onSelect}
                                    file={file && file.file.file.url}
                                    initialImageCoords={
                                        file && file.file.stageParams
                                    }
                                    imgRef={imgRef}
                                    scene={getScene}
                                    onChange={(newAttrs) => {
                                        dispatch({
                                            type: SET_FILE_STAGE_PARAMS,
                                            payload: newAttrs,
                                            view: activeView,
                                        });
                                        dispatch(getScene(activeView));
                                        dispatch(
                                            getSize(
                                                newAttrs,
                                                activeView,
                                                item.color,
                                            ),
                                        );
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
                                activeView === 'front'
                                    ? styles.active_tab
                                    : styles.tab
                            }
                            id="front"
                            onClick={setActiveTab}
                        >
                            Грудь
                        </button>
                        <button
                            type="button"
                            className={
                                activeView === 'back'
                                    ? styles.active_tab
                                    : styles.tab
                            }
                            id="back"
                            onClick={setActiveTab}
                        >
                            Спина
                        </button>
                        {item.type !== 'totebag' && (
                            <button
                                className={
                                    activeView === 'lsleeve'
                                        ? styles.active_tab
                                        : styles.tab
                                }
                                id="lsleeve"
                                onClick={setActiveTab}
                                type="button"
                            >
                                Л.&nbsp;рукав
                            </button>
                        )}
                        {item.type !== 'totebag' && (
                            <button
                                className={
                                    activeView === 'rsleeve'
                                        ? styles.active_tab
                                        : styles.tab
                                }
                                id="rsleeve"
                                onClick={setActiveTab}
                                type="button"
                            >
                                П.&nbsp;рукав
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
                                        isImageLoading
                                            ? styles.loader_active
                                            : styles.loader
                                    }
                                >
                                    <div className={styles.loader_icon}></div>
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
                                    name="file_input"
                                />
                                <label
                                    htmlFor="file_input"
                                    className={styles.file_input_button}
                                >
                                    <span
                                        className={
                                            styles.file_input_button_text
                                        }
                                        name="input_button_text"
                                    >
                                        {file && file.name
                                            ? file.name
                                            : 'Выберите файл'}
                                    </span>
                                </label>
                            </div>
                        </form>
                    </div>
                    <div className={styles.stage_controls}></div>
                    <div className={styles.order_info}>
                        <p className={styles.order_info_line}>
                            Текстиль: {item.name}
                        </p>
                        <p className={styles.order_info_line}>
                            Стоимость текстиля: {item.price} Р.
                        </p>
                        <p className={styles.order_info_line}>
                            Печать на груди:{' '}
                            {front_file && front_file.cartParams
                                ? `${front_file.cartParams.format}, ${front_file.cartParams.size}, ${front_file.cartParams.price} Р.`
                                : '-'}
                        </p>
                        <p className={styles.order_info_line}>
                            Печать на спине:{' '}
                            {back_file && back_file.cartParams
                                ? `${back_file.cartParams.format}, ${back_file.cartParams.size}, ${back_file.cartParams.price} Р.`
                                : '-'}
                        </p>
                        <p className={styles.order_info_line}>
                            Печать на левом рукаве:{' '}
                            {lsleeve_file && lsleeve_file.cartParams
                                ? `${lsleeve_file.cartParams.format}, ${lsleeve_file.cartParams.size}, ${lsleeve_file.cartParams.price} Р.`
                                : '-'}
                        </p>
                        <p className={styles.order_info_line}>
                            Печать на правом рукаве:{' '}
                            {rsleeve_file && rsleeve_file.cartParams
                                ? `${rsleeve_file.cartParams.format}, ${rsleeve_file.cartParams.size}, ${rsleeve_file.cartParams.price} Р.`
                                : '-'}
                        </p>

                        <p className={styles.order_info_line}>
                            Итого текстиль и печать:{' '}
                            {item.price + totalPrintPrice} Р.
                        </p>
                    </div>
                    <div className={styles.button_container}>
                        <button
                            onClick={openPopupConstructor}
                            className={styles.item_button_quest}
                        />
                        {isOtherPopupVisible && (
                            <PopupModel onClose={closePopupConstructor}>
                                {isOtherPopupVisible.map((el, index) => (
                                    <p
                                        className={
                                            isOtherPopupVisible.length > 1
                                                ? styles.instruction
                                                : styles.error
                                        }
                                        key={index}
                                    >
                                        {el}
                                    </p>
                                ))}
                            </PopupModel>
                        )}
                        <button
                            type="button"
                            className={styles.item_button}
                            onClick={addToCart}
                        />
                    </div>
                </div>
            </section>
        )
    );
};

export default Constructor;
