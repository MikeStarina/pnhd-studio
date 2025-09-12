import React from 'react';
import styles from './page.module.css';
import Image from "next/image";
import PriceScreen from "@/components/pages-components/main-page/price-screen/price-screen";
import MapScreen from "@/components/pages-components/main-page/map-screen/map-screen";
import { Metadata } from "next";
import { ssOptions } from '@/app/utils/method-options-data';
import {prices} from "@/app/utils/constants";
import MarkupScript from "@/components/shared-components/markup-script/markup-script";



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
export const dynamicParams = false;
export const generateStaticParams = async ({ params }: { params: { slug: string }}) => {
    const filtered = ssOptions.filter((item) => item.slug === params.slug);
    return filtered.map((item) => ({type: item.type }))
}


const MethodOptionsPage: React.FC<{
    params: { slug: string, type: string };
}> = ({ params }) => {
    const {slug, type} = params;
    const option: typeof ssOptions[0] = ssOptions.filter((item) => item.slug === slug && item.type === type)[0];

    const jsonLdWebPage = {
        "@context": "https://schema.org",
        "@type": "WebPage",
        "name": `${option.title} ${option.subtitle}`,
        "description": option?.meta.metaDescription ?? "",
        "url": `https://studio.pnhd.ru/methods/${option?.slug}/${option?.type}`
        ,
        "mainEntity": {
            "@type": "Service",
            "name": option.title ?? ""
        },
        "primaryImageOfPage": {
            "@type": "ImageObject",
            "url": `https://studio.pnhd.ru${option.cover.src ?? ""}`,
        }
    }
    const offers: object[] = [];

    prices.forEach((priceGroup) => {
        priceGroup.prices.forEach((price) => {
            const cleanedPrice = price.price.replace(/Р\./g, '').trim();
            if (cleanedPrice.includes('/')) {
                const [whitePrice, colorPrice] = cleanedPrice.split('/').map(p => p.trim());
                offers.push({
                    "@type": "Offer",
                    "price": whitePrice,
                    "priceCurrency": "RUB",
                    "description": `${priceGroup.name} ${price.format} на белой ткани`,
                    "availability": "https://schema.org/InStock"
                });
                offers.push({
                    "@type": "Offer",
                    "price": colorPrice,
                    "priceCurrency": "RUB",
                    "description": `${priceGroup.name} ${price.format} на цветной ткани`,
                    "availability": "https://schema.org/InStock"
                });
            } else {
                offers.push({
                    "@type": "Offer",
                    "price": cleanedPrice,
                    "priceCurrency": "RUB",
                    "description": `${priceGroup.name} ${price.format}`,
                    "availability": "https://schema.org/InStock"
                });
            }
        });
    });
    const jsonLdService = {
        "@context": "https://schema.org",
        "@type": "Service",
        "name": `${option.title} ${option.subtitle}`,
        "description": option?.mainText ?? "",
        "provider": {
            "@type": "LocalBusiness",
            "name": "PNHD>STUDIO",
            "address": {
                "@type": "PostalAddress",
                "addressLocality": "Санкт-Петербург",
                "streetAddress": "ул. Чапыгина, д. 1"
            }
        },
        "areaServed": "Санкт-Петербург",
        "offers": offers
    }
    const jsonLdBreadcrumbList = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": "Главная",
                "item": "https://studio.pnhd.ru/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": "Методы печати",
                "item": "https://studio.pnhd.ru/methods"
            },
            {
                "@type": "ListItem",
                "position": 3,
                "name": `${option.title} ?? ""}`,
                "item": `https://studio.pnhd.ru/methods/${option?.slug}`
            },
            {
                "@type": "ListItem",
                "position": 4,
                "name": `${option.title} ${option.subtitle}`,
                "item": `https://studio.pnhd.ru/methods/${option?.slug}/${option?.type}`
            },

        ]
    }

    return (
        <>
            { option && (
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
                    <section>
                        
                    </section>

                    <section className={styles.method_description}>


                            <h2 className={styles.brief_title}>AI/RBTS CONTENT</h2>
                            
                    
                        
                        <div className={styles.robots_block} dangerouslySetInnerHTML={option.robotsText}>

                        </div>
                    </section>
                    <MarkupScript jsonLd={jsonLdWebPage}/>
                    <MarkupScript jsonLd={jsonLdService}/>
                    <MarkupScript jsonLd={jsonLdBreadcrumbList}/>
                </>
        )}
        </>
    )
}

export default MethodOptionsPage;