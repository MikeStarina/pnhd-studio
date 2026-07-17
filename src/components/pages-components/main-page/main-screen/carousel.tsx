'use client'
import React, { useMemo, useRef, useEffect, useState } from 'react';
import styles from './carousel.module.css';
import { useGetBannersQuery } from '@/api/api';
import { IBanner } from '@/app/utils/types';
import CarouselItem from './carouselItem';

type CarouselItemData = {
    cardKey: string;
    banner: IBanner;
    render: (item: CarouselItemData) => React.ReactNode;
};

interface ICarouselProps {
    carouselStyles?: React.CSSProperties,
    arrowControls?: boolean,
    dotControls?: boolean,
    loop?: boolean,
    autoScroll?: boolean,
}

export const Carousel: React.FC<ICarouselProps> = ({
    carouselStyles,
    arrowControls = true,
    dotControls = true,
    loop = true,
    autoScroll = true
}) => {
    const { data: bannersResponse, isLoading, isError } = useGetBannersQuery();

    const data = useMemo<CarouselItemData[]>(() => {
        const banners = bannersResponse?.data ?? [];
        return banners.map((banner) => ({
            cardKey: banner._id,
            banner,
            render: (item) => <CarouselItem banner={item.banner} />,
        }));
    }, [bannersResponse]);

    const [carouselContent, setCarouselContent] = useState<CarouselItemData[] | null>(null)
    const [activeItem, setActiveItem] = useState<string | null>(null)
    const carouselMainContainerRef = useRef<HTMLDivElement>(null)
    const carouselScrollContainerRef = useRef<HTMLDivElement>(null)
    const carouselItemRefs = useRef<HTMLDivElement[]>([])
    const timeoutRef = useRef<number | null>(null)
    const progressBarIntervalRef = useRef<number | null>(null)
    const [isAutoScrollActive, setIsAutocsrollActive] = useState(autoScroll)
    const [controlButtonProgressBar, setControlButtonProgressBar] = useState(6)
    const [isArrowsVisible, setIsArrowsVisible] = useState(false)


    const arrowHandler = (direction: 'left' | 'right') => {
        if (!carouselContent?.length || !activeItem) return;

        if (direction === 'right') {
            let nextActiveItemIndex = carouselContent.findIndex(_ => _.cardKey === activeItem) + 1
            if (!carouselContent[nextActiveItemIndex]) {
                if (!loop) {
                    nextActiveItemIndex = 0
                } else {
                    const newCarouselContent = [...carouselContent];
                    const firstItem = newCarouselContent.shift();
                    if (!firstItem) return;
                    newCarouselContent.push(firstItem)
                    setCarouselContent(newCarouselContent)
                    setActiveItem(firstItem.cardKey)
                    return
                }

            }
            setActiveItem(carouselContent[nextActiveItemIndex].cardKey)
        }
        if (direction === 'left') {
            let nextActiveItemIndex = carouselContent.findIndex(_ => _.cardKey === activeItem) - 1
            if (!carouselContent[nextActiveItemIndex]) {
                if (!loop) {
                    nextActiveItemIndex = carouselContent.length - 1
                } else {
                    const newCarouselContent = [...carouselContent];
                    const lastItem = newCarouselContent.pop();
                    if (!lastItem) return;
                    newCarouselContent.unshift(lastItem)
                    setCarouselContent(newCarouselContent)
                    setActiveItem(lastItem.cardKey)
                    return
                }

            }
            setActiveItem(carouselContent[nextActiveItemIndex].cardKey)
        }
    };

    const timeoutFunction = () => {
        if (!carouselContent?.length || !activeItem) return;

        let nextActiveItemIndex = carouselContent.findIndex(_ => _.cardKey === activeItem) + 1
        if (!carouselContent[nextActiveItemIndex]) {
            if (!loop) {
                nextActiveItemIndex = 0
            } else {
                const newCarouselContent = [...carouselContent];
                const firstItem = newCarouselContent.shift();
                if (!firstItem) return;
                newCarouselContent.push(firstItem)
                setCarouselContent(newCarouselContent)
                setActiveItem(firstItem.cardKey)
                setControlButtonProgressBar(0)
                return
            }

        }
        setActiveItem(carouselContent[nextActiveItemIndex].cardKey)
        setControlButtonProgressBar(0)
    }

    const progressBarFunction = () => {
        setControlButtonProgressBar((prev) => prev + 1)
    }

    useEffect(() => {
        if (!data.length) {
            setCarouselContent([]);
            setActiveItem(null);
            return;
        }
        setActiveItem(data[0].cardKey)
        setCarouselContent([...data])
        setControlButtonProgressBar(0)
    }, [data])

    useEffect(() => {
        if (activeItem) {
            if (!carouselScrollContainerRef?.current) return;
            if (!carouselItemRefs?.current) return;
            const container = carouselScrollContainerRef?.current;
            const items = carouselItemRefs?.current
            const nextItemFromRef = items?.find(_ => _.id === `carousel-card-${activeItem}`)
            container.scrollTo({ left: nextItemFromRef?.offsetLeft, behavior: 'smooth' })
        }
    }, [activeItem])

    useEffect(() => {
        if (!timeoutRef?.current && isAutoScrollActive && autoScroll && activeItem) {
            setControlButtonProgressBar(0)
            timeoutRef.current = window.setInterval(timeoutFunction, 4500);
            progressBarIntervalRef.current = window.setInterval(progressBarFunction, 125)
        }
        return () => {
            if (timeoutRef?.current) {
                clearInterval(timeoutRef.current);
                if (progressBarIntervalRef.current) {
                    clearInterval(progressBarIntervalRef.current);
                }
                timeoutRef.current = null
                progressBarIntervalRef.current = null
            }
        }
    }, [activeItem, isAutoScrollActive, autoScroll])

    if (isLoading || isError || !data.length) {
        return null;
    }

    return (
        <div
            className={styles.carousel}
            style={carouselStyles}
            ref={carouselMainContainerRef}
            onMouseOver={() => {
                if (timeoutRef?.current) {
                    clearInterval(timeoutRef.current)
                    timeoutRef.current = null
                    if (progressBarIntervalRef.current) {
                        clearInterval(progressBarIntervalRef.current)
                    }
                    progressBarIntervalRef.current = null
                    setIsAutocsrollActive(false)
                }
                if (progressBarIntervalRef?.current) {
                    clearInterval(progressBarIntervalRef.current)
                    progressBarIntervalRef.current = null
                }
                if (arrowControls) {
                    setIsArrowsVisible(true)
                }
            }}
            onMouseLeave={() => {
                if (!timeoutRef?.current) {
                    setIsAutocsrollActive(true)
                    setControlButtonProgressBar(0)
                }
                if (arrowControls) {
                    setIsArrowsVisible(false)
                }
            }}
        >
            <div
                className={styles.carousel__container}
                ref={carouselScrollContainerRef}
                onScroll={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }}
            >
                {carouselContent?.map((_, index) => (
                    <div
                        key={_.cardKey}
                        className={styles.carosuel__contentWrapper}
                        id={`carousel-card-${_.cardKey}`}
                        ref={(el) => {
                            if (el) {
                                carouselItemRefs.current[index] = el
                            }
                        }}
                    >
                        {_.render(_)}
                    </div>
                ))}
            </div>
            {arrowControls && carouselContent?.length && carouselContent?.length > 1 &&
                <>
                    <button
                        className={`${styles.carousel_arrowControlButton} ${styles.carousel_arrowControlButton_left} ${isArrowsVisible ? styles.carousel_arrowControlButton_left_visible : null}`}
                        onClick={() => arrowHandler('left')}
                    >
                        <svg width="5" height="9" viewBox="0 0 5 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.37109 0.541016L0.764822 4.14729L4.37109 7.75356" stroke="#1A1A1A" strokeWidth="1.08188" strokeLinecap="round" />
                        </svg>
                    </button>
                    <button
                        className={`${styles.carousel_arrowControlButton} ${styles.carousel_arrowControlButton_right} ${isArrowsVisible ? styles.carousel_arrowControlButton_right_visible : null}`}
                        onClick={() => arrowHandler('right')}
                    >
                        <svg width="5" height="9" viewBox="0 0 5 9" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M4.37109 0.541016L0.764822 4.14729L4.37109 7.75356" stroke="#1A1A1A" strokeWidth="1.08188" strokeLinecap="round" />
                        </svg>
                    </button>
                </>
            }
            {dotControls && carouselContent?.length && carouselContent?.length > 1 &&
                <div className={styles.carousel__controls}>
                    {data.map((_) => (
                        <button
                            key={_.cardKey}
                            className={activeItem === _.cardKey ? `${styles.carousel__controlButton} ${styles.carousel__controlButton_active}` : styles.carousel__controlButton}
                            onClick={() => {
                                setCarouselContent([...data]);
                                setActiveItem(_.cardKey)
                            }}
                        >
                            <div>
                                {activeItem === _.cardKey &&
                                    <div 
                                        className={styles.carousel__progressBar}
                                        style={{
                                            maxWidth: `${controlButtonProgressBar}px`
                                        }}
                                    ></div>
                                }
                            </div>
                        </button>
                    ))}
                </div>
            }
        </div>
    )
}
