'use client'
import React, { useRef } from 'react';
//import styles from './stage-component.module.css'
import { Stage, Layer } from 'react-konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { actions as constructorActions } from '@/redux/constructor-slice/constructor.slice';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import { useAppSelector, useAppDispatch } from '@/redux/redux-hooks';
import { ICartOrderElement } from '@/app/utils/types';
import Mockup from './mockup';
import { sideItemForPrint } from '@/app/utils/constructor-utils';
import Print from './print';
import { v4 as uuidv4 } from 'uuid';
import { useUploadPrintImageMutation } from '@/api/api';

const StageComponent: React.FC<{ orderElement: ICartOrderElement}> = ({ orderElement }) => {

    const dispatch = useAppDispatch();
    const stageRef = useRef(null);
    const imgRef = useRef(null);
    
    const { activeView, isSelected } = useAppSelector((store) => store.printConstructor);
    const [ uploadPreview ] = useUploadPrintImageMutation();

    const checkDeselect = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
        const clickedOnEmpty = e.currentTarget === e.currentTarget.getStage();
        if (clickedOnEmpty) {
          dispatch(constructorActions.imageSelectToggler(false));
        }
    };





    const onSelect = () => {
      dispatch(constructorActions.imageSelectToggler(true));
    };




    const getScene = async (activeView: string) => {
      // @ts-ignore
      //const preview = await stageRef.current.toDataURL();
      // @ts-ignore
      const scene = await stageRef?.current?.toBlob();  
      const data = new FormData();
      scene && data.append('files', scene, `${activeView}_preview_${uuidv4()}.jpg`);


      const preview = await uploadPreview(data);
      // @ts-ignore
      dispatch(cartActions.setPreview({ preview, activeView, itemCartId: orderElement.itemCartId }))

    }


    return (
        <Stage
        width={500}
        height={496}
        onMouseUp={checkDeselect}
        onTouchEnd={checkDeselect}
        ref={stageRef}
      >
        <Layer 
        >
          <Mockup item={orderElement.item} />
        </Layer>
        <Layer 
        >
          <Print
            initialParams={sideItemForPrint(orderElement.item, activeView)}
            isSelected={isSelected}
            onSelect={onSelect}
            orderElement={orderElement}
            //@ts-ignore
            file={orderElement?.prints[activeView]?.file?.url}
            //@ts-ignore
            initialImageCoords={orderElement?.prints[activeView]?.stageParams}
            imgRef={imgRef}
            scene={getScene}
            onChange={(newAttrs) => {
               dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }))
               dispatch(cartActions.updateCartParams({newAttrs, activeView, itemColor: orderElement.item.color, itemCartId: orderElement.itemCartId }))
               getScene(activeView);
            }}
          />
        </Layer>
      </Stage>
    )
}

export default StageComponent;