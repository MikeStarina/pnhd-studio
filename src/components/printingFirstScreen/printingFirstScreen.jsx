import React from "react";
import styles from "./printingFirstScreen.module.css";
import { Helmet } from "react-helmet";

const PrintingFirstScreen = ({ data, typePage }) => {
  const info = data;
  return (
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
        script={[
          {
            type: "application/ld+json",
            innerHTML: `{
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
                }`,
          },
        ]}
      />
      {typePage === "types" && <div className={styles.main_wrap}></div>}
      {typePage === "method" && (
        <div
          className={
            info.price_type === "Термотрансфер"
              ? `${styles.main_wrap} ${styles.main_wrap_termo}`
              : info.price_type === "ВЫШИВКА"
              ? `${styles.main_wrap} ${styles.main_wrap_vishivka}`
              : info.price_type === "ШЕЛКОГРАФИЯ"
              ? `${styles.main_wrap} ${styles.main_wrap_silk}`
              : info.price_type === "DTG"
              ? `${styles.main_wrap} ${styles.main_wrap_dtg}`
              : info.price_type === "DTF"
              ? `${styles.main_wrap} ${styles.main_wrap_dtf}`
              : styles.main_wrap
          }
        ></div>
      )}
      {typePage === "types" && (
        <h1 className={styles.main_heading}>
          А&nbsp;ЧТО&nbsp;ПЕЧАТАТЬ?&nbsp;&gt; {info.main_heading.toUpperCase()}
        </h1>
      )}
      {typePage === "method" && (
        <h1 className={styles.main_heading}>
          METHODS&nbsp;&gt; {info.main_heading.toUpperCase()}
        </h1>
      )}
    </section>
  );
};

export default PrintingFirstScreen;
