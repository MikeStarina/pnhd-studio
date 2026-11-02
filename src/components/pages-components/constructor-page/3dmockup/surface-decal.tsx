"use client";

import { ThreeEvent } from "@react-three/fiber";
import { Decal } from "@react-three/drei";
import { IPrintFile } from "@/app/utils/types";
import { usePrintTexture } from "./use-print-texture";

const SurfaceDecal = ({
    print,
    onPointerDown,
}: {
    print: IPrintFile;
    onPointerDown?: (event: ThreeEvent<PointerEvent>) => void;
}) => {
    const { texture } = usePrintTexture(print.file?.url);
    if (!print.stageParams || !texture) return null;
    const position = print.stageParams.decalPosition as [number, number, number];
    const rotation = print.stageParams.decalRotation as [number, number, number];
    const scale = print.stageParams.decalScale as [number, number, number];

    return (
        <Decal
            depthTest
            position={position}
            rotation={rotation}
            scale={scale}
            matrixAutoUpdate
            map={texture}
            onPointerDown={onPointerDown}
        />
    );
};

export default SurfaceDecal;
