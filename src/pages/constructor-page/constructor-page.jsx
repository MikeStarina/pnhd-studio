import React, { useState, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from './constructor-page.module.css';
import { Stage, Layer } from "react-konva";
import front from '../../components/images/front.png';
import { IMAGE_SELECT, IMAGE_DESELECT, ADD_FILE } from "../../services/actions/editor-actions.jsx";
import { ADD_TO_CART_WITH_PRINT } from "../../services/actions/cart-actions";
import { useParams } from "react-router-dom";
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
    const { isSelected, file } = useSelector(store => store.editorState);
    const { data } = useSelector(store => store.shopData);
    const { order } = useSelector(store => store.cartData);
    console.log(order);
    const labelRef = useRef(null);
    const imgRef = useRef();
    //console.log(imgRef.current);

    const intId = parseInt(id);
    const item = data.filter(elem => elem.id === intId);


   

    const getSize = () => {
        const width = imgRef.current.attrs.width * 0.16;
        const height = imgRef.current.attrs.height * 0.16;
        setWH(`${width} x ${height} см.`);
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


    const onSubmit = (e) => {
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

    const onChange = (e) => {
        const filename = e.target.files[0].name;
        labelRef.current.textContent = filename;
    };


    const addToCart = () => {
        item[0].print = {
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
    }

   
  
    return (
        <section className={styles.screen}>
            <div className={styles.mockup_container}>
                <img src={front} alt='mockup' className={styles.mockup_img}></img>
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
                                }}
                            />

                            
                        
                        </Layer>
                    </Stage>
            </div>
        </div>
        <div className={styles.controls_container}>
            <div className={styles.tabs_container}>
                <div className={styles.tab}>
                    <p className={styles.tab_caption}>Грудь</p>
                </div>
                <div className={styles.tab}>
                    <p className={styles.tab_caption}>Спина</p>
                </div>
                <div className={styles.tab}>
                    <p className={styles.tab_caption}>Л. рукав</p>
                </div>
                <div className={styles.tab}>
                    <p className={styles.tab_caption}>П. рукав</p>
                </div>
                <div className={styles.tab}>
                    <p className={styles.tab_caption}>Бирка</p>
                </div>
            </div>
           
            <div className={styles.input_container}>
                <form className={styles.input_form} onSubmit={onSubmit} onChange={onChange}>
                    <div className={styles.input_wrapper}>
                        <input type='file' className={styles.file_input} name='file_input'></input>
                        <label htmlFor='file_input' className={styles.file_input_button}>
                            <span className={styles.file_input_button_text} name='input_button_text' ref={labelRef}>Выберите файл</span>
                        </label>
                    </div>
                    
                    <button type='submit' className={styles.submit_button}>&rarr;</button>
                </form>
            </div>
            <p>Формат печати: {size}</p>
            <p>Размеры принта: {wh}</p>
            <p>Стоимость печати: {price}</p>
            <button type='button' className={styles.item_button} onClick={getSize}>Расчитать</button>
            <button type='button' className={styles.item_button} onClick={addToCart}>ДОБАВИТЬ В КОРЗИНУ</button>
        </div>
      </section>
    );
  };
  
export default Constructor;

// {file && <img src={file} alt='uploaded'></img>}
  

