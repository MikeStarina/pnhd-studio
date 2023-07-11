import React from 'react';
import { Helmet } from 'react-helmet';
import styles from './printing-method.module.css';
import PrintingGallery from '../../components/printing-gallery/printing-gallery.jsx';
import PrintingFaq from '../../components/printing-faq/printing-faq.jsx';
import PrintingMethodPrice from '../../components/printing-methods-components/printing-method-price.jsx';
import MapScreen from '../../components/main-page-components/map-screen.jsx';
import PrintingFirstScreen from '../../components/printingFirstScreen/printingFirstScreen';

const PrintingMethod = (data) => {
    const info = data.method;
    const methodFaq = info.faq;
    return (
        <>
            <Helmet
                script={[
                    {
                        type: 'application/ld+json',
                        innerHTML: `{
                            '@context': 'https://schema.org',
                            '@type': 'Organization',
                            'address': {
                                '@type': 'PostalAddress',
                                'addressLocality': 'Санкт-Петербург',
                                'postalCode': '197022',
                                'streetAddress': 'ул. Чапыгина 1',
                            },
                            'email': 'studio@pnhd.ru',
                            'name': 'PINHEAD',
                            'telephone': '+78129046156',
                        }`,
                    },
                ]}
            />
            <PrintingFirstScreen data={info} typePage={'method'} />
            <section className={styles.brief}>
                <h2 className={styles.brief_title}>КРАТКО</h2>
                <p className={styles.brief_subtitle}>{info.brief_subtitle}</p>
            </section>
            <PrintingGallery gallery={data.method.images.gallery} />
            <PrintingFaq
                faq={methodFaq}
                title={methodFaq.title}
                description={methodFaq.description}
                variants={methodFaq.variants}
            />
            <PrintingMethodPrice
                price={info.price}
                priceType={info.price_type}
                priceVar={info.price_var}
            />
            <MapScreen />
        </>
    );
};

export default PrintingMethod;
