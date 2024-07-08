"use client";
import React, { Suspense, useEffect } from "react";
import * as THREE from "three";
import { useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  useGLTF,
  useTexture,
  AccumulativeShadows,
  RandomizedLight,
  PivotControls,
  Decal,
  Environment,
  Center,
  OrbitControls,
  TransformControls,
  CycleRaycast,
  CameraControls
} from "@react-three/drei";
import { easing } from "maath";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { apiBaseUrl } from "@/app/utils/constants";
import { ICartOrderElement } from "@/app/utils/types";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useSearchParams } from "next/navigation";
import { ReactReduxContextValue } from "react-redux";
import { frontFacing } from "three/examples/jsm/nodes/Nodes.js";


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
    //console.log('stage render')
    const { activeView } = useAppSelector((store) => store.printConstructor);
  return (
    <div
      style={{
        width: "100%",
        height: '100%',
        //border: '1px solid black',
        //borderRadius: '20px',
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          shadows
          orthographic
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 12, 100], zoom: 500 }}
        >
          {/* <ambientLight intensity={0.5 * Math.PI} /> */}
          <ambientLight intensity={0.5} />
          <directionalLight intensity={0.5} position={[10, 10, 10]} />
          <Environment files="/potsdamer_platz_1k.hdr" />
          
          

              <Shirt activeView={activeView}>
                { children }
              </Shirt>
              

         
          <AccumulativeShadows
            temporal
            frames={100}
            alphaTest={0.95}
            opacity={1}
            scale={25}
            position={[0, -1, 0]}
          >
            <RandomizedLight
              amount={8}
              radius={10}
              ambient={0.7}
              position={[10, 10, -5]}
              bias={0.01}
              size={10}
            />
          </AccumulativeShadows>
          <OrbitControls maxPolarAngle={Math.PI / 2} minPolarAngle={Math.PI / 2} autoRotate autoRotateSpeed={5} enablePan={true} enableZoom={true} />
        </Canvas>
      </Suspense>
    </div>
  );
};





function Shirt({ activeView, children }: { children: React.ReactNode, activeView: string}) {

    const itemCartId = useSearchParams().get("itemCartId");
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    //@ts-ignore
    const { type, stageColor } = orderElement?.item;


    let params: any = {
      pivotVisibility: false,
      pivotRotation: [0,0,0],
      pivotPosition: [0,0,0.3],
      pivotScale: 0.15,
      dragAxis: [true, true, false],
      meshRotation: [0,0,0],
  };       
  const ref = useRef(null);
  const { nodes, materials } = useGLTF(`/${type}.glb`);

    
  //@ts-ignore
  useFrame((state, delta) => {
    //@ts-ignore
    //return easing.dampC(materials.lambert1.color, "#fff", 0.25, delta);
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
  //@ts-ignore
  const { front, back, lsleeve, rsleeve } = orderElement?.prints;

  const frontPrint = useTexture(front?.file?.url ? `${apiBaseUrl}${front.file.url}` : '/whiteTexture.png');
  const backPrint = useTexture(back?.file?.url ? `${apiBaseUrl}${back.file.url}` : '/whiteTexture.png');
  const lsleevePrint = useTexture(lsleeve?.file?.url ? `${apiBaseUrl}${lsleeve.file.url}` : '/whiteTexture.png');
  const rsleevePrint = useTexture(rsleeve?.file?.url ? `${apiBaseUrl}${rsleeve.file.url}` : '/whiteTexture.png');
  return (
      
      
      <>
      {front && front.stageParams && front.file &&
        <Decal position={front.stageParams.decalPosition} rotation={front.stageParams.decalRotation} scale={front ? front.stageParams.decalScale : 0} matrixAutoUpdate map={frontPrint} />
      }
      {back && back.stageParams && back.file &&
        <Decal position={back.stageParams.decalPosition} rotation={back.stageParams.decalRotation} scale={back ? back.stageParams.decalScale : 0} matrixAutoUpdate map={backPrint} />
      }
      {lsleeve && lsleeve.stageParams && lsleeve.file &&
        <Decal position={lsleeve.stageParams.decalPosition} rotation={lsleeve.stageParams.decalRotation} scale={lsleeve ? lsleeve.stageParams.decalScale : 0} matrixAutoUpdate map={lsleevePrint} />
      }
      {rsleeve && rsleeve.stageParams && rsleeve.file &&
        <Decal position={rsleeve.stageParams.decalPosition} rotation={rsleeve.stageParams.decalRotation} scale={rsleeve ? rsleeve.stageParams.decalScale : 0} matrixAutoUpdate map={rsleevePrint} />
      }
      </>
  )
}








useGLTF.preload("/shirt_baked_collapsed.glb");
["/whiteTexture.png", "/Glitch2.jpg"].forEach(useTexture.preload);
export default Preview;
