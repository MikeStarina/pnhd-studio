import React, { useRef, useEffect } from "react";
import { Image } from "react-konva";
import { Transformer } from "react-konva";
import useImage from "use-image";
import circle50px from '../../components/images/circle50px.png';



const Print = ({ initialImageCoords, isSelected, onSelect, onChange, file }) => {
    const imgRef = useRef();
    const trRef = useRef();
    //console.log(circle50px);


    //const imageToRender = file ? file : circle50px;
    const [imageTwo] = useImage(file);

  
    useEffect(() => {
      if (isSelected) {
        trRef.current.nodes([imgRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    }, [isSelected]);
  
    return (
      <>
        <Image
          image={imageTwo}
          onClick={onSelect}
          onTap={onSelect}
          ref={imgRef}
          {...initialImageCoords}
          draggable
          onDragEnd={(e) => {
            onChange({
              ...initialImageCoords,
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          onTransformEnd={(e) => {
            const node = imgRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();
  
            
            node.scaleX(1);
            node.scaleY(1);
            onChange({
              ...initialImageCoords,
              x: node.x(),
              y: node.y(),
              
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
            });
          }}
        />
        {isSelected && (
          <Transformer
            ref={trRef}
            boundBoxFunc={(oldBox, newBox) => {
             
              if (newBox.width < 5 || newBox.height < 5) {
                return oldBox;
              }
              return newBox;
            }}
          />
        )}
      </>
    );
  };

  export default Print;