import React from 'react';
import styles from './page.module.css';
import Image from "next/image";
import PriceScreen from "@/components/pages-components/main-page/price-screen/price-screen";
import MapScreen from "@/components/pages-components/main-page/map-screen/map-screen";
import { Metadata } from "next";
import { ssOptions } from '@/app/utils/method-options-data';

export const generateMetadata = ({ params }: { params: { slug: string, type: string }}): Metadata => {
    const { slug, type } = params;
    const option: typeof ssOptions[0] = ssOptions.filter((item) => item.slug === slug && item.type === type)[0];

    return {
        title: option?.meta.metaTitle,
        description: option?.meta.metaDescription,
        keywords: option?.meta.metaKeywords,
        openGraph: {
            type: 'website',
            url: `https://studio.pnhd.ru/${params.slug}`,
            title: option?.title,
            description: option?.subtitle,
            siteName: 'PINHEAD STUDIO',
        }
    }
}


const MethodOptionsPage: React.FC<{
    params: { slug: string, type: string };
}> = ({ params }) => {
    const {slug, type} = params;
    const option: typeof ssOptions[0] = ssOptions.filter((item) => item.slug === slug && item.type === type)[0];

   

    return (
        <>
        {option && (
                <>
                    <section className={styles.method_mainScreen}>
                        <div className={styles.method_titleWrapper}>
                            <h1
                                className={styles.method_title}
                            >{`${option.title} ${option.subtitle}`}</h1>
                        </div>
                        <Image
                            src={option.cover}
                            alt="обложка"
                            className={styles.method_cover}
                        />
                    </section>
                    <section className={styles.method_brief}>
                        <div className={styles.main_text_wrapper}>
                            <h2 className={styles.brief_title}>КРАТКО</h2>
                            <p className={styles.brief_text}>{option.mainText}</p>
                        </div>
                        <div className={styles.blocks_wrapper}>
                            <div className={styles.block}>
                                <h2 className={styles.brief_title}>ПЛЮСЫ</h2>
                                <ul className={styles.pros_list}>
                                    {option.pros && option.pros.split(',').map((item, index) => (
                                        <li className={styles.pros_list_item} key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                            <div className={styles.block}>
                                <h2 className={styles.brief_title}>МИНУСЫ</h2>
                                <ul className={styles.pros_list}>
                                    {option.cons && option.cons.split(',').map((item, index) => (
                                        <li className={styles.pros_list_item} key={index}>{item}</li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className={styles.method_gallery}>
                        {option.gallery && option.gallery.map((item, index) => (
                            <Image
                                className={styles.gallery_img}
                                alt="print sample"
                                src={item}
                                loading="lazy"
                                decoding="async"
                                key={index}
                            />
                        ))}
                    </section>

                    

                    
                    <PriceScreen />
                    <MapScreen />

                    <section className={styles.method_description}>


                            <h2 className={styles.brief_title}>AI/RBTS CONTENT</h2>
                            
                    
                        
                        <div className={styles.robots_block} dangerouslySetInnerHTML={option.robotsText}>

                        </div>
                    </section>
                </>
            )}
        </>
    )
}

export default MethodOptionsPage;