'use client'
import { useEffect, useState } from "react";
import Image from "next/image";
import { PHOTO_PLACEHOLDER, TPhotoSource } from "@/app/utils/product-photos";

interface IImageComponentProps {
    src: TPhotoSource;
    className: string;
    width: number;
    height: number;
}

export const ImageComponent: React.FC<IImageComponentProps> = ({ src, className, width, height }) => {
    const [imageSrc, setImageSrc] = useState(src.cdnPhoto);
    const [triedApiFallback, setTriedApiFallback] = useState(false);

    useEffect(() => {
        setImageSrc(src.cdnPhoto);
        setTriedApiFallback(false);
    }, [src.cdnPhoto]);

    return (
        <Image
            src={imageSrc || PHOTO_PLACEHOLDER}
            alt="card pic"
            className={className}
            width={width}
            height={height}
            loading="lazy"
            unoptimized
            onError={() => {
                if (src.apiPhoto && !triedApiFallback) {
                    setTriedApiFallback(true);
                    setImageSrc(src.apiPhoto);
                    return;
                }
                if (imageSrc !== PHOTO_PLACEHOLDER) {
                    setImageSrc(PHOTO_PLACEHOLDER);
                }
            }}
        />
    );
}
