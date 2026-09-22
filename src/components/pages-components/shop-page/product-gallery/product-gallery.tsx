'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import classNames from 'classnames';
import { IProduct } from '@/app/utils/types';
import { productGallerySources } from '@/app/utils/product-photos';
import { ImageComponent } from '@/components/pages-components/shop-page/product-photos/imageComponent';
import ProductTagBadges from '@/components/pages-components/shop-page/product-tag-badges/product-tag-badges';
import styles from './product-gallery.module.css';

const AUTO_SCROLL_DELAY = 4000;
const MOBILE_QUERY = '(max-width: 800px)';

type TProductGalleryProps = {
    item: IProduct;
    variant?: 'grid' | 'carousel';
    showBadges?: boolean;
    className?: string;
    hasAutoScroll?: boolean;
};

const ProductGallery: React.FC<TProductGalleryProps> = ({
    item,
    variant = 'grid',
    showBadges = true,
    className,
    hasAutoScroll = true,
}) => {
    const photosArray = useMemo(() => productGallerySources(item), [item]);
    const isCarousel = variant === 'carousel';

    const galleryRef = useRef<HTMLUListElement | null>(null);
    const [activeIndex, setActiveIndex] = useState(0);
    const [isHovered, setIsHovered] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    const isSwipeable = isCarousel || isMobile;

    useEffect(() => {
        const mq = window.matchMedia(MOBILE_QUERY);
        const update = () => setIsMobile(mq.matches);
        update();
        mq.addEventListener('change', update);
        return () => mq.removeEventListener('change', update);
    }, []);

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
        if (photosArray.length <= 1) return;

        const shouldAutoScroll = hasAutoScroll ? isCarousel ? isHovered : (isMobile && !isHovered) : false;
        if (!shouldAutoScroll) return;

        const timer = window.setInterval(() => {
            setActiveIndex((prevIndex) => {
                const nextIndex = (prevIndex + 1) % photosArray.length;
                scrollToIndex(nextIndex);
                return nextIndex;
            });
        }, AUTO_SCROLL_DELAY);

        return () => window.clearInterval(timer);
    }, [isCarousel, isHovered, isMobile, photosArray.length, scrollToIndex]);

    return (
        <div
            className={classNames(styles.galleryWrapper, isCarousel && styles.galleryWrapper_carousel, className)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            <ul
                ref={galleryRef}
                className={classNames(styles.gallery, isCarousel && styles.gallery_carousel)}
                onScroll={(event) => {
                    if (!isSwipeable) return;
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

            {showBadges && (
                <div className={styles.top_left_stack}>
                    <ProductTagBadges tagIds={item.tags} />
                </div>
            )}

            {photosArray.length > 1 && (
                <div
                    className={classNames(styles.galleryDots, isCarousel && styles.galleryDots_carousel)}
                    aria-label="Навигация по изображениям товара"
                    onClick={(event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    }}
                >
                    {photosArray.map((_, index) => (
                        <button
                            key={index}
                            type="button"
                            className={classNames(styles.galleryDot, index === activeIndex && styles.galleryDot_active)}
                            onClick={(event) => {
                                event.preventDefault();
                                event.stopPropagation();
                                scrollToIndex(index);
                            }}
                            aria-label={`Перейти к фото ${index + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProductGallery;
