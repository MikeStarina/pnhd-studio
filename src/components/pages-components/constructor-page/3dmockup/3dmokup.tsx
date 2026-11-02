"use client";
import React, { Suspense, useCallback, useEffect, useLayoutEffect, useState, useRef } from "react";
import styles from './3dmockup.module.css';
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  Environment,
  OrbitControls,
} from "@react-three/drei";
import { easing } from "maath";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { ICartOrderElement } from "@/app/utils/types";
import { useSearchParams } from "next/navigation";
import { v4 as uuidv4 } from "uuid";
import { useUploadPrintImageMutation } from "@/api/api";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { actions as constructorActions } from "@/redux/constructor-slice/constructor.slice";
import { photoProcessing } from "@/app/utils/constructor-utils";
import { printUploadFormData, readPrintUpload, rememberLocalPrint } from "@/app/utils/print-upload";
import { markSceneRevealed, resetSceneRevealed } from "@/app/utils/preview-capture";
import ModelLoader from "./model-loader";
import SceneWarmup from "./scene-warmup";
import StudioSet from "./studio-set";



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


const Stage: React.FC<{ children: React.ReactNode}> = ({ children }) => {
    //console.log('stage render')
    const dispatch = useAppDispatch();
    const { order } = useAppSelector((store) => store.cart);
    const itemCartId = useSearchParams().get("itemCartId");
    const orderElement = order?.find((item) => item.itemCartId === itemCartId);
    const [sceneReady, setSceneReady] = useState(false);
    const markReady = useCallback(() => {
        setSceneReady(true);
        markSceneRevealed();
    }, []);

    useEffect(() => {
        resetSceneRevealed();
        return () => resetSceneRevealed();
    }, []);
    const [ uploadPrint ] = useUploadPrintImageMutation();

   const handleDrag = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type !== "drop" || !orderElement) return;
    const file = e.dataTransfer.files?.[0];
    const print = file ? photoProcessing(file) : false;
    if (!print) return;
    dispatch(constructorActions.imageLoaderToggler());
    try {
      const uploaded = readPrintUpload(await uploadPrint(printUploadFormData(print, `${uuidv4()}_${print.name}`)));
      if (!uploaded) return;
      rememberLocalPrint(uploaded.url, print);
      const id = uuidv4();
      dispatch(cartActions.setPrint({
        print: { data: uploaded },
        id,
        itemCartId: orderElement.itemCartId,
        itemType: orderElement.item.type,
        itemColor: orderElement.item.color,
      }));
      dispatch(constructorActions.setSelectedPrintId(id));
    } finally {
      dispatch(constructorActions.imageLoaderToggler());
    }
   }
  return (
    <div
      id='dropzone'
      className={styles.container}
      onDragStart={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={handleDrag}
      onDragEnd={handleDrag}
     
    >
      <ModelLoader hold={!sceneReady} />
      <Suspense fallback={null}>
        <Canvas
          id='canvas'
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
          <Shirt>
            { children }
          </Shirt>
          <OrbitControls
            makeDefault
            target={[0, 0.02, 0]}
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

function Shirt({ children }: { children: React.ReactNode }) {

    const itemCartId = useSearchParams().get("itemCartId");
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    const type = orderElement?.item?.type;
    const stageColor = orderElement?.item?.stageColor ?? "#ffffff";

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
      >
      { children }
      </mesh>
    
  );
}

useGLTF.preload("/shirt_baked_collapsed.glb");
["/whiteTexture.png", "/Glitch2.jpg"].forEach(useTexture.preload);


export default Stage;
