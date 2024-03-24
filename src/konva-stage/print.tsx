'use client'
import React, { useRef, useEffect } from 'react';
import styles from './print.module.css';
import {
  Image, Group, Transformer, Rect,
} from 'react-konva';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import useImage from 'use-image';
import { ICartOrderElement } from '@/app/utils/types';
import { apiBaseUrl } from '@/app/utils/constants';
//import styles from './constructor-page.module.css';
// import circle50px from '../../components/images/circle50px.png';



type TPrintProps = {
    orderElement: ICartOrderElement,
    initialParams: { x: number, y: number, width: number, height: number },
    isSelected: boolean,
    onSelect: () => void,
    file?: any, ///!
    initialImageCoords?: { x: number, y: number, width: number, height: number, rotation: number },
    imgRef: React.Ref<any>, //!
    onChange?: (newAttrs: { x: number, y: number, width: number, height: number, rotation: number }) => void,
    scene: (activeView: string) => void,
}




const Print: React.FC<TPrintProps> = ({
  orderElement,
  initialImageCoords,
  isSelected,
  onSelect,
  onChange,
  file,
  imgRef,
  initialParams,
  scene,
}) => {

  const trRef = useRef(null);
  const dispatch = useAppDispatch();
  const { activeView } = useAppSelector((store) => store.printConstructor);
  //eslint-ignore-next-line
  const [imageTwo] = file ? useImage(`${apiBaseUrl}${file}`, 'anonymous') : useImage('', 'anonymous'); // eslint-disable-line react-hooks/rules-of-hooks

  useEffect(() => {
      imageTwo && scene(activeView);
  }, [imageTwo]);

  useEffect(
    () => {
      if (isSelected) {
        // @ts-ignore
        trRef.current.nodes([imgRef.current]);
        // @ts-ignore
        trRef.current.getLayer().batchDraw();
      }
    },
    [isSelected, imgRef]
  );

  return (
    <>
      {imageTwo && <Group
        clip={initialParams}
      >
        {/* {dash && (<Rect x={initialParams.x + 2} y={initialParams.y + 2} width={initialParams.width - 4} height={initialParams.height - 4} fill="rgba(255, 0, 0, 0.0)" stroke="#00FF00" strokeWidth={2} dash={[1, 3]} />)} */}
        <Image
          className={styles.some}
          alt='принт'
          image={imageTwo}
          onClick={onSelect}
          onTap={onSelect}
          ref={imgRef}
          {...initialImageCoords}
          draggable
          onDragEnd={(e) => {
            //@ts-ignore
            onChange({
              ...initialImageCoords,
              x: e.target.x(),
              y: e.target.y(),
            });
          }}
          // eslint-disable-next-line no-unused-vars
          onTransform={(e) => {
            // eslint-disable-next-line no-unused-vars
            //@ts-ignore
            const node = imgRef.current;
          }}
          // eslint-disable-next-line no-unused-vars
          onTransformEnd={(e) => {
            //@ts-ignore
            const node = imgRef.current;
            const scaleX = node.scaleX();
            const scaleY = node.scaleY();

            node.scaleX(1);
            node.scaleY(1);
            //@ts-ignore
            onChange({
              ...initialImageCoords,
              x: node.x(),
              y: node.y(),
              width: Math.max(5, node.width() * scaleX),
              height: Math.max(node.height() * scaleY),
              rotation: node.attrs.rotation,
            });
          }}
        />
      </Group> }
      {isSelected && imageTwo && (
        <Transformer
          anchorStroke="rgb(0, 255, 0)"
          borderStroke="rgb(0, 255, 0)"
          anchorFill="rgb(0, 255, 0)"
          anchorSize={10}
          anchorCornerRadius={5}
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
}

export default Print;
