import React, { useRef, useEffect } from 'react';
import { Image, Group, Transformer, Rect } from 'react-konva';
import { useSelector, useDispatch } from 'react-redux';
import useImage from 'use-image';
import styles from './constructor-page.module.css';
// import circle50px from '../../components/images/circle50px.png';

function Print({
  dash,
  initialImageCoords,
  isSelected,
  onSelect,
  onChange,
  file,
  imgRef,
  initialParams,
  scene,
}) {
  const trRef = useRef(null);
  const dispatch = useDispatch();
  const { activeView } = useSelector((store) => store.editorState);

  const [imageTwo] = useImage(file, 'Anonymous');

  useEffect(() => {
    dispatch(scene(activeView));
  }, [imageTwo]);

  useEffect(
    () => {
      if (isSelected) {
        trRef.current.nodes([imgRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    },
    [isSelected],
    [imgRef],
  );

  return (
    <>
      <Group
        clip={initialParams}
      >
        {dash && (<Rect x={initialParams.x + 2} y={initialParams.y + 2} width={initialParams.width - 4} height={initialParams.height - 4} fill="rgba(255, 0, 0, 0.0)" stroke="#00FF00" strokeWidth={2} dash={[1, 3]} />)}
        <Image
          className={styles.some}
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
          onTransform={(e) => {
            const node = imgRef.current;
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
              rotation: node.attrs.rotation,
            });
          }}
        />
      </Group>
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
