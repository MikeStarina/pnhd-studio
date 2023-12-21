/* eslint-disable no-underscore-dangle */
/* eslint-disable react/button-has-type */
/* eslint-disable react/no-unknown-property */
/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable react/react-in-jsx-scope */
/* eslint-disable no-unused-vars */
/* eslint-disable import/no-extraneous-dependencies */
import { useRef, useEffect } from 'react';
import {
  Stats,
  CameraControls,
} from '@react-three/drei';

function Scenes({
  xyzRotation,
  rotationModel,
}) {
  const cameraControlsRef = useRef();

  useEffect(() => {
    cameraControlsRef.current?.setPosition(
      xyzRotation[0],
      xyzRotation[1],
      xyzRotation[2],
      true,
    );

    cameraControlsRef.current?.setLookAt(
      xyzRotation[0],
      xyzRotation[1],
      xyzRotation[2],
      0,
      0,
      0,
      true,
    );
  }, [xyzRotation]);
  return (
    <>
      <CameraControls
        ref={cameraControlsRef}
        minDistance={100}
        maxDistance={150}
        enabled={rotationModel}
      />
      <ambientLight intensity={0.3} color={0x666666} />
      <directionalLight
        position={[1, 0.75, 0.5]}
        intensity={3}
        color={0xffddcc}
      />
      <directionalLight
        position={[-1, 0.75, -0.5]}
        intensity={3}
        color={0xccccff}
      />
      <Stats />

    </>
  );
}

export default Scenes;
