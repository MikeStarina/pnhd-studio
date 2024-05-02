import React from "react";
import styles from "./page.module.css";
import methodsData from "@/app/utils/print-methods-data";
import Image from "next/image";
import PriceScreen from "@/components/pages-components/main-page/price-screen/price-screen";
import MapScreen from "@/components/pages-components/main-page/map-screen/map-screen";
import { Metadata } from "next";
import DtfCalculator from "@/components/pages-components/method-page/dtf-calculator/dtf-calculator";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";

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

const MethodPage: React.FC<{
    params: { slug: string };
    searchParams: {[n:string]: string}
}> = async ({ params, searchParams }) => {
    const method = methodsData.find((item) => item.slug === params.slug);
    
    return (
        <>
            <Header searchParams={searchParams}/>
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
                        <h2 className={styles.brief_title}>КРАТКО</h2>
                        <p className={styles.brief_text}>{method.brief_subtitle}</p>
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
                </>
            )}
        <Footer searchParams={searchParams}/>
        </>
    );
};
export default MethodPage;
