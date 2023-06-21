import React from "react";
import styles from "./printing-method.module.css";
import { Helmet } from "react-helmet";
import PrintingGallery from "../../components/printing-methods-components/printing-gallery.jsx";
import PrintingFaq from "../../components/printing-methods-components/printing-faq.jsx";
import PrintingMethodPrice from "../../components/printing-methods-components/printing-method-price.jsx";
import MapScreen from "../../components/main-page-components/map-screen.jsx";

const PrintingMethod = () => {
  
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
          <h1 className={styles.main_heading}>METHODS&gt; DTF ПЕЧАТЬ</h1>

         {/*<FirstScreen />
   <FaqScreen />
      <ThirdScreen />
      <CaseGallery />
      <ConstructorScreen />
      <MethodsGallery />
      <ShopGallery />
      <PriceScreen />
      <FeedbackScreen />
      <MapScreen /> */}
    </section>
    <section className={styles.brief}>
      <h2 className={styles.brief_title}>Термотрансферная печать</h2>
      <p className={styles.brief_subtitle}>Термотрансферная печать (флекс) — отличный способ создать яркие, долговечные и высококачественные изображения на футболках. PINHEAD STUDIO в Санкт-Петербурге предлагает услуги термотрансферной печати на футболках и другой одежде, заказать которые вы можете полностью онлайн на нашем сайте.</p>
    </section>
    <section className={styles.gallery}>
      <PrintingGallery/>
    </section>
    <section className={styles.faq}>
      <PrintingFaq/>
    </section>
    <section className={styles.price}>
      <PrintingMethodPrice/>
    </section>
    <section className={styles.map}>
      <MapScreen/>
    </section>
    </>
  );
};

export default PrintingMethod;
