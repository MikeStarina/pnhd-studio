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
} from "@react-three/drei";
import { easing } from "maath";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { apiBaseUrl } from "@/app/utils/constants";
import { ICartOrderElement } from "@/app/utils/types";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useSearchParams } from "next/navigation";
import { ReactReduxContextValue } from "react-redux";


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
    const { activeView, isSelected } = useAppSelector((store) => store.printConstructor);
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
          
          <CameraRig>
          <Backdrop>
          <Shirt activeView={activeView}>\
            { children }
          </Shirt>
          </Backdrop>
          </CameraRig>
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
          <OrbitControls makeDefault />
        </Canvas>
      </Suspense>
    </div>
  );
};

function Backdrop({ children }: { children: React.ReactNode}) {
    //console.log('backdrop render')
  const shadows = useRef(null)
  useFrame((state, delta) => {
    //@ts-ignore
    return easing.dampC(shadows.current.getMesh().material.color, '', 0.25, delta)})
  return (
    <>
    {/* //@ts-ignore */}
    <AccumulativeShadows ref={shadows} temporal frames={60} alphaTest={0.85} scale={5} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.14]}>
      <RandomizedLight amount={4} radius={9} intensity={2} ambient={0.25} position={[5, 5, -10]} />
      <RandomizedLight amount={4} radius={5} intensity={1.25} ambient={0.55} position={[-5, 5, -9]} />
    </AccumulativeShadows>
    { children }
    </>
  )
}

function CameraRig({ children }: any) {
  const group = useRef()
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0, 0, 2], 0.25, delta)
    //@ts-ignore
    easing.dampE(group.current.rotation, [state.pointer.y / 10, -state.pointer.x / 5, 0], 0.25, delta)
  })
  //@ts-ignore
  return <group ref={group}>{children}</group>
}


function Shirt({ activeView, children }: { children: React.ReactNode, activeView: string}) {

    const itemCartId = useSearchParams().get("itemCartId");
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    //@ts-ignore
    const { type, stageColor } = orderElement?.item;

    const dispatch = useAppDispatch();
    //@ts-ignore
    //let currPrint = orderElement?.prints[activeView] ? orderElement.prints[activeView] : undefined;

    useEffect(() => {
        setMeshParams(getInitialMeshParams(activeView));
    }, [activeView]);
    // useEffect(() => {
    //     let params = decalParams;
    //     if (currPrint && currPrint.stageParams) {params = currPrint.stageParams};
    //     setDecalParams(params);
    // }, [activeView, orderElement]);
    //@ts-ignore
    //let currPrint = orderElement?.prints[activeView] ? orderElement.prints[activeView] : undefined;

    const getInitialMeshParams = (activeView: string) => {
        let params: any = {
            pivotVisibility: false,
            pivotRotation: [0,0,0],
            pivotPosition: [0,0,0.3],
            pivotScale: 0.15,
            dragAxis: [true, true, false],
            meshRotation: [0,0,0],
        };


        if (activeView === 'rsleeve') {
            return {
                ...params,
                meshRotation: [0,Math.PI / 2, 0],
                pivotPosition: [-0.4, 0.06, -0.025],
                dragAxis: [false, true, true],
            }
        }
        if (activeView === 'lsleeve') {
            return {
                ...params,
                meshRotation: [0,Math.PI / -2, 0],
                pivotPosition: [0.4, 0.06, -0.025],
                dragAxis: [false, true, true],
            }
        }
        if (activeView === 'back') {
            return {
                ...params,
                meshRotation: [0,Math.PI, 0],
                pivotPosition: [0, 0, -0.3],
                pivotRotation: [0,Math.PI,0],
                dragAxis: [true, true, false],
            }
        }

       

        return params;
    }

    
  const ref = useRef(null);
  //const { nodes, materials } = useGLTF("/sweatshirt_model.glb");
  //console.log(nodes)
  //console.log(materials)
  const { nodes, materials } = useGLTF(`/${type}.glb`);

  //const sw = useGLTF("/sw_new.glb");
  //console.log(nodes);
  //console.log(sw);
    
  //@ts-ignore
  useFrame((state, delta) => {
    //@ts-ignore
    //return easing.dampC(materials.lambert1.color, "#fff", 0.25, delta);
    return easing.dampC(materials.mat.color, stageColor, 0.25, delta);
  });
  const [ meshParams, setMeshParams ] = useState(getInitialMeshParams(activeView)); 
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
        //geometry={nodes.T_Shirt_male.geometry}
        //material={materials.lambert1}
        geometry={nodes.item.geometry}
        material={materials.mat}
        
        material-aoMapIntensity={1}
        material-roughness={2}
        dispose={null}
        rotation={meshParams.meshRotation}
      >
      { children }
      </mesh>
    
  );
}

useGLTF.preload("/shirt_baked_collapsed.glb");
["/whiteTexture.png", "/Glitch2.jpg"].forEach(useTexture.preload);


export default Stage;
