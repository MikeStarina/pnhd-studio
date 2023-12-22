/* eslint-disable jsx-a11y/control-has-associated-label */
/* eslint-disable react/button-has-type */
/* eslint-disable no-console */
/* eslint-disable react/no-unknown-property */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable max-len */
/* eslint-disable prefer-destructuring */
/* eslint-disable prefer-const */
/* eslint-disable no-use-before-define */
/* eslint-disable import/extensions */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import * as THREE from 'three';
import { useThree } from '@react-three/fiber';
import { useTexture, useGLTF, Html } from '@react-three/drei';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { DecalGeometry } from 'three/addons/geometries/DecalGeometry.js';

function Model({
  setCords,
  imgTexture,
  imgSize,
  width,
  height,
  offsetLeft,
  clientWidth,
  offsetTop,
  clientHeight, setFormat, setPrice,
}) {
  const { scene, camera, raycaster } = useThree();
  let userImage = true;
  const geometry = new THREE.BufferGeometry();
  // еще одни кординаты но  вдругих цифрах...???
  const orientation = new THREE.Euler();
  let mesh;
  let mouseHelper;
  const intersects = [];
  let decals = [];

  geometry.setFromPoints([new THREE.Vector3(), new THREE.Vector3()]);

  mouseHelper = new THREE.Mesh(
    new THREE.BoxGeometry(1, 1, 10),
    new THREE.MeshNormalMaterial(),
  );
  mouseHelper.visible = true;
  scene.add(mouseHelper);

  // загрузка текстур для модели
  const textureLoader = new THREE.TextureLoader();
  const map = textureLoader.load('models/gltf/LeePerrySmith/Map-COL.jpg');
  map.colorSpace = THREE.SRGBColorSpace;

  const loader = new GLTFLoader();
  // загрузка самой модели
  loader.load('models/gltf/shirt_baked_collapsed.glb', function (gltf) {
    // добавление модели в сцену и установка материала для сетки
    mesh = gltf.scene.children[0];
    mesh.scale.set(160, 160, 160);
    console.log(mesh);
    mesh.material.color.set(0x00ff00);
    scene.add(mesh);
    // увеличение размеров сетки
  });

  let textureWidth;
  let textureHeight;
  function getTextureSize() {
    const { w, h } = imgSize;
    if (w > 100 && w < 150) {
      // console.log('1w');
      textureWidth = (w - 100) / 10 + (w - 100) / 50;
    } else if (w > 100 && w > 150) {
      // console.log('2w');
      textureWidth = (w - 100) / 10 + (w - 100) / 25;
    } else {
      // console.log('3w');
      textureWidth = (w - 100) / 6;
    }
    if (h > 100 && h < 150) {
      // console.log('1h');
      textureHeight = (h - 100) / 10 + (h - 100) / 50;
    } else if (h > 100 && h > 150 && h < 200) {
      // console.log('2h');
      textureHeight = (h - 100) / 10 + (h - 100) / 25;
    } else if (h > 200 && h < 250) {
      textureHeight = (h - 100) / 10 + (h - 100) / 12;
    } else {
      // console.log('3h');
      textureHeight = (h - 100) / 6;
    }
    // textureWidth = (w - 100) / 10;
    // textureHeight = (h - 100) / 10;
    // console.log(w, h);
  }
  function getPrice() {
    const { w, h } = imgSize;
    const width = w * 0.16;
    const height = h * 0.14;
    const printSqr = width * height;
    const color = 'белый';

    let screenSize = '';
    let priceCounter = 0;

    if (printSqr <= 150) {
      screenSize = 'А6';
      priceCounter = color && color === 'белый' ? 300 : 400;
    } else if (printSqr > 150 && printSqr <= 315) {
      screenSize = 'А5';
      priceCounter = color && color === 'белый' ? 400 : 500;
    } else if (printSqr > 315 && printSqr <= 609) {
      screenSize = 'А4';
      priceCounter = color && color === 'белый' ? 500 : 650;
    } else if (printSqr > 609 && printSqr <= 1218) {
      screenSize = 'А3';
      priceCounter = color && color === 'белый' ? 650 : 750;
    } else if (printSqr > 1218 && printSqr <= 1420) {
      screenSize = 'А3+';
      priceCounter = color && color === 'белый' ? 750 : 900;
    } else {
      screenSize = 'А3+';
      priceCounter = color && color === 'белый' ? 750 : 900;
    }
    setPrice(priceCounter);
    setFormat(screenSize);
    console.log(w, h, screenSize, priceCounter);
  }
  const pointer = new THREE.Vector2();

  function shootUsersImage(setCordss, imgTextures) {
    if (!userImage) return;
    if (!setCordss) return;
    if (mesh === undefined) return;
    getTextureSize();
    getPrice();
    // On image load, update texture
    const image = new Image(); // or document.createElement('img' );
    // Create texture
    const texture = new THREE.Texture(image);
    image.onload = () => {
      texture.needsUpdate = true;
    };
    // Set image source
    image.src = `${imgTextures}`;
    // создание текстуры
    // создание сетки
    const UserdecalMaterial = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      depthTest: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -4,
      wireframe: false,
    });
    texture.colorSpace = THREE.SRGBColorSpace;
    // создание сетки
    // вычисление оси z для переданных координат
    const positions = new THREE.Vector3();
    // pointer.x = (setCordss[0] / window.innerWidth) * 2 - 1;
    // pointer.y = -(setCordss[1] / window.innerHeight) * 2 + 1;
    pointer.x = (setCordss[0] / width) * 2 - 1;
    pointer.y = -(setCordss[1] / height) * 2 + 1;
    let correctWidth =
      window.innerWidth <= 1560
        ? 1590 - window.innerWidth
        : window.innerWidth - 1560;
    pointer.x =
      ((setCordss[0] - (offsetLeft + correctWidth)) / clientWidth) * 2 - 1;
    pointer.y = -((setCordss[1] - offsetTop) / clientHeight) * 2 + 1;
    raycaster.setFromCamera(pointer, camera);

    // calculate objects intersecting the picking ray
    raycaster.intersectObject(mesh, false, intersects);
    // вычисление оси z для переданных координат
    // - работает установка кляксы в конкретную точку
    const p = intersects[0].point;
    mouseHelper.position.copy(p);
    // // перенесем это значение в моусехэлпер и переменную с пересечением
    // intersection.point.copy(p);
    // // возьмем первое значение пересечения из массива пересечений с пересекающейся гранью
    const n = intersects[0].face.normal.clone();
    // // преобразование напрваления вектора при помощи матрицы и нормализация
    n.transformDirection(mesh.matrixWorld);
    // // умножение вектора на Х (скаляр)
    n.multiplyScalar(10);
    // // добавляем к вектору первое значение из массива пересечений мировых координат
    n.add(intersects[0].point);
    // // в текущую точку пересечения копирум нормализованные(от -1 до 1 ) значения из первого айтема массива мировых кординат
    // // направить "точку взгляда" моусхэлпера на n

    // установка координат в 3д варианте для правильного отображения линии и их обновление
    mouseHelper.lookAt(n);
    orientation.copy(mouseHelper.rotation);
    positions.set(p.x, p.y, p.z);
    positions.needsUpdate = true;
    const sizes = new THREE.Vector3(16 + textureWidth, 16 + textureHeight, 16);
    const m = new THREE.Mesh(
      new DecalGeometry(mesh, positions, orientation, sizes),
      UserdecalMaterial,
    );
    decals.push(m);
    scene.add(m);
    userImage = false;
    // - работает установка кляксы в конкретную точку
  }

  function removeDecals() {
    scene.children.forEach(function (d) {
      console.log(d.geometry?.boundingBox === null);
      if (d.geometry?.boundingBox === null) scene.remove(d);
    });
  }

  return (
    <Html>
      <button
        style={{ position: 'absolute', top: '-350px' }}
        onClick={() => {
          shootUsersImage(setCords, imgTexture);
        }}
      >
        нанести, епта
      </button>
      <button
        style={{ position: 'absolute', top: '-350px', left: '100px' }}
        onClick={() => {
          removeDecals();
        }}
      >
        очистить, епта
      </button>
    </Html>
  );
}

useGLTF.preload('./models/shirt_baked_collapsed.glb');
export default Model;
