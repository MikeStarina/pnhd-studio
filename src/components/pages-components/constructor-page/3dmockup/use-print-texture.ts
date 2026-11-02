"use client";

import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { resolveMediaUrl } from "@/app/utils/product-photos";
import { localPrintUrl } from "@/app/utils/print-upload";

export const usePrintTexture = (fileUrl?: string) => {
    const [texture, setTexture] = useState<THREE.Texture | null>(null);
    const readyRef = useRef(false);
    const textureRef = useRef<THREE.Texture | null>(null);

    useEffect(() => {
        let cancelled = false;
        let objectUrl = "";
        readyRef.current = false;
        textureRef.current?.dispose();
        textureRef.current = null;
        setTexture(null);

        const apply = (url: string) => {
            const loader = new THREE.TextureLoader();
            loader.setCrossOrigin("anonymous");
            loader.load(
                url,
                (next) => {
                    if (cancelled) {
                        next.dispose();
                        return;
                    }
                    textureRef.current?.dispose();
                    textureRef.current = next;
                    setTexture(next);
                    readyRef.current = true;
                },
                undefined,
                () => {
                    if (!cancelled) readyRef.current = false;
                }
            );
        };

        const remote = fileUrl ? resolveMediaUrl(fileUrl) : "";
        if (!remote) {
            return () => {
                cancelled = true;
            };
        }

        const remembered = localPrintUrl(remote);
        if (remembered) {
            apply(remembered);
            return () => {
                cancelled = true;
                readyRef.current = false;
                textureRef.current?.dispose();
                textureRef.current = null;
            };
        }

        const source = remote.startsWith("https://cdn.pnhd.ru/")
            ? `/api/print-texture?url=${encodeURIComponent(remote)}`
            : remote;

        if (source.startsWith("http") || source.startsWith("/api/print-texture")) {
            fetch(source)
                .then((response) => {
                    if (!response.ok) throw new Error("texture");
                    return response.blob();
                })
                .then((blob) => {
                    if (cancelled) return;
                    objectUrl = URL.createObjectURL(blob);
                    apply(objectUrl);
                })
                .catch(() => {
                    if (!cancelled) apply(remote);
                });
        } else {
            apply(remote);
        }

        return () => {
            cancelled = true;
            readyRef.current = false;
            textureRef.current?.dispose();
            textureRef.current = null;
            if (objectUrl) URL.revokeObjectURL(objectUrl);
        };
    }, [fileUrl]);

    return { texture, readyRef };
};
