import React from "react";
import styles from "./printing-method.module.css";
import { Helmet } from "react-helmet";
import { HashLink } from "react-router-hash-link";
import PrintingGallery from "../../components/printing-methods-components/printing-gallery.jsx";
import PrintingFaq from "../../components/printing-methods-components/printing-faq.jsx";
import PrintingMethodPrice from "../../components/printing-methods-components/printing-method-price.jsx";
import MapScreen from "../../components/main-page-components/map-screen.jsx";

const PrintingMethod = (data) => {
  const info = data.method;
  return (
    <>
      <section className={styles.main_head}>
        {/* <Helmet
                title='PINHEAD STUDIO | Печать на футболках и толстовках | Контакты и цены'
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


        /> */}
        <div className={styles.main_wrap}>
          <h1 className={styles.main_heading}>METHODS&gt; {info.main_heading}</h1>
          <HashLink className={styles.link} to="#pricelistmethod">
            <button type="button" className={styles.button}>
              ЦЕНЫ
            </button>
          </HashLink>
        </div>
      </section>
      <section className={styles.brief}>
        <h2 className={styles.brief_title}>{info.brief_title}</h2>
        <p className={styles.brief_subtitle}>{info.brief_subtitle}
        </p>
      </section>
      <section className={styles.gallery}>
        <PrintingGallery />
      </section>
      <section className={styles.faq}>
        <PrintingFaq faq={info.faq}/>
      </section>
      <section className={styles.price}>
        <PrintingMethodPrice price={info.price} priceType={info.price_type}/>
      </section>
      <section className={styles.map}>
        <MapScreen />
      </section>
    </>
  );
};

export default PrintingMethod;
