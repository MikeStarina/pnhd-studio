"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useThree } from "@react-three/fiber";

const useStudioBackground = () => {
    return useMemo(() => {
        const canvas = document.createElement("canvas");
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext("2d");
        if (!context) return null;
        context.fillStyle = "#f4f4f4";
        context.fillRect(0, 0, 512, 512);
        const vignette = context.createRadialGradient(256, 210, 70, 256, 230, 390);
        vignette.addColorStop(0, "rgba(70, 70, 70, 0)");
        vignette.addColorStop(0.42, "rgba(80, 80, 80, 0.04)");
        vignette.addColorStop(0.72, "rgba(70, 70, 70, 0.22)");
        vignette.addColorStop(1, "rgba(50, 50, 50, 0.55)");
        context.fillStyle = vignette;
        context.fillRect(0, 0, 512, 512);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        return texture;
    }, []);
};

const useCheckerMap = () => {
    return useMemo(() => {
        const size = 512;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) return null;
        const cells = 22;
        const cell = size / cells;
        for (let y = 0; y < cells; y += 1) {
            for (let x = 0; x < cells; x += 1) {
                context.fillStyle = (x + y) % 2 === 0 ? "#efefef" : "#e0e0e0";
                context.fillRect(x * cell, y * cell, cell, cell);
            }
        }
        const fade = context.createRadialGradient(size / 2, size / 2, size * 0.08, size / 2, size / 2, size * 0.48);
        fade.addColorStop(0, "rgba(0,0,0,0)");
        fade.addColorStop(1, "rgba(0,0,0,1)");
        context.globalCompositeOperation = "destination-out";
        context.fillStyle = fade;
        context.fillRect(0, 0, size, size);
        const texture = new THREE.CanvasTexture(canvas);
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }, []);
};

const useSoftShadow = () => {
    return useMemo(() => {
        const size = 256;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const context = canvas.getContext("2d");
        if (!context) return null;
        const shadow = context.createRadialGradient(size / 2, size / 2, size * 0.02, size / 2, size / 2, size * 0.48);
        shadow.addColorStop(0, "rgba(90, 90, 90, 0.45)");
        shadow.addColorStop(1, "rgba(90, 90, 90, 0)");
        context.fillStyle = shadow;
        context.fillRect(0, 0, size, size);
        const texture = new THREE.CanvasTexture(canvas);
        texture.generateMipmaps = false;
        texture.minFilter = THREE.LinearFilter;
        texture.magFilter = THREE.LinearFilter;
        return texture;
    }, []);
};

const CheckerFloor = ({ map }: { map: THREE.Texture }) => {
    const mesh = useRef<THREE.Mesh>(null);
    const camera = useThree((state) => state.camera);

    useLayoutEffect(() => {
        camera.layers.enable(1);
        mesh.current?.layers.set(1);
    }, [camera]);

    return (
        <mesh ref={mesh} rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.49, 0]} renderOrder={2}>
            <circleGeometry args={[1.2, 64]} />
            <meshBasicMaterial map={map} transparent depthWrite={false} />
        </mesh>
    );
};

const StudioSet = () => {
    const background = useStudioBackground();
    const checker = useCheckerMap();
    const shadow = useSoftShadow();

    return (
        <>
            {background && <primitive attach="background" object={background} />}
            {shadow && (
                <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.495, 0]} renderOrder={1}>
                    <circleGeometry args={[1.05, 64]} />
                    <meshBasicMaterial map={shadow} transparent depthWrite={false} />
                </mesh>
            )}
            {checker && <CheckerFloor map={checker} />}
        </>
    );
};

export default StudioSet;
