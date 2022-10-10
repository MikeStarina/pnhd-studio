import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from './constructor-page.module.css';
import { Stage, Layer } from "react-konva";
import front from '../../components/images/front.png';
import { IMAGE_SELECT, IMAGE_DESELECT, ADD_FILE, DELETE_FILE, SET_ACTIVE_VIEW } from "../../services/actions/editor-actions.jsx";
import { ADD_TO_CART_WITH_PRINT } from "../../services/actions/cart-actions";
import { useParams, useLocation, useHistory } from "react-router-dom";
import Print from "./print.jsx";






  
  let initialImageCoords = 
  {
    x: 0,
    y: 0,
    width: 100,
    height: 100,
  };
   
  
  const Constructor = () => {



    
    const [params, setParams] = useState(initialImageCoords);  //переписать в редакс
    const [price, setPrice] = useState(0);
    const [size, setSize] = useState('');
    const [wh, setWH] = useState('');
    const { id } = useParams();
    const dispatch = useDispatch();
    const { isSelected, file, activeView } = useSelector(store => store.editorState);
    const { data } = useSelector(store => store.shopData);
    const history = useHistory();
    const { state } = useLocation();
    const textile = state.attributes;
    const labelRef = useRef(null);
    const imgRef = useRef();

    const intId = parseInt(id);
    const item = data.filter(elem => elem.id === intId);



    const setActiveTab = (e) => {
    
        dispatch({
            type: SET_ACTIVE_VIEW,
            payload: e.currentTarget.id,
        })
    }


   

    const getSize = (newAttrs) => {
        
        const width = newAttrs.width * 0.16;
        const height = newAttrs.height * 0.16;
        setWH(`${Math.round(width)} x ${Math.round(height)} см.`);
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

        setPrice(priceCounter);
        setSize(screenSize)
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


   

    const onChange = (e) => {
        e.preventDefault();
        const filename = e.target.files[0].name;
        labelRef.current.textContent = filename;
        
        
        const data = new FormData();
        const print = e.target.files[0];
        data.append(`files`, print, print.name);
      
       
        

        fetch('http://localhost:1337/api/upload', {
            method: 'POST',
            body: data
        })
        .then(res => res.json())
        .then((res) => {
            //console.log(res);
            dispatch({
                type: ADD_FILE,
                payload: `http://localhost:1337${res[0].url}`,
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
            setParams(imageCoords);
            getSize(imageCoords);
        })


    };


    const addToCart = () => {
        item[0].print = file && {
            size: wh,
            format: size,
            price: price,
            place: '',
            print: file,
        };

        
        dispatch({
            type: ADD_TO_CART_WITH_PRINT,
            payload: item[0],
           
            
        });

         
        dispatch({
            type: DELETE_FILE
        })
        console.log(history);
        history.go(-2);
    }

   
  
    return (
        <section className={styles.screen}>
            <div className={styles.mockup_container}>
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
                                file={file}
                                initialImageCoords={params}
                                imgRef={imgRef}
                                onChange={(newAttrs) => {
                                    
                                
                               
                                setParams(newAttrs);
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
                <p className={styles.order_info_line}>Текстиль: {textile.name}</p>
                <p className={styles.order_info_line}>Стоимость: {textile.price}</p>
                <p className={styles.order_info_line}>Формат печати: {size}</p>
                <p className={styles.order_info_line}>Размеры принта: {wh}</p>
                <p className={styles.order_info_line}>Стоимость печати: {price}</p>
                <p className={styles.order_info_line}>Итого: {textile.price + price}</p>
            </div>
         
            
           
            <button type='button' className={styles.item_button} onClick={addToCart}>ДОБАВИТЬ В КОРЗИНУ</button>
        </div>
      </section>
    );
  };
  
export default Constructor;

// {file && <img src={file} alt='uploaded'></img>}
  


/**
 *  const onSubmit = (e) => {
        e.preventDefault();
     

        const data = new FormData();
        const print = e.target.file_input.files[0];
        data.append(`files`, print, print.name);
      
       
        

        fetch('http://localhost:1337/api/upload', {
            method: 'POST',
            body: data
        })
        .then(res => res.json())
        .then((res) => {
            console.log(res);
            dispatch({
                type: ADD_FILE,
                payload: `http://localhost:1337${res[0].url}`,
            })
        })
        
        
    };
 */

