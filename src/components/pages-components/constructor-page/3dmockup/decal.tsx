"use client";
import React, { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";
import { useFrame, useThree } from "@react-three/fiber";
import PrintCircle from "./print-circle";
import SurfaceDecal from "./surface-decal";
import { poseOnSurface, worldNormalFromHit } from "./print-pose";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as cartActions } from "@/redux/cart-slice/cart.slice";
import { actions as constructorActions } from "@/redux/constructor-slice/constructor.slice";
import { useSearchParams } from "next/navigation";
import { IPrintFile, TParams } from "@/app/utils/types";

const Placement = ({
    print,
    index,
    onPlace,
}: {
    print: IPrintFile;
    index: number;
    onPlace: (printId: string, next: TParams) => void;
}) => {
    const camera = useThree((state) => state.camera);
    const raycaster = useMemo(() => new THREE.Raycaster(), []);
    const anchor = useRef<THREE.Group>(null);
    const done = useRef(false);

    useFrame(() => {
        if (done.current || !print.needsPlacement || !print.id || !print.stageParams) return;
        const shirt = anchor.current?.parent;
        if (!(shirt instanceof THREE.Mesh)) return;
        const step = Math.ceil(index / 2) * 0.16;
        const x = index === 0 ? 0 : (index % 2 === 0 ? step : -step);
        raycaster.setFromCamera(new THREE.Vector2(x, 0), camera);
        const hit = raycaster.intersectObject(shirt, false)[0];
        if (!hit) return;
        const pose = poseOnSurface(hit.point, worldNormalFromHit(hit, shirt), 0, shirt);
        done.current = true;
        onPlace(print.id, {
            ...print.stageParams,
            decalPosition: pose.decalPosition,
            decalRotation: pose.decalRotation,
        });
    });

    return <group ref={anchor} />;
};

const DecalComp = () => {
    const dispatch = useAppDispatch();
    const gl = useThree((state) => state.gl);
    const itemCartId = useSearchParams().get("itemCartId");
    const { selectedPrintId } = useAppSelector((store) => store.printConstructor);
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.find((item) => item.itemCartId === itemCartId);
    const prints = orderElement?.prints ?? [];
    const engaged = useRef(false);
    const itemIdRef = useRef(itemCartId);
    itemIdRef.current = itemCartId;

    useEffect(() => {
        const canvas = gl.domElement;
        const onCanvasDown = () => {
            window.setTimeout(() => {
                if (!engaged.current) dispatch(constructorActions.setSelectedPrintId(null));
                engaged.current = false;
            }, 0);
        };
        const onWindowDown = (event: PointerEvent) => {
            const target = event.target;
            if (!(target instanceof Element)) return;
            if (canvas.contains(target) || target.closest("[data-print-row]")) return;
            dispatch(constructorActions.setSelectedPrintId(null));
        };
        canvas.addEventListener("pointerdown", onCanvasDown);
        window.addEventListener("pointerdown", onWindowDown);
        return () => {
            canvas.removeEventListener("pointerdown", onCanvasDown);
            window.removeEventListener("pointerdown", onWindowDown);
        };
    }, [dispatch, gl]);

    const placePrint = (printId: string, next: TParams) => {
        const cartId = itemIdRef.current;
        if (!cartId) return;
        dispatch(cartActions.updateStageParams({ newAttrs: next, printId, itemCartId: cartId }));
    };

    const changePrint = (printId: string, next: TParams) => {
        if (!orderElement) return;
        dispatch(cartActions.updateStageParams({ newAttrs: next, printId, itemCartId: orderElement.itemCartId }));
        dispatch(cartActions.updateCartParams({
            newAttrs: next,
            printId,
            itemCartId: orderElement.itemCartId,
            itemColor: orderElement.item.color,
        }));
    };

    const selectPrint = (printId: string) => {
        engaged.current = true;
        dispatch(constructorActions.setSelectedPrintId(printId));
    };

    if (!prints.length) return null;

    return (
        <>
            {prints.map((print, index) => (
                <React.Fragment key={print.id || index}>
                    {print.needsPlacement && (
                        <Placement print={print} index={index} onPlace={placePrint} />
                    )}
                    <SurfaceDecal
                        print={print}
                        onPointerDown={(event) => {
                            if (!print.id) return;
                            event.stopPropagation();
                            selectPrint(print.id);
                        }}
                    />
                    {print.id && print.stageParams && selectedPrintId === print.id && (
                        <PrintCircle
                            params={print.stageParams}
                            visible
                            onEngage={() => selectPrint(print.id!)}
                            onChange={(next) => changePrint(print.id!, next)}
                            onDragEnd={() => undefined}
                        />
                    )}
                </React.Fragment>
            ))}
        </>
    );
};

export default DecalComp;
