"use client";
import React, { useRef, useEffect } from "react";
import * as THREE from "three";
import { useState } from "react";
import {
  useTexture,
  PivotControls,
  Decal,
} from "@react-three/drei";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { apiBaseUrl } from "@/app/utils/constants";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { useSearchParams } from "next/navigation";
import { useUploadPrintImageMutation } from '@/api/api';
import { v4 as uuidv4 } from "uuid";





const DecalComp = () => {
    //console.log('decal render');
    const pivotRef = useRef(null)
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


    const [ pivotVisibility, setpivotVisibility ] = useState<boolean>(false); 
    const [ pivotOpacity, setPivotOpacity ] = useState<number>(1); 
    const [ pivotComp, setPivotComp ] = useState<string>(); 
    const [ pivotAxis, setPivotAxis ] = useState<number>(); 
   
   
    const url = currPrint?.file?.url ? `${apiBaseUrl}${currPrint.file.url}` : '/whiteTexture.png';
    const texture = useTexture(url, () => { if (currPrint && !currPrint.preview) {return document.querySelector('canvas')?.toBlob((blob) => {getScene(activeView, blob);});}});
    //const texture = useTexture(url);
   
    // useEffect(() => {
    //   document.querySelector('canvas')?.toBlob((blob) => {
    //     console.log('screenshot')
    //     getScene(activeView, blob);
    //   });

    //   return () => {
    //     document.querySelector('canvas')?.toBlob((blob) => {
    //       getScene(activeView, blob);
    //     });
    //   }

    // }, [pivotVisibility, pivotOpacity])
   
    return (
        
        
        <>
        {currPrint && currPrint.stageParams && activeView === 'front' &&
        <>
        <PivotControls
          //disableScaling
          disableAxes
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          userData={{ rotation: 0 }}
          ref={pivotRef}
          opacity={pivotOpacity}
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
                        decalPosition: [position.x, position.y, position.z + 0.1],
                       //pivotPosition: [position.x, position.y, 0.2],
                        pivotPosition: [0, 0, 0.2]          
                }}

                if (orderElement?.item.type === 'totebag') {
                    newAttrs = {
                        ...newAttrs,
                        decalPosition: [position.x, position.y, position.z + 0.1], 
                        pivotPosition: [0, 0, 0.2]               
                }
                }
            }
            if (pivotComp === 'Rotator') {            
                newAttrs = {
                        ...newAttrs,
                        decalRotation: [0, 0, rotation.z],
                        pivotPosition: [0, 0, 0.2]
                    
                }
            }
            if (pivotComp === 'Sphere') {            
               
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.z], pivotPosition: [0, 0, 0.2]};                    
            }
            
           //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
            //setpivotVisibility(false)
          }}
          onDragEnd={async () => {     
            setpivotVisibility(false)  
            setPivotOpacity(0)  
            setPivotComp('');            
            const to = setTimeout(() => {
              document.querySelector('canvas')?.toBlob((blob) => {                
                getScene(activeView, blob);
            });
            }, 100)
            
            return () => {clearTimeout(to)}
            
           
          }}
        />

      <Decal onClick={() => {setpivotVisibility(!pivotVisibility), setPivotOpacity(1)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        {currPrint && currPrint.stageParams && activeView === 'back' &&
        <>
        <PivotControls
          disableAxes
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          userData={{ rotation: 0 }}
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
                         decalPosition: [position.x, position.y, position.z - 0.1],   
                         pivotPosition: [0, 0, -0.2]   
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
                        pivotPosition: [0, 0, -0.2]
                        //pivotRotation: [rotation.x, Math.PI, rotation.z * -1]
                    
                }
            }
            if (pivotComp === 'Sphere') {

                //if (pivotAxis === 0) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.x, newAttrs.deltaY * scale.x, newAttrs.deltaZ * scale.z]};
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.z], pivotPosition: [0, 0, -0.2]};                    

            }
                
            //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
          }}
          onDragEnd={async () => {     
            setpivotVisibility(false)  
            setPivotOpacity(0)  
            setPivotComp('');            
            const to = setTimeout(() => {
              document.querySelector('canvas')?.toBlob((blob) => {
                
                getScene(activeView, blob);
            });
            }, 100)
            
            return () => {clearTimeout(to)}
            
           
          }}
        />
      <Decal onClick={() => {setpivotVisibility(!pivotVisibility)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        {currPrint && currPrint.stageParams && activeView === 'lsleeve' &&
        <>
        <PivotControls
          disableAxes
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          userData={{ rotation: Math.PI / -2 }}
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
                         pivotPosition: [0.4,0,0],                  
                }
            }
            if (pivotComp === 'Rotator') {

            
                newAttrs = {
                        ...newAttrs,
                        decalRotation: [rotation.x, Math.PI / 2, rotation.z * -1],
                        //pivotRotation: [rotation.x, Math.PI, rotation.z],
                        pivotPosition: [0.4,0,0],
                    
                }
            }
            if (pivotComp === 'Sphere') {

                //if (pivotAxis === 2) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.z, newAttrs.deltaY * scale.z, newAttrs.deltaZ * scale.x]};
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.x], pivotPosition: [0.4,0,0],};                    

            }
            //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
          }}
          onDragEnd={async () => {     
            setpivotVisibility(false)  
            setPivotOpacity(0)  
            setPivotComp('');            
            const to = setTimeout(() => {
              document.querySelector('canvas')?.toBlob((blob) => {
                
                getScene(activeView, blob);
            });
            }, 100)
            
            return () => {clearTimeout(to)}
            
           
          }}
        />
      <Decal onClick={() => {setpivotVisibility(!pivotVisibility)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        {currPrint && currPrint.stageParams && activeView === 'rsleeve' &&
        <>
        <PivotControls
          disableAxes
          rotation={currPrint.stageParams.pivotRotation}
          offset={currPrint.stageParams.pivotPosition}
          scale={currPrint.stageParams.pivotScale}
          activeAxes={currPrint.stageParams.dragAxis}
          visible={pivotVisibility}
          axisColors={['rgb(153,255,0)','rgb(153,255,0)','rgb(153,255,0)']}
          userData={{ rotation: Math.PI / -2 }}
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
                         //pivotPosition: [-0.4, 0, 0],                  
                }
            }
            if (pivotComp === 'Rotator') {

            
                newAttrs = {
                        ...newAttrs,
                        decalRotation: [rotation.x, Math.PI / -2, rotation.z * -1],
                        //pivotRotation: [rotation.x, rotation.y, rotation.z]
                        pivotPosition: [-0.4, 0, 0],
                    
                }
            }
            if (pivotComp === 'Sphere') {

                //if (pivotAxis === 2) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.z, newAttrs.deltaY * scale.z, newAttrs.deltaZ * scale.x]};
                if (pivotAxis === 1) newAttrs = {...newAttrs,decalScale:[newAttrs.deltaX * scale.y, newAttrs.deltaY * scale.y, newAttrs.deltaZ * scale.x], pivotPosition: [-0.4, 0, 0],};                    

            }
                //@ts-ignore
            dispatch(cartActions.updateStageParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId }));
            //@ts-ignore
            dispatch(cartActions.updateCartParams({ newAttrs, activeView, itemCartId: orderElement.itemCartId, itemColor: orderElement.item.color }));
          }}
          onDragEnd={async () => {     
            setpivotVisibility(false)  
            setPivotOpacity(0)  
            setPivotComp('');            
            const to = setTimeout(() => {
              document.querySelector('canvas')?.toBlob((blob) => {
                
                getScene(activeView, blob);
            });
            }, 100)
            
            return () => {clearTimeout(to)}
            
           
          }}
        />
      <Decal onClick={() => {setpivotVisibility(!pivotVisibility)}} position={currPrint.stageParams.decalPosition} rotation={currPrint.stageParams.decalRotation} scale={currPrint ? currPrint.stageParams.decalScale : 0} matrixAutoUpdate map={texture} />
        </>
        }
        </>
    )
}

export default DecalComp;