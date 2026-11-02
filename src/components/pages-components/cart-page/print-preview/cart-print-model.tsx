"use client";

import React, { Suspense, useEffect, useMemo } from "react";
import type { BufferGeometry, Material } from "three";
import { Canvas } from "@react-three/fiber";
import { Environment, OrbitControls, useGLTF } from "@react-three/drei";
import { ICartOrderElement } from "@/app/utils/types";
import SurfaceDecal from "@/components/pages-components/constructor-page/3dmockup/surface-decal";
import StudioSet from "@/components/pages-components/constructor-page/3dmockup/studio-set";
import styles from "./print-preview.module.css";

const MiniShirt = ({ elem }: { elem: ICartOrderElement }) => {
    const type = elem.item.type;
    const stageColor = elem.item.stageColor ?? "#ffffff";
    const { nodes, materials } = useGLTF(type ? `/${type}.glb` : "/tshirt.glb");
    const prints = elem.prints ?? [];
    const sourceGeometry = (nodes?.item as unknown as { geometry?: BufferGeometry } | undefined)?.geometry;
    const sourceMaterial = materials?.mat as Material | undefined;
    const geometry = useMemo(() => sourceGeometry?.clone(), [sourceGeometry]);
    const material = useMemo(() => {
        if (!sourceMaterial) return undefined;
        const cloned = sourceMaterial.clone() as Material & { color?: { set: (color: string) => void } };
        cloned.color?.set(stageColor);
        return cloned;
    }, [sourceMaterial, stageColor]);

    useEffect(() => () => {
        geometry?.dispose();
        material?.dispose();
    }, [geometry, material]);

    if (!geometry || !material) return null;

    return (
        <mesh
            dispose={null}
            geometry={geometry}
            material={material}
            material-aoMapIntensity={1}
            material-roughness={2}
        >
            {prints.map((print, index) => (
                <SurfaceDecal key={print.id || index} print={print} />
            ))}
        </mesh>
    );
};

const CartPrintModel = ({ elem }: { elem: ICartOrderElement }) => {
    return (
        <div className={styles.mini} aria-hidden>
            <Suspense fallback={null}>
                <Canvas
                    dpr={1}
                    camera={{ position: [0, 0.72, 2.55], fov: 27 }}
                    gl={{ antialias: true, powerPreference: "low-power" }}
                    onCreated={({ camera, gl }) => {
                        camera.lookAt(0, 0.02, 0);
                        camera.layers.enable(1);
                        gl.setClearColor("#e6e6e6", 1);
                    }}
                    style={{ pointerEvents: "none" }}
                >
                    <ambientLight intensity={0.7} />
                    <directionalLight intensity={0.85} position={[2, 4, 3]} />
                    <StudioSet />
                    <Environment files="/potsdamer_platz_1k.hdr" background={false} />
                    <MiniShirt elem={elem} />
                    <OrbitControls
                        target={[0, 0.02, 0]}
                        autoRotate
                        autoRotateSpeed={1.2}
                        enablePan={false}
                        enableZoom={false}
                        enableRotate={false}
                    />
                </Canvas>
            </Suspense>
        </div>
    );
};

export default CartPrintModel;
