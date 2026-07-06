'use client'
import { useState, useEffect } from "react";
import { CDN_URL } from "@/app/utils/constants";
import Image from "next/image";

interface IImageComponentProps {
    src: {
        cdnPhoto: string;
        apiPhoto: string | null;
    };
    className: string;
    width: number;
    height: number;
}

export const ImageComponent: React.FC<IImageComponentProps> = ({ src, className, width, height }) => {
    const [imageSrc, setImageSrc] = useState(src.cdnPhoto);
    const [imageError, setImageError] = useState(false);

    useEffect(() => {
        if (imageError) {
            setImageSrc(`${CDN_URL}/no%20photo.png`);
        }
    }, [imageError]);
    return (
        <Image
            src={imageSrc}
            alt="card pic"
            className={className}
            width={width}
            height={height}
            loading="lazy"
            unoptimized
            onError={() => {
                if (imageSrc.includes('cdn.pnhd.ru') && !imageError && src.apiPhoto) {
                    setImageSrc(src.apiPhoto);
                    return;
                }
                setImageError(true);
            }}
        />
    );
}