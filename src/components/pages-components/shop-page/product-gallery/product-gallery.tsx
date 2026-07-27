'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { IProduct } from '@/app/utils/types';
import { productGallerySources } from '@/app/utils/product-photos';
import { ImageComponent } from '@/components/pages-components/shop-page/product-photos/imageComponent';
import styles from './product-gallery.module.css';

const AUTO_SCROLL_DELAY = 4000;

const ProductGallery: React.FC<{ item: IProduct }> = ({ item }) => {
    const photosArray = useMemo(() => productGallerySources(item), [item]);

    const galleryRef = useRef<HTMLUListElement | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);

    const scrollToIndex = useCallback((index: number) => {
        const gallery = galleryRef.current;
        if (!gallery) return;

        gallery.scrollTo({
            left: gallery.clientWidth * index,
            behavior: 'smooth',
        });
        setActiveIndex(index);
    }, []);

    useEffect(() => {
        if (photosArray.length <= 1 || isHovered) return;

        const timer = window.setInterval(() => {
            setActiveIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % photosArray.length;
                scrollToIndex(nextIndex);
                return nextIndex;
            });
        }, AUTO_SCROLL_DELAY);

        return () => window.clearInterval(timer);
    }, [isHovered, photosArray.length, scrollToIndex]);

    return (
        <div
            className={styles.galleryWrapper}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <ul
                ref={galleryRef}
                className={styles.gallery}
                onScroll={(event) => {
                    const target = event.currentTarget;
                    const nextIndex = Math.round(target.scrollLeft / target.clientWidth);
                    if (nextIndex !== activeIndex) {
                        setActiveIndex(nextIndex);
                    }
                }}
            >
                {photosArray.map((photo, index) => (
                    <li key={index} className={styles.gallery__item}>
                        <ImageComponent
                            src={photo}
                            className={styles.gallery__img}
                            width={371}
                            height={556}
                        />
                    </li>
                ))}
            </ul>

            <div className={styles.galleryDots} aria-label="Навигация по изображениям товара">
                {photosArray.map((_, index) => (
                    <button
                        key={index}
                        type="button"
                        className={`${styles.galleryDot} ${index === activeIndex ? styles.galleryDot_active : ''}`}
                        onClick={() => scrollToIndex(index)}
                        aria-label={`Перейти к фото ${index + 1}`}
                    />
                ))}
            </div>
        </div>
    );
};

export default ProductGallery;
