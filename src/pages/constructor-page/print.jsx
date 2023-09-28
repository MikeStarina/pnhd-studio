import React, { useRef, useEffect, useState } from 'react';
import WebFontLoader from 'webfontloader';
import { Image, Group, Transformer, Rect, Circle, Text } from 'react-konva';
import { useSelector, useDispatch } from 'react-redux';
import useImage from 'use-image';
import styles from './constructor-page.module.css';

function Print({
  squareMask,
  circleMask,
  dash,
  initialImageCoords,
  initialFilterCoords,
  initialText,
  isSelected,
  onSelect,
  onChange,
  onChangeFilter,
  OnChangeText,
  file,
  imgRef,
  initialParams,
  scene,
}) {
  const trRef = useRef(null);
  const circleRef = useRef(null);
  const textRef = useRef(null);
  const groupRef = useRef(null);

  const dispatch = useDispatch();
  const { activeView } = useSelector((store) => store.editorState);
  const [imageView, setImageView] = useState(true);
  const [circleClick, setCircleClick] = useState(false);
  const [textClick, setTextClick] = useState(false);
  const [imageTwo] = useImage(file, 'Anonymous');
  const [loaded, setLoaded] = useState(false);

  const openCircle = initialFilterCoords
    ? initialFilterCoords.openCircle
    : false;
  const openSquare = initialFilterCoords
    ? initialFilterCoords.openSquare
    : false;

  // эфект нужен для корректной фотографии (printScreen),
  // return - чтобы не было ошибки (не делал скрин при размонтировании)
  useEffect(() => {
    const time = setTimeout(() => {
      dispatch(scene(activeView));
    }, 100);
    return () => clearTimeout(time);
  }, [
    imageTwo,
    initialFilterCoords,
    initialImageCoords,
    openCircle,
    openSquare,
    initialText,
  ]);

  useEffect(() => {
    if (openSquare || openCircle) {
      setImageView(false);
    }
    if (!openSquare && !openCircle) {
      setImageView(true);
    }
  }, [openCircle, openSquare]);

  useEffect(() => {
    if (initialText) {
      // console.log(initialText, '<<');
      (async () => {
        await WebFontLoader.load({
          google: {
            families: [initialText.fontFamily],
          },
          fontactive: () => {
            setTimeout(() => {
              setLoaded(true);
            }, 3000);
          },
        });
      })();
    }
  }, [initialText]);

  const onCircle = () => {
    onSelect();
    setCircleClick(true);
    setTextClick(false);
  };

  const onClickImage = () => {
    onSelect();
    setCircleClick(false);
    setTextClick(false);
  };

  const onClickText = () => {
    onSelect();
    setTextClick(true);
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
      if (isSelected && textClick) {
        trRef.current.nodes([textRef.current]);
        trRef.current.getLayer().batchDraw();
      }
    },
    [isSelected],
    [imgRef],
    [textRef],
    [circleClick],
    [circleRef],
    [groupRef],
  );

  const onTransformText = () => {
    const node = textRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);
    OnChangeText(initialImageCoords, {
      ...initialText,
      x: node.x(),
      y: node.y(),
      width: Math.max(5, node.width() * scaleX),
      height: Math.max(node.height() * scaleY),
      rotation: node.attrs.rotation,
    });
  };

  const onTransformCircle = () => {
    const node = circleRef.current;
    const scaleX = node.scaleX();
    const scaleY = node.scaleY();

    node.scaleX(1);
    node.scaleY(1);
    onChangeFilter(initialImageCoords, initialText, {
      ...initialFilterCoords,
      squareX: node.x(),
      squareY: node.y(),
      widthShape: Math.max(5, node.width() * scaleX),
      heightShape: Math.max(node.height() * scaleY),
      rotation: node.attrs.rotation,
    });
  };

  return (
    <>
      <Group clip={initialParams}>
        {dash && (
          <Rect
            x={initialParams.x + 2}
            y={initialParams.y + 2}
            width={initialParams.width - 4}
            height={initialParams.height - 4}
            fill="rgba(255, 0, 0, 0.0)"
            stroke="#00FF00"
            strokeWidth={2}
            dash={[1, 3]}
          />
        )}
        {/* {initialText && initialText.openText && initialText.downText && ( */}
        {/*  <Text */}
        {/*    text={initialText.setText} */}
        {/*    x={initialText.x} */}
        {/*    y={initialText.y} */}
        {/*    width={initialText.width} */}
        {/*    fontSize={initialText.setSize} */}
        {/*    fontFamily={initialText.fontFamily} */}
        {/*    onClick={() => onClickText()} */}
        {/*    onTap={onSelect} */}
        {/*    ref={textRef} */}
        {/*    draggable */}
        {/*    fill={initialText.isDragging ? '#00FF00' : initialText.setColor} */}
        {/*    onDragStart={() => { */}
        {/*      const node = textRef.current; */}
        {/*      const scaleY = node.scaleY(); */}
        {/*      OnChangeText(initialImageCoords, { */}
        {/*        ...initialText, */}
        {/*        isDragging: true, */}
        {/*        height: Math.max(node.height() * scaleY), */}
        {/*      }, initialFilterCoords); */}
        {/*    }} */}
        {/*    onDragEnd={(e) => { */}
        {/*      const node = textRef.current; */}
        {/*      const scaleY = node.scaleY(); */}
        {/*      OnChangeText(initialImageCoords, { */}
        {/*        ...initialText, */}
        {/*        isDragging: false, */}
        {/*        x: e.target.x(), */}
        {/*        y: e.target.y(), */}
        {/*        height: Math.max(node.height() * scaleY), */}
        {/*      }, initialFilterCoords); */}
        {/*    }} */}
        {/*    onTransform={onTransformText} */}
        {/*  /> */}
        {/* )} */}
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
              onChange(
                {
                  ...initialImageCoords,
                  x: e.target.x(),
                  y: e.target.y(),
                },
                initialText,
              );
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
              onChange(
                {
                  ...initialImageCoords,
                  x: node.x(),
                  y: node.y(),
                  width: Math.max(5, node.width() * scaleX),
                  height: Math.max(node.height() * scaleY),
                  rotation: node.attrs.rotation,
                },
                initialText,
              );
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
            x={initialFilterCoords.circleX}
            y={initialFilterCoords.circleY}
            width={initialFilterCoords.widthShape}
            height={initialFilterCoords.heightShape}
            draggable
            onDragEnd={(e) => {
              onChangeFilter(initialImageCoords, initialText, {
                ...initialFilterCoords,
                circleX: e.target.x(),
                circleY: e.target.y(),
              });
            }}
            onTransform={(e) => {
              const node = circleRef.current;
            }}
            onTransformEnd={onTransformCircle}
          />
        )}
        {openCircle && (
          <Group
            clipFunc={(ctx) => {
              ctx.arc(
                initialFilterCoords.circleX,
                initialFilterCoords.circleY,
                initialFilterCoords.widthShape / 2,
                0,
                Math.PI * 2,
                false,
              );
            }}
            onClick={onSelect}
            onTap={onSelect}
            ref={groupRef}
            x={initialFilterCoords.positionX}
            y={initialFilterCoords.positionY}
            draggable
            onDragEnd={(e) => {
              onChangeFilter(initialImageCoords, initialText, {
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
            x={initialFilterCoords.squareX}
            y={initialFilterCoords.squareY}
            rotation={initialFilterCoords.rotation}
            width={initialFilterCoords.widthShape}
            height={initialFilterCoords.heightShape}
            draggable
            onDragEnd={(e) => {
              onChangeFilter(initialImageCoords, initialText, {
                ...initialFilterCoords,
                squareX: e.target.x(),
                squareY: e.target.y(),
              });
            }}
            onTransform={(e) => {
              const node = circleRef.current;
            }}
            onTransformEnd={onTransformCircle}
          />
        )}
        {openSquare && (
          <Group
            clip={{
              x: initialFilterCoords.squareX,
              y: initialFilterCoords.squareY,
              rotation: initialFilterCoords.rotation,
              width: initialFilterCoords.widthShape,
              height: initialFilterCoords.heightShape,
            }}
            onClick={onSelect}
            onTap={onSelect}
            ref={groupRef}
            x={
              initialFilterCoords.rotation === 0
                ? initialFilterCoords.positionX
                : initialFilterCoords.positionX +
                  initialFilterCoords.rotation * 3
            }
            y={
              initialFilterCoords.rotation === 0
                ? initialFilterCoords.positionY
                : initialFilterCoords.positionY -
                  initialFilterCoords.rotation * 3
            }
            rotation={initialFilterCoords.rotation}
            draggable
            onDragEnd={(e) => {
              onChangeFilter(initialImageCoords, initialText, {
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
        {initialText && initialText.openText && !initialText.downText && (
          <Text
            text={initialText.setText}
            x={initialText.x}
            y={initialText.y}
            width={initialText.width}
            fontSize={initialText.setSize}
            fontFamily={loaded ? initialText.fontFamily : 'Arial'}
            onClick={() => onClickText()}
            onTap={onSelect}
            ref={textRef}
            draggable
            fill={initialText.isDragging ? '#00FF00' : initialText.setColor}
            onDragStart={() => {
              const node = textRef.current;
              const scaleY = node.scaleY();
              OnChangeText(
                initialImageCoords,
                {
                  ...initialText,
                  isDragging: true,
                  height: Math.max(node.height() * scaleY),
                },
                initialFilterCoords,
              );
            }}
            onDragEnd={(e) => {
              const node = textRef.current;
              const scaleY = node.scaleY();
              OnChangeText(
                initialImageCoords,
                {
                  ...initialText,
                  isDragging: false,
                  x: e.target.x(),
                  y: e.target.y(),
                  height: Math.max(node.height() * scaleY),
                },
                initialFilterCoords,
              );
              // dispatch(getSize(initialText, activeView, itemColor));
            }}
            onTransform={onTransformText}
          />
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
