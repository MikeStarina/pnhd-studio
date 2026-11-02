"use client";

import React from "react";
import { useProgress } from "@react-three/drei";
import styles from "./model-loader.module.css";

const ModelLoader = ({ hold = false }: { hold?: boolean }) => {
    const { active, progress } = useProgress();
    if (!hold && !active) return null;

    return (
        <div className={styles.loader} role="status" aria-live="polite">
            <div className={styles.spinner} />
            <p className={styles.text}>
                {active ? `Загрузка модели ${Math.round(progress)}%` : "Загрузка модели"}
            </p>
        </div>
    );
};

export default ModelLoader;
