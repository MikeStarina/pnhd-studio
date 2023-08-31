import React, { useRef, useEffect, useState } from 'react';
import { Image, Group, Transformer, Rect, Circle } from 'react-konva';
import { useSelector, useDispatch } from 'react-redux';
import useImage from 'use-image';
import styles from './constructor-page.module.css';
import { SET_FILE_FILTER_CIRCLE_STAGE_PARAMS } from '../../services/actions/editor-actions';

function Print({
  squareMask,
  circleMask,
  dash,
  initialImageCoords,
  initialFilterCoords,
  isSelected,
  onSelect,
  onChange,
  onChangeFilter,
  file,
  imgRef,
  initialParams,
  scene,
}) {
  const trRef = useRef(null);
  const circleRef = useRef();
  const groupRef = useRef();

  const dispatch = useDispatch();
  const { activeView } = useSelector((store) => store.editorState);
  const [imageView, setImageView] = useState(true);
  const [circleClick, setCircleClick] = useState(false);
  const [imageTwo] = useImage(file, 'Anonymous');

  const openCircle = initialFilterCoords ? initialFilterCoords.openCircle : false;
  const openSquare = initialFilterCoords ? initialFilterCoords.openSquare : false;

  // эфект нужен для корректной фотографии, return - чтобы не было ошибки (не делал скрин при размонтировании)
  useEffect(() => {
    const time = setTimeout(() => {
      dispatch(scene(activeView));
    }, 100);
    return () => clearTimeout(time);
  }, [initialFilterCoords, initialImageCoords]);

  useEffect(() => {
    dispatch(scene(activeView));
    if (openSquare || openCircle) {
      setImageView(false);
    }
    if (!openSquare && !openCircle) {
      setImageView(true);
    }
  }, [imageTwo, openCircle, openSquare, initialFilterCoords, initialImageCoords]);

  const onCircle = () => {
    onSelect();
    setCircleClick(true);
  };

  const onClickImage = () => {
    onSelect();
    setCircleClick(false);
  };

  useEffect(
    () => {
      if (isSelected && !circleClick && !openCircle && !openSquare) {
        trRef.current.nodes([imgRef.current]);
        trRef.current.getLayer().batchDraw();
      }
      if (isSelected && circleClick && !openCircle && !openSquare) {
        trRef.current.nodes([circleRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    },
    [isSelected],
    [imgRef],
    [circleClick],
    [circleRef],
    [groupRef],
  );

  const onChangeFilterCoordinates = (newAttrs) => {
    dispatch({
      type: SET_FILE_FILTER_CIRCLE_STAGE_PARAMS,
      payload: newAttrs,
    });
  };

  // console.log(initialImageCoords, '<<initialImageCoords');
  // console.log(initialFilterCoords, '<<initialFilterCoords');

  return (
    <>
      <Group
        clip={initialParams}
      >
        {dash && (<Rect x={initialParams.x + 2} y={initialParams.y + 2} width={initialParams.width - 4} height={initialParams.height - 4} fill="rgba(255, 0, 0, 0.0)" stroke="#00FF00" strokeWidth={2} dash={[1, 3]} />)}
        {imageView && (
          <Image
            className={styles.some}
            image={imageTwo}
            onClick={() => onClickImage()}
            // onClick={onSelect}
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
        )}
        {circleMask && (
          <Circle
            fill="rgb(0, 255, 0)"
            onClick={() => onCircle()}
            onTap={onSelect}
            ref={circleRef}
            {...initialFilterCoords}
            draggable
            onDragEnd={(e) => {
              onChangeFilter({
                ...initialFilterCoords,
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onTransform={(e) => {
              const node = circleRef.current;
            }}
            onTransformEnd={(e) => {
              const node = circleRef.current;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              node.scaleX(1);
              node.scaleY(1);
              onChangeFilter({
                ...initialFilterCoords,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(node.height() * scaleY),
                rotation: node.attrs.rotation,
              });
            }}
          />
        )}
        {openCircle && (
          <Group
            clipFunc={(ctx) => { ctx.arc(initialFilterCoords.x, initialFilterCoords.y, initialFilterCoords.width / 2, 0, Math.PI * 2, false); }}
            onClick={onSelect}
            onTap={onSelect}
            ref={groupRef}
            x={initialFilterCoords.positionX}
            y={initialFilterCoords.positionY}
            draggable
            onDragEnd={(e) => {
              onChangeFilter({
                ...initialFilterCoords,
                positionX: e.target.x(),
                positionY: e.target.y(),
              });
            }}
          >
            <Image
              className={styles.some}
              image={imageTwo}
              onClick={onSelect}
              onTap={onSelect}
              ref={imgRef}
              {...initialImageCoords}
            />
          </Group>
        )}
        {squareMask && (
          <Rect
            fill="rgb(0, 255, 0)"
            onClick={() => onCircle()}
            onTap={onSelect}
            ref={circleRef}
            x={initialFilterCoords.x === 250 ? 190 : initialFilterCoords.x === 270 ? 250 : initialFilterCoords.x === 230 ? 210 : initialFilterCoords.x}
            y={initialFilterCoords.y === 180 ? 120 : initialFilterCoords.y === 130 ? 110 : initialFilterCoords.y}
            rotation={initialFilterCoords.rotation}
            width={initialFilterCoords.width}
            height={initialFilterCoords.height}
            draggable
            onDragEnd={(e) => {
              onChangeFilter({
                ...initialFilterCoords,
                x: e.target.x(),
                y: e.target.y(),
              });
            }}
            onTransform={(e) => {
              const node = circleRef.current;
            }}
            onTransformEnd={(e) => {
              const node = circleRef.current;
              const scaleX = node.scaleX();
              const scaleY = node.scaleY();

              node.scaleX(1);
              node.scaleY(1);
              onChangeFilter({
                ...initialFilterCoords,
                x: node.x(),
                y: node.y(),
                width: Math.max(5, node.width() * scaleX),
                height: Math.max(node.height() * scaleY),
                rotation: node.attrs.rotation,
              });
            }}
          />
        )}
        {openSquare && (
          <Group
            clip={{
              x: initialFilterCoords.x === 250 ? 190 : initialFilterCoords.x === 270 ? 250 : initialFilterCoords.x === 230 ? 210 : initialFilterCoords.x,
              y: initialFilterCoords.y === 180 ? 120 : initialFilterCoords.y === 130 ? 110 : initialFilterCoords.y,
              rotation: initialFilterCoords.rotation,
              width: initialFilterCoords.width,
              height: initialFilterCoords.height,
            }}
            onClick={onSelect}
            onTap={onSelect}
            ref={groupRef}
            x={initialFilterCoords.rotation === 0 ? initialFilterCoords.positionX : initialFilterCoords.positionX + (initialFilterCoords.rotation * 3)}
            y={initialFilterCoords.rotation === 0 ? initialFilterCoords.positionY : initialFilterCoords.positionY - (initialFilterCoords.rotation * 3)}
            // x={initialFilterCoords.positionX}
            // y={initialFilterCoords.positionY}
            rotation={initialFilterCoords.rotation}
            draggable
            onDragEnd={(e) => {
              onChangeFilter({
                ...initialFilterCoords,
                positionX: e.target.x(),
                positionY: e.target.y(),
              });
            }}
          >
            <Image
              className={styles.some}
              image={imageTwo}
              onClick={onSelect}
              onTap={onSelect}
              ref={imgRef}
              {...initialImageCoords}
            />
          </Group>
        )}
      </Group>
      {isSelected && (
        <Transformer
          anchorStroke="rgb(0, 255, 0)"
          borderStroke="rgb(0, 255, 0)"
          anchorFill="rgb(0, 255, 0)"
          anchorSize={10}
          anchorCornerRadius={5}
          ref={trRef}
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 5 || newBox.height < 5) {
              console.log('oldBox');
              return oldBox;
            }
            console.log('newBox');
            return newBox;
          }}
        />
      )}
    </>
  );
}

export default Print;
