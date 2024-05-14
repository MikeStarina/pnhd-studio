'use client'
import React, { Suspense } from 'react';
import { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { useGLTF, useTexture, AccumulativeShadows, RandomizedLight, Decal, Environment, Center } from '@react-three/drei';
import { easing } from 'maath'
useGLTF.preload("/scene.gltf");




const Tee = ({ backdropStatus }: { backdropStatus: boolean}) => {

   const initCanvasParams: { position: Array<number>, fov: number } = { position: [0, 0, 2.5], fov: 25 };

    return (
      <Suspense fallback={null}>
        <Canvas shadows camera={{ position: [0, 0, 2.5], fov: 25}} gl={{ preserveDrawingBuffer: true }} eventPrefix="client">
            <ambientLight intensity={0.5} />
            <Environment files="https://dl.polyhaven.org/file/ph-assets/HDRIs/hdr/1k/potsdamer_platz_1k.hdr" />
            <CameraRig>
                {backdropStatus && <Backdrop />}
                <Center>
                    <Shirt backdropStatus={backdropStatus} />
                </Center>
            </CameraRig>
        </Canvas>
      </Suspense> 
    )
}

function Backdrop() {
    const shadows = useRef()
    //@ts-ignore
    useFrame((state, delta) => easing.dampC(shadows.current.getMesh().material.color, '#393939', 0.25, delta))
    return (
        //@ts-ignore
      <AccumulativeShadows ref={shadows} temporal frames={60} alphaTest={0.85} scale={10} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.14]}>
        <RandomizedLight amount={4} radius={9} intensity={0.55} ambient={0.25} position={[5, 5, -10]} />
        <RandomizedLight amount={4} radius={5} intensity={0.25} ambient={0.55} position={[-5, 5, -9]} />
      </AccumulativeShadows>
    )
  }

function CameraRig({ children }: any) {
    const group = useRef()
    //const snap = useSnapshot(state)
    useFrame((state, delta) => {
      easing.damp3(state.camera.position, [0, 0, 2], 0.25, delta)
      //@ts-ignore
      easing.dampE(group.current.rotation, [state.pointer.y / 10, -state.pointer.x / 2, 0], 0.25, delta)
    })
    //@ts-ignore
    return <group ref={group}>{children}</group>
}

function Shirt(props: any) {
    //const snap = useSnapshot(state)
    //const texture = useTexture(`/${snap.decal}.png`)
    const texture = useTexture('/hoodie_text.png')
    const ref = useRef(null);
    const { nodes, materials } = useGLTF('/shirt_baked_collapsed.glb')
    //@ts-ignore
    useFrame((state, delta) => {
      //@ts-ignore
      return easing.dampC(materials.lambert1.color, '#fff', 0.25, delta)
      //@ts-ignore
      //if (!props.backdropStatus) return ref.current.rotation.y += 0.01
      
    })
    //@ts-ignore
    //useFrame((state, delta) => (ref.current.rotation.y += 0.01))
    return (
        //@ts-ignore
      <mesh castShadow ref={ref} geometry={nodes.T_Shirt_male.geometry} material={materials.lambert1} material-roughness={1} {...props} dispose={null}>
        {/* <Decal position={[0, 0.04, 0.15]} rotation={[0, 0, 0]} map={texture} scale={0.1} /> */}
      </mesh>
    )
  }
  
  useGLTF.preload('/shirt_baked_collapsed.glb')
  ;['/hoodie_text.png'].forEach(useTexture.preload)



export default Tee;