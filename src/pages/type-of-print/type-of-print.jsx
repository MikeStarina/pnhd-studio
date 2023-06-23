import React from 'react';
import styles from './type-of-print.module.css';
import { Helmet } from "react-helmet";
import FeedbackScreen from '../../components/main-page-components/feedback-screen';
import MapScreen from '../../components/main-page-components/map-screen';
import Brief from '../../components/brief/brief';
import PrintingGallery from '../../components/printing-gallery/printing-gallery';
import PrintingFaq from '../../components/printing-faq/printing-faq';

const TypeOfPrint = (props) => {
    const info = props.method;
    const description = info.faq.description;
    const faqProps = info.faq;
    // Для компонента Gallery, масив фотографий
    const galleryProps = info.images.gallery;
    // Для первого компанента Brief, без масива subtitle
    const data = {
        title: props.method.main_heading,
        subtitle: props.method.brief_subtitle
    };
    //Для второго компанента Brief, с масивом subtitle
    const dataArray = {
        title: props.method.faq.title,
        subtitle: props.method.faq.subtitle,
    }

    return (
        <>
            <section className={styles.section_print_pages}>
                <Helmet
                    title={info.metaTitle}
                    meta={[
                        {
                            name: "description",
                            content: info.metaDescription,
                        },
                        {
                            name: "keywords",
                            content: info.metaKeywords,
                        },
                    ]}
                    script = {[
                        {
                        type: "application/ld+json",
                        innerHTML:
                            `{
                                "@context": "https://schema.org",
                                "@type": "Organization",
                                "url": "https://studio.pnhd.ru",
                                "logo": "/icon_logo.svg",
                                "address": {
                                    "@type": "PostalAddress",
                                    "streetAddress": "ул. Чапыгина 1",
                                    "addressLocality": "Санкт-Петербург",
                                    "addressRegion": "RU",
                                    "postalCode": "197022",
                                    "addressCountry": "RU"
                                },
                                "contactPoint" : [
                                {
                                "@type" : "ContactPoint",
                                "telephone" : "+78129046156",
                                "contactType" : "студия"
                                }
                                ],
                                "sameAs": [
                                  'https://vk.com/pinheadspb',
                                  'https://instagram.com/pnhd.studio'
                                ]
                            }
                            }
                            }`
                        }

                    ]}
            />
                <div className={styles.main_wrap}>
                </div>
                <h1 className={styles.main_heading}>А&nbsp;ЧТО&nbsp;ПЕЧАТАТЬ?&nbsp;&gt; {info.main_heading.toUpperCase()}</h1>
            </section>
            <Brief {...data} />
            <PrintingGallery gallery={galleryProps} />
            {description ? (<PrintingFaq {...faqProps} />) : (<Brief {...dataArray} />)}
            <FeedbackScreen />
            <MapScreen />
        </>
    )
}

export default TypeOfPrint;
