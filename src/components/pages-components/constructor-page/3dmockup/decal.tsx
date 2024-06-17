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
import { ICartOrderElement, TParams } from "@/app/utils/types";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useSearchParams } from "next/navigation";
import { useUploadPrintImageMutation } from '@/api/api';
import { v4 as uuidv4 } from "uuid";





const DecalComp = () => {
    //console.log('decal render');
    const dispatch = useAppDispatch();
    const itemCartId = useSearchParams().get("itemCartId");
    const { activeView } = useAppSelector((store) => store.printConstructor);
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    //@ts-ignore
    let currPrint = orderElement && orderElement.prints && orderElement.prints[activeView] ? orderElement.prints[activeView] : undefined;
    const [ uploadPreview ] = useUploadPrintImageMutation();
    

    const getScene = async (activeView: string, scene: Blob | null) => {
        // @ts-ignore
        //const preview = await stageRef.current.toDataURL();
        // @ts-ignore
        //const scene = await stageRef?.current?.toBlob();  
        const data = new FormData();
        scene && data.append('files', scene, `${activeView}_preview_${uuidv4()}.jpg`);
  
  
        const preview = await uploadPreview(data);
        // @ts-ignore
        dispatch(cartActions.setPreview({ preview, activeView, itemCartId: orderElement.itemCartId }))
  
      }

    const [ pivotVisibility, setpivotVisibility ] = useState<boolean>(); 
    const [ pivotComp, setPivotComp ] = useState<string>(); 
    const [ pivotAxis, setPivotAxis ] = useState<number>(); 
   
    const url = currPrint?.file?.url ? `${apiBaseUrl}${currPrint.file.url}` : '/whiteTexture.png';
    const texture = useTexture(url, () => { if (currPrint && !currPrint.preview) {return document.querySelector('canvas')?.toBlob((blob) => {getScene(activeView, blob);});}});
   
      //console.log(currPrint.stageParams);
   
    return (
        
        
        <>
        {currPrint && currPrint.stageParams && activeView === 'front' &&
        <>
        <PivotControls
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          onDragStart={(props) => {
            setPivotComp(props.component);
            setPivotAxis(props.axis);
          }}
          onDrag={(local) => {
           
            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            const quaternion = new THREE.Quaternion(currPrint.stageParams.pivotRotation);
            local.decompose(position, quaternion, scale);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);
            let newAttrs = currPrint.stageParams;

            if (pivotComp === 'Slider' || pivotComp === 'Arrow') {    
                
                if (orderElement?.item.type !== 'totebag') {
                newAttrs = {
                        ...newAttrs,
                        decalPosition: [position.x, position.y, position.z + 0],
                       // pivotPosition: [position.x, position.y, 0.15],                    
                }}

                if (orderElement?.item.type === 'totebag') {
                    newAttrs = {
                        ...newAttrs,
                        decalPosition: [position.x, position.y, position.z + 0.1],
                       // pivotPosition: [position.x, position.y, 0.15],                    
                }
                }
            }
            if (pivotComp === 'Rotator') {            
                newAttrs = {
                        ...newAttrs,
                        decalRotation: [rotation.x, rotation.y, rotation.z],
                        pivotRotation: [rotation.x, rotation.y, rotation.z]
                    
                }
            }
            if (pivotComp === 'Sphere') {            
                if (pivotAxis === 0) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.x, newAttrs.deltaY * scale.x, newAttrs.deltaZ * scale.z]};
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.z]};                    
            }
                
           //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
          }}
          onDragEnd={() => {      
            setpivotVisibility(false)      
            setPivotComp('');
            document.querySelector('canvas')?.toBlob((blob) => {
                getScene(activeView, blob);
            });
          }}
        />

      <Decal onClick={() => {setpivotVisibility(!pivotVisibility)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        {currPrint && currPrint.stageParams && activeView === 'back' &&
        <>
        <PivotControls
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          onDragStart={(props) => {
            setPivotComp(props.component);
            setPivotAxis(props.axis);
          }}
          onDrag={(local) => {
           
            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            const quaternion = new THREE.Quaternion(currPrint.stageParams.pivotRotation);
            local.decompose(position, quaternion, scale);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);
            let newAttrs = currPrint.stageParams;

            if (pivotComp === 'Slider' || pivotComp === 'Arrow') {

                if (orderElement?.item.type !== 'totebag') {
                newAttrs = {
                        ...newAttrs,
                         decalPosition: [position.x, position.y, position.z + 0],      
                         //pivotPosition: [position.x, position.y, -0.3],
                    
                }
                }
                if (orderElement?.item.type === 'totebag'){
                    newAttrs = {
                        ...newAttrs,
                         decalPosition: [position.x, position.y, position.z - 0.1],      
                         //pivotPosition: [position.x, position.y, -0.3],
                    
                }
                }
            }
            if (pivotComp === 'Rotator') {

            
                newAttrs = {
                        ...newAttrs,
                        decalRotation: [rotation.x, Math.PI, rotation.z * -1],
                         pivotRotation: [rotation.x, Math.PI, rotation.z * -1]
                    
                }
            }
            if (pivotComp === 'Sphere') {

                if (pivotAxis === 0) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.x, newAttrs.deltaY * scale.x, newAttrs.deltaZ * scale.z]};
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.z]};                    

            }
                
            //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
          }}
          onDragEnd={() => {      
            setpivotVisibility(false)      
            setPivotComp('');
            document.querySelector('canvas')?.toBlob((blob) => {
                getScene(activeView, blob);
            });
          }}
        />
      <Decal onClick={() => {setpivotVisibility(!pivotVisibility)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        {currPrint && currPrint.stageParams && activeView === 'lsleeve' &&
        <>
        <PivotControls
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          onDragStart={(props) => {
            setPivotComp(props.component);
            //console.log(props.axis);
            setPivotAxis(props.axis);
          }}
          onDrag={(local) => {
           
            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            const quaternion = new THREE.Quaternion(currPrint.stageParams.pivotRotation);
            local.decompose(position, quaternion, scale);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);
            let newAttrs = currPrint.stageParams;

            if (pivotComp === 'Slider' || pivotComp === 'Arrow') {

            
                newAttrs = {
                        ...newAttrs,
                         decalPosition: [position.x + 0.25, position.y, position.z],                    
                }
            }
            if (pivotComp === 'Rotator') {

            
                newAttrs = {
                        ...newAttrs,
                        decalRotation: [rotation.x, Math.PI / 2, rotation.z * -1],
                        pivotRotation: [rotation.x, Math.PI, rotation.z]
                    
                }
            }
            if (pivotComp === 'Sphere') {

                if (pivotAxis === 2) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.z, newAttrs.deltaY * scale.z, newAttrs.deltaZ * scale.x]};
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.x]};                    

            }
            //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
          }}
          onDragEnd={() => {      
            setpivotVisibility(false)      
            setPivotComp('');
            document.querySelector('canvas')?.toBlob((blob) => {
                getScene(activeView, blob);
            });
          }}
        />
      <Decal onClick={() => {setpivotVisibility(!pivotVisibility)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        {currPrint && currPrint.stageParams && activeView === 'rsleeve' &&
        <>
        <PivotControls
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          onDragStart={(props) => {
            setPivotComp(props.component);
            setPivotAxis(props.axis);
          }}
          onDrag={(local) => {
           
            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            const quaternion = new THREE.Quaternion(currPrint.stageParams.pivotRotation);
            local.decompose(position, quaternion, scale);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);
            let newAttrs = currPrint.stageParams;

            if (pivotComp === 'Slider' || pivotComp === 'Arrow') {

            
                newAttrs = {
                        ...newAttrs,
                         decalPosition: [position.x - 0.25, position.y, position.z],                    
                }
            }
            if (pivotComp === 'Rotator') {

            
                newAttrs = {
                        ...newAttrs,
                        decalRotation: [rotation.x, Math.PI / -2, rotation.z * -1],
                        pivotRotation: [rotation.x, rotation.y, rotation.z]
                    
                }
            }
            if (pivotComp === 'Sphere') {

                if (pivotAxis === 2) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.z, newAttrs.deltaY * scale.z, newAttrs.deltaZ * scale.x]};
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.x]};                    

            }
                //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
          }}
          onDragEnd={() => {      
            setpivotVisibility(false)      
            setPivotComp('');
            document.querySelector('canvas')?.toBlob((blob) => {
                getScene(activeView, blob);
            });
          }}
        />
      <Decal onClick={() => {setpivotVisibility(!pivotVisibility)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        </>
    )
}

export default DecalComp;