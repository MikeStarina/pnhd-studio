/* eslint-disable no-promise-executor-return */
/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable max-len */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable no-unused-vars */
import React, { useState, useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import Model from '../../components/threeJsConstructor-components/Model/Model';
import Scenes from '../../components/threeJsConstructor-components/Scenes/Scenes';
import styles from './threeJsConstructor-page.module.css';
import UploadedImage from '../../components/threeJsConstructor-components/UploadedImage/UploadedImage';

function ThreeJsConstructor() {
  const canvRef = useRef();
  const [applyImage, setApplyImage] = useState(false);
  const [price, setPrice] = useState('');
  const [format, setFormat] = useState('');
  const [cords, setCords] = useState();
  const [imgSize, setImgSize] = useState({ w: 100, h: 100 });
  const [xyzRotation, setXyzRotation] = useState([0, 0, 120]);
  const [rotationModel, setRotationModel] = useState(true);
  const [imageURL, setImageURL] = useState();
  const [dataURL, setDataUrl] = useState();
  const fileReader = new FileReader();
  const handleOnChange = (event) => {
    setRotationModel(false);
    event.preventDefault();
    if (event.target.files && event.target.files.length) {
      const file = event.target.files[0];
      fileReader.readAsDataURL(file);
    }
  };
  fileReader.onloadend = () => {
    setImageURL(fileReader.result);
  };

  return (
    <div className={styles.main}>
      <div className={styles.wrap_buttons}>
        <div className={styles.tabs_container}>
          <button
            type="button"
            className={styles.tab}
            id="front"
            onClick={() => {
              setXyzRotation([0, 0, 120]);
            }}
          >
            Грудь &gt;
          </button>
          <button
            type="button"
            className={styles.tab}
            id="back"
            onClick={() => {
              setXyzRotation([0, 0, -120]);
            }}
          >
            Спина &gt;
          </button>

          <button
            className={styles.tab}
            id="lsleeve"
            type="button"
            onClick={() => {
              setXyzRotation([-100, 0, 0]);
            }}
          >
            Л.&nbsp;рукав &gt;
          </button>

          <button
            className={styles.tab}
            id="rsleeve"
            type="button"
            onClick={() => {
              setXyzRotation([100, 0, 0]);
            }}
          >
            П.&nbsp;рукав &gt;
          </button>
        </div>
        <div className={styles.input_wrapper}>
          <input
            type="file"
            accept=".jpg, .png"
            className={styles.file_input}
            id="file_input"
            onChange={handleOnChange}
          />
          <label htmlFor="file_input" className={styles.file_input_button}>
            <span
              className={styles.file_input_button_text}
              name="input_button_text"
            >
              {' '}
              Выберите файл
            </span>
          </label>
          <p>
            Цена и формат:
            {price}
            ,
            {' '}
            {format}
          </p>
          <p>
            Высота:
            {' '}
            {imgSize.h}
            Ширина:
            {' '}
            {imgSize.w}
          </p>
          <button
            type="button"
            onClick={() => {
              setRotationModel(!rotationModel);
            }}
          >
            включить вращение модели
          </button>
          <button
            style={{ marginBottom: '10px' }}
            onClick={() => { setDataUrl(canvRef.current.toDataURL()); }}
            type="button"
          >
            Take screenshot
          </button>
          {dataURL ? (
            <div style={{
              width: '150px', height: '200px', backgroundImage: `url(${dataURL})`, border: '1px solid red', backgroundSize: '150px 200px', backgroundRepeat: 'no-repeat',
            }}
            />
          ) : ''}
        </div>
      </div>
      <div className={styles.canvas}>

        <Canvas camera={{ position: [0, 0, 120], fov: 60 }} ref={canvRef} id="canvas" gl={{ preserveDrawingBuffer: true }}>
          {imageURL ? (
            <UploadedImage
              test={imageURL || 'no_photo.jpg'}
              setCords={setCords}
              setImgSize={setImgSize}
              setApplyImage={setApplyImage}
              setImageURL={setImageURL}
              setRotationModel={setRotationModel}
            />
          ) : (
            ''
          )}
          <Scenes
            setCords={setCords}
            setImgSize={setImgSize}
            xyzRotation={xyzRotation}
            rotationModel={rotationModel}
          />
          <Model
            setCords={cords}
            imgTexture={imageURL}
            imgSize={imgSize}
            setApplyImage={setApplyImage}
            applyImage={applyImage}
            width={canvRef.current?.offsetHeight}
            height={canvRef.current?.offsetWidth}
            offsetLeft={canvRef.current?.offsetLeft}
            clientWidth={canvRef.current?.clientWidth}
            offsetTop={canvRef.current?.offsetTop}
            clientHeight={canvRef.current?.clientHeight}
            setPrice={setPrice}
            setFormat={setFormat}
          />
        </Canvas>
      </div>
    </div>
  );
}

export default ThreeJsConstructor;
