"use client";
import React, { Suspense, useCallback, useLayoutEffect, useRef, useState } from "react";
import styles from './preview.module.scss';
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { easing } from "maath";
import { useAppSelector } from "@/redux/redux-hooks";
import { ICartOrderElement } from "@/app/utils/types";
import SurfaceDecal from "./surface-decal";
import { useSearchParams } from "next/navigation";
import classNames from "classnames/bind";
import ModelLoader from "./model-loader";
import SceneWarmup from "./scene-warmup";
import StudioSet from "./studio-set";
const cx = classNames.bind(styles)


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


const Preview: React.FC<{ children?: React.ReactNode}> = ({ children }) => {
    const { activeView } = useAppSelector((store) => store.printConstructor);
    const [sceneReady, setSceneReady] = useState(false);
    const markReady = useCallback(() => setSceneReady(true), []);
  return (
    <div
      className={cx('container')}
    >
      <ModelLoader hold={!sceneReady} />
      <Suspense fallback={null}>
        <Canvas
          shadows
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 0.72, 2.55], fov: 27 }}
          onCreated={({ camera, gl }) => {
            camera.lookAt(0, 0.02, 0);
            camera.layers.enable(1);
            gl.setClearColor("#e6e6e6", 1);
          }}
          style={{ visibility: sceneReady ? "visible" : "hidden" }}
        >
          <SceneWarmup onDone={markReady} />
          <ambientLight intensity={0.7} />
          <directionalLight intensity={0.85} position={[2, 4, 3]} />
          <StudioSet />
          <Environment files="/potsdamer_platz_1k.hdr" background={false} />
          
          

              <Shirt activeView={activeView}>
                { children }
              </Shirt>
              

         
          <OrbitControls
            target={[0, 0.02, 0]}
            autoRotate
            autoRotateSpeed={1.2}
            enablePan={false}
            minDistance={1.35}
            maxDistance={6}
            maxPolarAngle={Math.PI / 1.85}
          />
        </Canvas>
      </Suspense>
    </div>
  );
};





function Shirt({ activeView, children }: { children: React.ReactNode, activeView: string }) {

    const itemCartId = useSearchParams().get("itemCartId");
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    const type = orderElement?.item?.type;
    const stageColor = orderElement?.item?.stageColor ?? "#ffffff";


    let params: any = {
      pivotVisibility: false,
      pivotRotation: [0,0,0],
      pivotPosition: [0,0,0.3],
      pivotScale: 0.15,
      dragAxis: [true, true, false],
      meshRotation: [0,0,0],
  };       
  const ref = useRef(null);
  const { nodes, materials } = useGLTF(type ? `/${type}.glb` : "/tshirt.glb");

  useLayoutEffect(() => {
    const material = materials?.mat as { color?: { set: (color: string) => void } } | undefined;
    material?.color?.set(stageColor);
  }, [materials, stageColor]);

  //@ts-ignore
  useFrame((state, delta) => {
    //@ts-ignore
    if (!materials?.mat?.color) return;
    //@ts-ignore
    return easing.dampC(materials.mat.color, stageColor, 0.25, delta);
  });
  const [ meshParams, setMeshParams ] = useState(params); 
  //const [ decalParams, setDecalParams ] = useState(getInitialMeshParams(activeView)); 
  //const texture = currPrint ? useTexture(`${apiBaseUrl}${currPrint.file.url}`) : useTexture("/whiteTexture.png");

  /**
   * 
   * "stageColor": "#fff", - белый
   * "stageColor": "#424242", - черный
   * "stageColor": "#eae7b2", - суровый
   * "stageColor": "#d6b696", - песочный
   * "stageColor": "#596b50", - хаки
   * "stageColor": "#25385f", - темно-синий
   * "stageColor": "#812135", - бордовый
   * "stageColor": "#bad2ed", - голубой
   * "stageColor": "#ada3c8", - фиолетовый
   * "stageColor": "#eb5a3d", - оранжевый
   * "stageColor": "#ff0031", - красный
   * "stageColor": "#194798", - василек
   * "stageColor": "#adadad", - серый
   */

  if (!type || !nodes?.item || !materials?.mat) return null;

  return (
    
      <mesh
        castShadow
        ref={ref}
        //@ts-ignore
        geometry={nodes.item.geometry}
        material={materials.mat}
        
        material-aoMapIntensity={1}
        material-roughness={2}
        dispose={null}
        rotation={meshParams.meshRotation}
      >
      <Prints />
      </mesh>
    
  );
}



const Prints = () => {
  const itemCartId = useSearchParams().get("itemCartId");
  const { order } = useAppSelector((store) => store.cart);
  const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
  const prints = orderElement?.prints ?? [];

  return (
      <>
      {prints.map((print, index) => (
        <SurfaceDecal key={print.id || index} print={print} />
      ))}
      </>
  )
}








useGLTF.preload("/shirt_baked_collapsed.glb");
["/whiteTexture.png", "/Glitch2.jpg"].forEach(useTexture.preload);
export default Preview;
