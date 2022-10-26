import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from './constructor-page.module.css';
import { Stage, Layer } from "react-konva";
//import front from '../../components/images/front.png';
import { v4 as uuidv4 } from "uuid";
import { IMAGE_SELECT, IMAGE_DESELECT, ADD_FILE, DELETE_FILE, SET_ACTIVE_VIEW, SET_FILE_STAGE_PARAMS, SET_FILE_CART_PARAMS } from "../../services/actions/editor-actions.jsx";
import { ADD_TO_CART_WITH_PRINT } from "../../services/actions/cart-actions";
import { useParams, useLocation, useHistory } from "react-router-dom";
import Print from "./print.jsx";
import { apiBaseUrl } from "../../utils/constants";
import { IS_IMAGE_LOADING } from "../../services/actions/utility-actions";







   
  
  const Constructor = () => {



    
    const { id } = useParams();
    const dispatch = useDispatch();
    const { isSelected, front_file, back_file, lsleeve_file, rsleeve_file, badge_file, activeView } = useSelector(store => store.editorState);
    const { data } = useSelector(store => store.shopData);
    const { isImageLoading } = useSelector(store => store.utilityState);
    const history = useHistory();
    const { state } = useLocation();
    //const textile = state && state.attributes;
    const labelRef = useRef(null);
    const imgRef = useRef();

    const intId = parseInt(id);
   


    const item = data.length > 0 && data.filter(elem => elem.id === intId);

    

    const setActiveTab = (e) => {

     
    
        dispatch({
            type: SET_ACTIVE_VIEW,
            payload: e.currentTarget.id,
        })
    }


   

    const getSize = (newAttrs) => {
        
        const width = newAttrs.width * 0.16;
        const height = newAttrs.height * 0.16;
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
            screenSize = 'недопустимый размер';
            priceCounter = 0;
        }

      
        dispatch({
            type: SET_FILE_CART_PARAMS,
            payload: {
                price: priceCounter,
                format: screenSize,
                size: `${Math.round(width)} x ${Math.round(height)} см.`,
                place: activeView
            },
            view: activeView
        })
    }
 

    const onSelect = () => {
        dispatch({type: IMAGE_SELECT})
    }
  
    const checkDeselect = (e) => {

       
      
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        dispatch({type: IMAGE_DESELECT})
      }
    };


    const fileSelect = (activeView, front_file, back_file, lsleeve_file, rsleeve_file, badge_file) => {
        if (activeView === 'front' && front_file) {
            
            if (labelRef.current) {
                 labelRef.current.textContent = front_file.file && front_file.file.name;
            }
          
           
            return front_file
        } else if (activeView === 'back' && back_file) {
            labelRef.current.textContent = back_file.file ? back_file.file.name : 'Выберите файл';
            return back_file
        } else if (activeView === 'lsleeve' && lsleeve_file) {

            labelRef.current.textContent = lsleeve_file.file ? lsleeve_file.file.name : 'Выберите файл';
            return lsleeve_file
        } else if (activeView === 'rsleeve' && rsleeve_file) {
            labelRef.current.textContent = rsleeve_file.file ? rsleeve_file.file.name : 'Выберите файл';
            return rsleeve_file
        } else if (activeView === 'badge' && badge_file) {
            labelRef.current.textContent = badge_file.file ? badge_file.file.name : 'Выберите файл';
            return badge_file
        }
    }
    const file = fileSelect(activeView, front_file, back_file, lsleeve_file, rsleeve_file, badge_file);
    //console.log(file);
   

    const onChange = (e) => {
        e.preventDefault();
        const filename = e.target.files[0].name;
        labelRef.current.textContent = filename;
        
        
        const data = new FormData();
        const print = e.target.files[0];
        data.append(`files`, print, print.name)
        
        dispatch({
            type: IS_IMAGE_LOADING,
            payload: true,
        })
        
       

        fetch(`${apiBaseUrl}/api/upload/`, {
            method: 'POST',
            body: data,
        })
        .then(res => res.json())
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
            })

            const currentImage = res[0];
            let imageCoords = {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
            };
            if (currentImage.width >= currentImage.height) {
                const proportion = currentImage.width / currentImage.height;
                const displayWidth = 200;
                const displayHeight = displayWidth / proportion;
                
                imageCoords = {
                    x: 10,
                    y: 0,
                    width: displayWidth,
                    height: displayHeight,
                }
            } else {
                const proportion = currentImage.width / currentImage.height;
                const displayHeight = 200;
                const displayWidth = displayHeight / proportion;
                const xCoord = (220 - displayWidth) / 2;

                imageCoords = {
                    x: xCoord,
                    y: 0,
                    width: displayWidth,
                    height: displayHeight,
                }
            }
            dispatch({
                type: SET_FILE_STAGE_PARAMS,
                payload: imageCoords,
                view: activeView,
            })

         
           
            getSize(imageCoords);
        })


    };


    const addToCart = () => {

        const data = {
            attributes: {...item[0].attributes},
            cart_item_id: uuidv4(),
        }

        data.attributes.size = state.size;
        data.attributes.qty = 1;
        //data.cart_item_id = uuidv4();
        data.attributes.key = uuidv4();

       

        data.print = {
            front: front_file,
            back: back_file,
            lsleeve: lsleeve_file,
            rsleeve: rsleeve_file,
            badge: badge_file,
        };

        
        dispatch({
            type: ADD_TO_CART_WITH_PRINT,
            payload: {...data},
           
            
        });
        
         
        dispatch({
            type: DELETE_FILE
        }) 
       
        history.go(-2);
    }

   
  
    return (item &&
        <section className={styles.screen}>
            <div className={styles.mockup_container}>
                <div className={isImageLoading ? styles.loader_active : styles.loader}>
                    <div className={styles.loader_icon}></div>
                </div>
                {activeView === 'front' && <img src={item[0].attributes.editor_front_view} alt='mockup' className={styles.mockup_img}></img>}
                {activeView === 'back' && <img src={item[0].attributes.editor_back_view} alt='mockup' className={styles.mockup_img}></img>}
                
                <div className={styles.stage_container}>
                    <Stage
                        width={220}
                        height={300}
                        onMouseDown={checkDeselect}
                        onTouchStart={checkDeselect}
                        className={styles.stage}
                    >

                        <Layer className={styles.layer}>
                            
                        
                            <Print
                                isSelected={isSelected}
                                onSelect={onSelect}
                                file={file.file && file.file.url}
                                initialImageCoords={file.stageParams}
                                imgRef={imgRef}
                                onChange={(newAttrs) => {
                                    
                                
                                    dispatch({
                                        type: SET_FILE_STAGE_PARAMS,
                                        payload: newAttrs,
                                        view: activeView,
                                    })
                                    //setParams(newAttrs);
                                    getSize(newAttrs);
                                }}
                            />

                            
                        
                        </Layer>
                    </Stage>
                </div>
        </div>
        <div className={styles.controls_container}>
            <div className={styles.tabs_container}>
                <div className={activeView === 'front' ? styles.active_tab : styles.tab} id='front' onClick={setActiveTab}>
                    <p className={styles.tab_caption}>Грудь</p>
                </div>
                <div className={activeView === 'back' ? styles.active_tab : styles.tab} id='back' onClick={setActiveTab}>
                    <p className={styles.tab_caption}>Спина</p>
                </div>
                <div className={activeView === 'lsleeve' ? styles.active_tab : styles.tab} id='lsleeve' onClick={setActiveTab}>
                    <p className={styles.tab_caption}>Л. рукав</p>
                </div>
                <div className={activeView === 'rsleeve' ? styles.active_tab : styles.tab} id='rsleeve' onClick={setActiveTab}>
                    <p className={styles.tab_caption}>П. рукав</p>
                </div>
                <div className={activeView === 'badge' ? styles.active_tab : styles.tab} id='badge' onClick={setActiveTab}>
                    <p className={styles.tab_caption}>Бирка</p>
                </div>
            </div>
           
            <div className={styles.input_container}>
                <form className={styles.input_form} onChange={onChange}>
                    <div className={styles.input_wrapper}>
                        <input type='file' className={styles.file_input} name='file_input'></input>
                        <label htmlFor='file_input' className={styles.file_input_button}>
                            <span className={styles.file_input_button_text} name='input_button_text' ref={labelRef}>Выберите файл</span>
                        </label>
                    </div>
                    
                   
                </form>
            </div>
            <div className={styles.stage_controls}>
                

            </div>
            <div className={styles.order_info}>
                <p className={styles.order_info_line}>Текстиль: {item[0].attributes.name}</p>
                <p className={styles.order_info_line}>Стоимость: {item[0].attributes.price}</p>
                <p className={styles.order_info_line}>Формат печати: {file.cartParams ? file.cartParams.format: ''}</p>
                <p className={styles.order_info_line}>Размеры принта: {file.cartParams ? file.cartParams.size : ''}</p>
                <p className={styles.order_info_line}>Стоимость печати: {file.cartParams ? file.cartParams.price : ''}</p>
                <p className={styles.order_info_line}>Итого: {file.cartParams ? item[0].attributes.price + file.cartParams.price : item[0].attributes.price}</p>
            </div>
         
            
           
            <button type='button' className={styles.item_button} onClick={addToCart}>ДОБАВИТЬ В КОРЗИНУ</button>
        </div>
      </section>
    );
  };
  
export default Constructor;



