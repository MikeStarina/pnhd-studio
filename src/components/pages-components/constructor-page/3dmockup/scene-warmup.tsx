"use client";

import { useFrame } from "@react-three/fiber";
import { useProgress } from "@react-three/drei";
import { useRef } from "react";

const WARMUP_FRAMES = 100;

const SceneWarmup = ({ onDone }: { onDone: () => void }) => {
    const { active } = useProgress();
    const framesLeft = useRef(WARMUP_FRAMES);
    const done = useRef(false);

    useFrame(() => {
        if (done.current) return;
        if (active) {
            framesLeft.current = WARMUP_FRAMES;
            return;
        }
        framesLeft.current -= 1;
        if (framesLeft.current > 0) return;
        done.current = true;
        onDone();
    });

    return null;
};

export default SceneWarmup;
