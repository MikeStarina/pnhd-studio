/* eslint-disable no-unused-vars */
/* eslint-disable object-shorthand */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable import/no-extraneous-dependencies */
import { useRef, useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { a } from '@react-spring/three';
import { useGesture } from 'react-use-gesture';
import { Html } from '@react-three/drei';
import styles from './UploadedImage.module.css';

function UploadedImage({
  test, setCords, setImgSize, setImageURL, setRotationModel,
}) {
  const [texturePos, setTexturePos] = useState();
  const [logoPos, setLogoPos] = useState({ x: 0, y: 0 });
  const [resize, setResize] = useState('');
  const [image, setImage] = useState();

  const [width, setWidth] = useState(100);
  const [height, setHeight] = useState(100);
  const bindLogoPos = useGesture({
    onDrag: (params) => {
      setLogoPos({
        x: params.offset[0],
        y: params.offset[1],
      });
      setTexturePos(params.xy);
    },
    onDragEnd: () => setCords([texturePos[0], texturePos[1]]),

  }, { drag: { axis: resize } });
  useEffect(() => {
    setImgSize({ w: width, h: height });
  }, [width, height]);
  const resizeDiv = useRef();
  const resizeHtml = useRef();
  const style = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    top: logoPos.y,
    left: logoPos.x,
  };

  function eraseData() {
    setImageURL();
    setCords();
    setRotationModel(true);
  }
  return (
    <a.mesh ref={resizeHtml}>
      <Html>
        <Resizable
          ref={resizeDiv}
          {...bindLogoPos()}
          style={style}
          size={{ width: width, height: height }}
          onResizeStart={() => {
            setResize('lock');
          }}
          // не удалять, ломается первый ресайз
          onResizeStop={(e, direction, ref, d) => {
            setResize('');
            setWidth(width + d.width);
            setHeight(height + d.height);
          }}
        >
          <div
            className={styles.img}
            style={{
              backgroundImage: `url(${test})`,
              position: 'relative',
            }}
          />
        </Resizable>
      </Html>
    </a.mesh>
  );
}

export default UploadedImage;
