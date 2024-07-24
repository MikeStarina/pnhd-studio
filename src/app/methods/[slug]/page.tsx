import React from "react";
import styles from "./page.module.css";
import methodsData from "@/app/utils/print-methods-data";
import Image from "next/image";
import PriceScreen from "@/components/pages-components/main-page/price-screen/price-screen";
import MapScreen from "@/components/pages-components/main-page/map-screen/map-screen";
import { Metadata } from "next";
import DtfCalculator from "@/components/pages-components/method-page/dtf-calculator/dtf-calculator";
import Link from "next/link";
import { ssOptions } from "@/app/utils/method-options-data";

export const generateMetadata = ({ params }: { params: { slug: string }}): Metadata => {

    const method = methodsData.find((item) => item.slug === params.slug);

    return {
        title: method?.meta.metaTitle,
        description: method?.meta.metaDescription,
        keywords: method?.meta.metaKeywords,
        openGraph: {
            type: 'website',
            url: `https://studio.pnhd.ru/${params.slug}`,
            title: method?.ruName,
            description: method?.brief_subtitle,
            siteName: 'PINHEAD STUDIO',
        }
    }
}
export const dynamicParams = false;



const MethodPage: React.FC<{
    params: { slug: string };
}> = ({ params }) => {
    const method = methodsData.find((item) => item.slug === params.slug);
    const options = ssOptions.filter((item) => item.parent === method?.name);
    
    return (
        <>
            {method && (
                <>
                    <section className={styles.method_mainScreen}>
                        <div className={styles.method_titleWrapper}>
                            <h1
                                className={styles.method_title}
                            >{`METHODS> ${method.main_title}`}</h1>
                        </div>
                        <Image
                            src={method.images.main}
                            alt="обложка"
                            className={styles.method_cover}
                        />
                    </section>
                    <section className={styles.method_brief}>
                        <div className={styles.main_text_wrapper}>
                            <h2 className={styles.brief_title}>КРАТКО</h2>
                            <p className={styles.brief_text}>{method.brief_subtitle}</p>
                        </div>
                        {/* <div className={styles.blocks_wrapper}>
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
                        </div> */}
                    </section>

                    <section className={styles.method_gallery}>
                        {method.images.gallery.map((item, index) => (
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

                    <section className={styles.method_description}>
                        <h2 className={styles.brief_title}>{method.faq.title}</h2>
                        <p className={styles.brief_text}>{method.faq.description}</p>
                        <ul className={styles.description_list}>
                            {method.faq.variants.map((item, index) => (
                                <li className={styles.description_listItem} key={index}>
                                    <p className={styles.listItem_title}>{'> '}{item.screen_heading}</p>
                                    <p className={styles.listItem_text}>{item.screen_description}</p>
                                </li>
                            ))}
                        </ul>
                    </section>

                    {method.name === 'DTF' && <DtfCalculator />}
                    <PriceScreen />
                    <MapScreen />
                    <section className={styles.more_block}>
                        <div className={styles.main_text_wrapper}>
                            <h2 className={styles.brief_title}>ЧТО ДАЛЬШЕ?</h2>
                            <div className={styles.link_wrapper}>
                                <Link href='/methods'>К методам печати</Link>
                                <Link href='/'>На главную</Link>
                                <Link href='/shop'>В каталог</Link>
                            </div>
                        </div>
                        <div className={styles.main_text_wrapper}>
                            <h2 className={styles.brief_title}>ЧТО ЕЩЕ ПОЧИТАТЬ?</h2>
                            <div className={styles.link_wrapper}>
                            {options && options.map((item, index) => (
                                <Link href={`/methods/${item.slug}/${item.type}`} key={index}>{item.title} {item.subtitle}</Link>
                            ))}
                            </div>
                        </div>
                    </section>
                </>
            )}
        </>
    );
};
export default MethodPage;
