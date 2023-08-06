import React from 'react';
import { Helmet } from 'react-helmet';
import styles from './printingFirstScreen.module.css';

function PrintingFirstScreen({ data, typePage }) {
  const info = data;
  return (
    <section className={styles.section_print_pages}>
      <Helmet
        title={info.metaTitle}
        meta={[
          {
            name: 'description',
            content: info.metaDescription,
          },
          {
            name: 'keywords',
            content: info.metaKeywords,
          },
          {
            property: 'og:image',
            content:
                            'https://sun9-77.userapi.com/impg/r3SRF7rtra4wl-3EmEgVqIRaaGNbjeO6q9ufUw/-yeDgKpu2CQ.jpg?size=500x500&quality=95&sign=d7fc90ef8c432358c10c8b1e16b4945f&type=album',
          },
          {
            property: 'og:title',
            content: `${info.metaTitle}`,
          },
          {
            property: 'og:url',
            content: 'https://studio.pnhd.ru/',
          },
          {
            property: 'og:type',
            content: 'website',
          },
        ]}
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
      {typePage === 'types' && <div className={styles.main_wrap} />}
      {typePage === 'method' && (
        <div
          className={
                        info.price_type === 'Термотрансфер' ?
                          `${styles.main_wrap} ${styles.main_wrap_termo}`
                          : info.price_type === 'ВЫШИВКА' ?
                            `${styles.main_wrap} ${styles.main_wrap_vishivka}`
                            : info.price_type === 'ШЕЛКОГРАФИЯ' ?
                              `${styles.main_wrap} ${styles.main_wrap_silk}`
                              : info.price_type === 'DTG' ?
                                `${styles.main_wrap} ${styles.main_wrap_dtg}`
                                : info.price_type === 'DTF' ?
                                  `${styles.main_wrap} ${styles.main_wrap_dtf}`
                                  : styles.main_wrap
                    }
        />
      )}
      {typePage === 'types' && (
        <h1 className={styles.main_heading}>
          А&nbsp;ЧТО&nbsp;ПЕЧАТАТЬ?&nbsp;&gt;
          {' '}
          {info.main_heading.toUpperCase()}
        </h1>
      )}
      {typePage === 'method' && (
        <h1 className={styles.main_heading}>
          METHODS&nbsp;&gt;
          {' '}
          {info.main_heading.toUpperCase()}
        </h1>
      )}
    </section>
  );
}

export default PrintingFirstScreen;
