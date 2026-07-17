import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './carouselItem.module.css';
import { IBanner } from '@/app/utils/types';

type CarouselItemProps = {
    banner: IBanner;
};

const CarouselItem: React.FC<CarouselItemProps> = ({ banner }) => {
    const content = (
        <div className={styles.carouselItem}>
            <Image
                src={banner.imageUrl}
                alt=""
                fill
                sizes="(max-width: 480px) 100vw, 1200px"
                className={`${styles.carouselItem__image} ${styles.carouselItem__imageDesktop}`}
                priority
            />
            <Image
                src={banner.mobileImageUrl}
                alt=""
                fill
                sizes="(max-width: 480px) 100vw, 1200px"
                className={`${styles.carouselItem__image} ${styles.carouselItem__imageMobile}`}
                priority
            />
        </div>
    );

    if (!banner.link) return content;

    const isExternal = /^https?:\/\//i.test(banner.link);

    if (isExternal) {
        return (
            <a
                href={banner.link}
                className={styles.carouselItem__link}
                target="_blank"
                rel="noopener noreferrer"
            >
                {content}
            </a>
        );
    }

    return (
        <Link href={banner.link} className={styles.carouselItem__link}>
            {content}
        </Link>
    );
};

export default CarouselItem;
