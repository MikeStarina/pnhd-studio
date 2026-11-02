"use client";

import { useMemo, useRef } from "react";
import * as THREE from "three";
import { ThreeEvent, useThree } from "@react-three/fiber";
import { TParams } from "@/app/utils/types";
import { normalFromRotation, poseOnSurface, rotationFromNormal, spinFromRotation, worldNormalFromHit } from "./print-pose";

type TDragMode = "move" | "border";

type TDragState = {
    mode: TDragMode;
    origin: THREE.Vector3;
    quaternion: THREE.Quaternion;
    shirt: THREE.Object3D;
    startPoint: THREE.Vector3;
    startLocal: THREE.Vector2;
    startPosition: [number, number, number];
    startScale: [number, number, number];
    startSpin: number;
    startRotation: [number, number, number];
};

const plane = new THREE.Plane();
const hitPoint = new THREE.Vector3();
const normal = new THREE.Vector3();
const parentInverse = new THREE.Matrix4();
const localPoint = new THREE.Vector3();

const projectToPlane = (ray: THREE.Ray, origin: THREE.Vector3, quaternion: THREE.Quaternion) => {
    normal.set(0, 0, 1).applyQuaternion(quaternion);
    plane.setFromNormalAndCoplanarPoint(normal, origin);
    const hit = ray.intersectPlane(plane, hitPoint);
    return hit ? hit.clone() : null;
};

