import React, { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import styles from './constructor-page.module.css';
import { Stage, Layer } from "react-konva";
import front from '../../components/images/front.png';
import { IMAGE_SELECT, IMAGE_DESELECT } from "../../services/actions/editor-actions.jsx";
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
   

   
    
    //console.log(window.innerWidth);
 

    const dispatch = useDispatch();
    const { isSelected } = useSelector(store => store.editorState);


    const onSelect = () => {
        dispatch({type: IMAGE_SELECT})
    }
  
    const checkDeselect = (e) => {

        //console.log(e.target.getLayer());
      
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        dispatch({type: IMAGE_DESELECT})
      }
    };
  
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
                                initialImageCoords={params}
                                onChange={(newAttrs) => {
                                    
                                
                               
                                setParams(newAttrs);
                                }}
                            />

                            
                        
                        </Layer>
                    </Stage>
            </div>
        </div>
      </section>
    );
  };
  
export default Constructor;
  

