import React, { useRef, useEffect, useState } from 'react';
import { Image, Group, Transformer, Rect, Circle } from 'react-konva';
import { useSelector, useDispatch } from 'react-redux';
import useImage from 'use-image';
import styles from './constructor-page.module.css';
// import circle50px from '../../components/images/circle50px.png';

function Print({
  openSquare,
  squareMask,
  openCircle,
  circleMask,
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
  const circleRef = useRef();
  const groupRef = useRef();

  const dispatch = useDispatch();
  const { activeView } = useSelector((store) => store.editorState);
  const [imageView, setImageView] = useState(true);
  const [circleClick, setCircleClick] = useState(false);
  const [imageTwo] = useImage(file, 'Anonymous');
  const [circleCoordination, setCircleCoordination] = useState({
    x: 250,
    y: 180,
    width: 120,
    height: 120,
  });
  const [squareCoordination, setSquareCoordination] = useState({
    x: 190,
    y: 120,
    width: 120,
    height: 120,
  });

  useEffect(() => {
    console.log(openCircle);
    setTimeout(() => {
      dispatch(scene(activeView));
    }, 1000);
    console.log('time out done');
  }, [openCircle, openSquare]);

  const photoScene = () => dispatch(scene(activeView));

  useEffect(() => {
    dispatch(scene(activeView));
    if (openSquare || openCircle) {
      setImageView(false);
    }
    if (!openSquare && !openCircle) {
      setImageView(true);
    }
  }, [imageTwo, openCircle, openSquare]);

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
      console.log(isSelected, 'isSelected', !circleClick, '!circleClick', !openCircle, '!openCircle', !openSquare, '!openSquare');
      if (isSelected && !circleClick && !openCircle && !openSquare) {
        console.log('start');
        trRef.current.nodes([imgRef.current]);
        trRef.current.getLayer().batchDraw();
        console.log('finish');
      }
      if (isSelected && circleClick && !openCircle && !openSquare) {
        // console.log('start');
        trRef.current.nodes([circleRef.current]);
        trRef.current.getLayer().batchDraw();
        // console.log('finish');
      }
      // if (isSelected && openCircle) {
      // trRef.current.nodes([groupRef.current, imgRef.current]);
      // trRef.current.getLayer().batchDraw();
      // console.log(trRef.current.nodes([groupRef.current, imgRef.current]));
      // }
    },
    [isSelected],
    [imgRef],
    [circleClick],
    [circleRef],
    [groupRef],
  );

  const onChangeCoordsCircle = (newAttrs) => {
    setCircleCoordination(newAttrs);
  };

  const onChangeCoordsSquare = (newAttrs) => {
    setSquareCoordination(newAttrs);
  };

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
            {...circleCoordination}
            draggable
            onDragEnd={(e) => {
              onChangeCoordsCircle({
                ...circleCoordination,
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
              onChangeCoordsCircle({
                ...circleCoordination,
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
            clipFunc={(ctx) => { ctx.arc(circleCoordination.x, circleCoordination.y, circleCoordination.width / 2, 0, Math.PI * 2, false); }}
            onClick={onSelect}
            onTap={onSelect}
            ref={groupRef}
            draggable
            onDragEnd={(e) => { photoScene(); }}
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
            {...squareCoordination}
            draggable
            onDragEnd={(e) => {
              onChangeCoordsSquare({
                ...squareCoordination,
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
              onChangeCoordsSquare({
                ...squareCoordination,
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
            clip={{ x: squareCoordination.x, y: squareCoordination.y, width: squareCoordination.width, height: squareCoordination.height }}
            onClick={onSelect}
            onTap={onSelect}
            ref={groupRef}
            draggable
            onDragEnd={(e) => { photoScene(); }}
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
