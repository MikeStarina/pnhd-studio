import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from './constructor-page.module.css';
import { Stage, Layer } from "react-konva";
import front from '../../components/images/front.png';
import { IMAGE_SELECT, IMAGE_DESELECT, ADD_FILE } from "../../services/actions/editor-actions.jsx";
import Print from "./print.jsx";




  
  let initialImageCoords = 
  {
    x: 0,
    y: 0,
    width: 50,
    height: 50,
  };
   
  
  const Constructor = () => {

    
   

    //переписать в редакс
    const [params, setParams] = useState(initialImageCoords);
   

   
    
    
 

    const dispatch = useDispatch();
    const { isSelected, file } = useSelector(store => store.editorState);


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
    
        
    }

    const onChange = (e) => {
        e.preventDefault()
        //console.log(e.target.files[0]);
        const img = window.URL.createObjectURL(e.target.files[0])
        console.log(img);

        
        dispatch({
            type: ADD_FILE,
            payload: img,
        }) 
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
                <form className={styles.input_form} onSubmit={onSubmit}>
                    <input type='file' className={styles.file_input} name='file_input' onChange={onChange}></input>
                    <button type='submit'>Загрузить</button>
                </form>
            </div>
        </div>
      </section>
    );
  };
  
export default Constructor;

// {file && <img src={file} alt='uploaded'></img>}
  

