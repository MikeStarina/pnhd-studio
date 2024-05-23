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

const TestPage: React.FC = () => {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: '20px',
        height: "100vh",
        boxSizing: "border-box",
        overflow: "hidden",
        margin: "100px 0 0 0",
      }}
    >
      <Suspense fallback={null}>
        <Canvas
          shadows
          orthographic
          gl={{ preserveDrawingBuffer: true }}
          camera={{ position: [0, 10, 100], zoom: 700 }}
        >
          {/* <ambientLight intensity={0.5 * Math.PI} /> */}
          <ambientLight intensity={0.5} />
          <directionalLight intensity={0.5} position={[10, 10, 10]} />
          <Environment files="/potsdamer_platz_1k.hdr" />
          
          <CameraRig>
          <Backdrop />
          <Shirt />
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

function Backdrop() {
  const shadows = useRef()
  useFrame((state, delta) => {
    //@ts-ignore
    return easing.dampC(shadows.current.getMesh().material.color, '#EF674E', 0.25, delta)})
  return (
    //@ts-ignore
    <AccumulativeShadows ref={shadows} temporal frames={60} alphaTest={0.85} scale={5} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.14]}>
      <RandomizedLight amount={4} radius={9} intensity={2} ambient={0.25} position={[5, 5, -10]} />
      <RandomizedLight amount={4} radius={5} intensity={1.25} ambient={0.55} position={[-5, 5, -9]} />
    </AccumulativeShadows>
  )
}

function CameraRig({ children }: any) {
  const group = useRef()
  //const snap = useSnapshot(state)
  useFrame((state, delta) => {
    easing.damp3(state.camera.position, [0, 0, 2], 0.25, delta)
    //@ts-ignore
    easing.dampE(group.current.rotation, [state.pointer.y / 10, -state.pointer.x / 5, 0], 0.25, delta)
  })
  //@ts-ignore
  return <group ref={group}>{children}</group>
}


function Shirt() {
  const texture = useTexture("/Glitch2.jpg");
  //const texture = useTexture("/hoodie_text.png");
  const wTexture = useTexture("/whiteTexture.png");
  const ref = useRef(null);
  const { nodes, materials } = useGLTF("/shirt_baked_collapsed.glb");

  //@ts-ignore
  useFrame((state, delta) => {
    //@ts-ignore
    return easing.dampC(materials.lambert1.color, "#EF674E", 0.25, delta);
  });
  //@ts-ignore
  const [pos, setXYZ] = useState<THREE.Vector3>([0, 0, 0.1]);
    //@ts-ignore
  const [rot, setRot] = useState<THREE.Euler>([0, 0, 0]);
    //@ts-ignore
  const [scl, setScl] = useState<THREE.Vector3>([0.15, 0.1, 0.15]);

  return (
    <mesh
      castShadow
      ref={ref}
      //@ts-ignore
      geometry={nodes.T_Shirt_male.geometry}
      material={materials.lambert1}
      material-aoMapIntensity={1}
      material-roughness={2}
      dispose={null}
    >
      <group position={[0, 0, 0.3]}>
        <PivotControls
          //fixed={true}
          //autoTransform={true}
          scale={0.15}
          activeAxes={[true, true, false]}
          onDrag={(local) => {
            console.log(ref.current);

            const position = new THREE.Vector3();
            const scale = new THREE.Vector3();
            const quaternion = new THREE.Quaternion();
            local.decompose(position, quaternion, scale);
            const rotation = new THREE.Euler().setFromQuaternion(quaternion);
            console.log(position.x);
              //@ts-ignore
            setXYZ([position.x, position.y, position.z + 0.1]);
              //@ts-ignore
            setRot([rotation.x, rotation.y, rotation.z]);
              //@ts-ignore
            setScl([0.15 * scale.x, 0.15 * scale.y, 0.15 * scale.z]);
          }}
        />
      </group>

      <Decal position={pos} rotation={rot} scale={scl} matrixAutoUpdate>
        <meshPhysicalMaterial
          transparent
          //   polygonOffset
          //   polygonOffsetFactor={-1}
          map={texture}
          map-flipY={false}
          map-anisotropy={16}
          iridescence={1}
          iridescenceIOR={1}
          iridescenceThicknessRange={[0, 1400]}
          roughness={1}
          clearcoat={0.5}
          metalness={0.75}
          toneMapped={false}
        />
      </Decal>
    </mesh>
  );
}

useGLTF.preload("/shirt_baked_collapsed.glb");
["/whiteTexture.png", "/Glitch2.jpg"].forEach(useTexture.preload);

export default TestPage;
