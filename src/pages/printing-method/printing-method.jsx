import React from "react";
import styles from "./printing-method.module.css";
import { Helmet } from "react-helmet";
import PrintingGallery from "../../components/printing-gallery/printing-gallery.jsx";
import PrintingFaq from "../../components/printing-methods-components/printing-faq.jsx";
import PrintingMethodPrice from "../../components/printing-methods-components/printing-method-price.jsx";
import MapScreen from "../../components/main-page-components/map-screen.jsx";

const PrintingMethod = (data) => {
  const info = data.method;
  const methodFaq = info.faq;
  return (
    <>
      <section
        className={
          info.price_type === "Термотрансфер"
            ? `${styles.main_head} ${styles.main_head_termo}`
            : info.price_type === "ВЫШИВКА"
            ? `${styles.main_head} ${styles.main_head_vishivka}`
            : info.price_type === "ШЕЛКОГРАФИЯ"
            ? `${styles.main_head} ${styles.main_head_silk}`
            : info.price_type === "DTG"
            ? `${styles.main_head} ${styles.main_head_dtg}`
            : info.price_type === "DTF"
            ? `${styles.main_head} ${styles.main_head_dtf}`
            : styles.main_head
        }
      >
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
        <div className={styles.main_wrap}>
          <h1 className={styles.main_heading}>
            METHODS&nbsp;&gt; {info.main_heading}
          </h1>
        </div>
      </section>
      <section className={styles.brief}>
        <h2 className={styles.brief_title}>КРАТКО</h2>
        <p className={styles.brief_subtitle}>{info.brief_subtitle}</p>
      </section>
      <section className={styles.gallery}>
        <PrintingGallery gallery={data.method.images.gallery} />
      </section>
      <section className={styles.faq}>
        <PrintingFaq faq={methodFaq} title={methodFaq.title} description={methodFaq.description} variants={methodFaq.variants}/>
      </section>
      <section className={styles.price}>
        <PrintingMethodPrice
          price={info.price}
          priceType={info.price_type}
          priceVar={info.price_var}
        />
      </section>
      <section className={styles.map}>
        <MapScreen />
      </section>
    </>
  );
};

export default PrintingMethod;