const PrintCircle = ({
    params,
    visible,
    onEngage,
    onChange,
    onDragEnd,
}: {
    params: TParams;
    visible: boolean;
    onEngage: () => void;
    onChange: (next: TParams) => void;
    onDragEnd: () => void;
}) => {
    const group = useRef<THREE.Group>(null);
    const drag = useRef<TDragState | null>(null);
    const controls = useThree((state) => state.controls) as { enabled?: boolean } | null;
    const gl = useThree((state) => state.gl);
    const camera = useThree((state) => state.camera);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const onChangeRef = useRef(onChange);
    const onDragEndRef = useRef(onDragEnd);
    const onEngageRef = useRef(onEngage);
    const paramsRef = useRef(params);
    onChangeRef.current = onChange;
    onDragEndRef.current = onDragEnd;
    onEngageRef.current = onEngage;
    paramsRef.current = params;
    const [sx, sy] = params.decalScale;
    const radius = Math.max(0.045, Math.hypot(Math.abs(sx), Math.abs(sy)) * 0.62);
    const rotation = params.decalRotation as [number, number, number];

    const setControls = (enabled: boolean) => {
        if (controls) controls.enabled = enabled;
    };

    const begin = (event: ThreeEvent<PointerEvent>, mode: TDragMode) => {
        event.stopPropagation();
        onEngageRef.current();
        const object = event.object;
        const origin = new THREE.Vector3();
        const quaternion = new THREE.Quaternion();
        object.parent?.updateWorldMatrix(true, false);
        object.parent?.matrixWorld.decompose(origin, quaternion, new THREE.Vector3());
        const handle = object.parent;
        const shirt = handle?.parent;
        const point = projectToPlane(event.ray, origin, quaternion);
        if (!point || !shirt || !handle) return;
        parentInverse.copy(handle.matrixWorld).invert();
        const local = point.clone().applyMatrix4(parentInverse);
        gl.domElement.setPointerCapture(event.pointerId);
        setControls(false);
        drag.current = {
            mode,
            origin,
            quaternion,
            shirt,
            startPoint: point,
            startLocal: new THREE.Vector2(local.x, local.y),
            startPosition: [...params.decalPosition] as [number, number, number],
            startScale: [...params.decalScale] as [number, number, number],
            startSpin: spinFromRotation(params.decalRotation),
            startRotation: [...params.decalRotation] as [number, number, number],
        };

        const onPointerMove = (pointerEvent: PointerEvent) => {
            const current = drag.current;
            if (!current) return;
            const rect = gl.domElement.getBoundingClientRect();
            raycaster.setFromCamera(new THREE.Vector2(
                ((pointerEvent.clientX - rect.left) / rect.width) * 2 - 1,
                -((pointerEvent.clientY - rect.top) / rect.height) * 2 + 1
            ), camera);
            const currentParams = paramsRef.current;

            if (current.mode === "move") {
                const hit = raycaster.intersectObject(current.shirt, false)[0];
                if (!hit) return;
                const pose = poseOnSurface(
                    hit.point,
                    worldNormalFromHit(hit, current.shirt),
                    current.startSpin,
                    current.shirt,
                );
                onChangeRef.current({
                    ...currentParams,
                    decalPosition: pose.decalPosition,
                    decalRotation: pose.decalRotation,
                });
                return;
            }

            const nextPoint = projectToPlane(raycaster.ray, current.origin, current.quaternion);
            if (!nextPoint) return;

            const startMatrix = new THREE.Matrix4().compose(
                current.origin,
                current.quaternion,
                new THREE.Vector3(1, 1, 1)
            );
            localPoint.copy(nextPoint).applyMatrix4(startMatrix.invert());
            const angle = Math.atan2(localPoint.y, localPoint.x);
            const startAngle = Math.atan2(current.startLocal.y, current.startLocal.x);
            const radiusNow = Math.hypot(localPoint.x, localPoint.y);
            const radiusStart = Math.max(0.0001, Math.hypot(current.startLocal.x, current.startLocal.y));
            const factor = THREE.MathUtils.clamp(radiusNow / radiusStart, 0.35, 3);
            const nextWidth = THREE.MathUtils.clamp(current.startScale[0] * factor, 0.04, 0.55);
            const aspect = current.startScale[0] === 0 ? 1 : current.startScale[1] / current.startScale[0];
            const nextScale: [number, number, number] = [nextWidth, nextWidth * aspect, current.startScale[2]];
            onChangeRef.current({
                ...currentParams,
                deltaX: nextScale[0],
                deltaY: nextScale[1],
                decalScale: nextScale,
                decalRotation: rotationFromNormal(
                    normalFromRotation(current.startRotation),
                    current.startSpin + (angle - startAngle),
                ),
            });
        };
        const onPointerUp = (pointerEvent: PointerEvent) => {
            gl.domElement.removeEventListener("pointermove", onPointerMove);
            gl.domElement.removeEventListener("pointerup", onPointerUp);
            if (!drag.current) return;
            drag.current = null;
            if (gl.domElement.hasPointerCapture(pointerEvent.pointerId)) {
                gl.domElement.releasePointerCapture(pointerEvent.pointerId);
            }
            setControls(true);
            onDragEndRef.current();
        };
        gl.domElement.addEventListener("pointermove", onPointerMove);
        gl.domElement.addEventListener("pointerup", onPointerUp);
    };

    const selectPrint = (event: ThreeEvent<PointerEvent>) => {
        event.stopPropagation();
        onEngageRef.current();
        setControls(false);
        const end = () => {
            gl.domElement.removeEventListener("pointerup", end);
            gl.domElement.removeEventListener("pointercancel", end);
            setControls(true);
        };
        gl.domElement.addEventListener("pointerup", end);
        gl.domElement.addEventListener("pointercancel", end);
    };

    return (
        <group
            ref={group}
            position={params.decalPosition as [number, number, number]}
            rotation={rotation}
        >
            <mesh
                position={[0, 0, 0.02]}
                renderOrder={10}
                onPointerDown={(event) => {
                    if (!visible) selectPrint(event);
                    else begin(event, "move");
                }}
            >
                <circleGeometry args={[visible ? radius * 0.9 : radius, 48]} />
                <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} />
            </mesh>
            {visible && (
                <mesh
                    position={[0, 0, 0.021]}
                    renderOrder={11}
                    onPointerDown={(event) => begin(event, "border")}
                >
                    <ringGeometry args={[radius * 0.86, radius * 1.08, 64]} />
                    <meshBasicMaterial transparent opacity={0} depthWrite={false} depthTest={false} side={THREE.DoubleSide} />
                </mesh>
            )}
            {visible && (
                <mesh position={[0, 0, 0.022]} renderOrder={12} raycast={() => null}>
                    <ringGeometry args={[radius * 0.97, radius, 64]} />
                    <meshBasicMaterial color="#1a1a1a" transparent opacity={0.9} depthWrite={false} depthTest={false} side={THREE.DoubleSide} />
                </mesh>
            )}
        </group>
    );
};

export default PrintCircle;
