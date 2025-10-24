import React from "react";
import styles from "@/app/contacts/page.module.css";
import {Metadata} from "next";
import MapScreen from "@/components/pages-components/main-page/map-screen/map-screen";
import MarkupScript from "@/components/shared-components/markup-script/markup-script";

export const metadata: Metadata = {
  title: 'Контактная информация студии печати на одежде Pinhead Studio',
  description: 'Контакты студии печати на одежде Pinhead Studio в Санкт-Петербурге: печать принтов на футболках, создание мерча для брендов, широкоформатная печать.',
  metadataBase: new URL('https://studio.pnhd.ru'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    title: 'PNHD STUDIO | Главная',
    images: '/opengraph-image.jpg',
  },
};

const Page: React.FC = () => {

  const jsonLdOrganization = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Pinhead Studio",
    "url": "https://studio.pnhd.ru/",
    "description": "Контакты студии печати на одежде Pinhead Studio в Санкт-Петербурге: печать принтов на футболках, создание мерча для брендов, широкоформатная печать.",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "ул. Чапыгина, д. 1",
      "addressLocality": "Санкт-Петербург",
      "postalCode": "194044",
      "addressCountry": "RU"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+7-(812)-904-61-56",
      "contactType": "customer service",
      "email": "studio@pnhd.ru",
      "availableLanguage": ["Russian"]
    },
    "sameAs": [
      "https://vk.com/pinheadspb",
      "https://t.me/pnhd_studio_bot"
    ]
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
        "name": "Контакты",
        "item": "https://studio.pnhd.ru/contacts"
      }
    ]
  }

  return (
    <>
      <div className={styles.title_wrapper}>
        <h1 className={styles.page_title}>Контакты</h1>
      </div>
      <MapScreen />
      <section className={styles.method_brief}>
        <div className={styles.main_text_wrapper}>
          <h2 className={styles.brief_title}>Реквизиты</h2>
          <p className={styles.brief_text}>
            - Наименование организации: ООО ПИНХЭД СТУДИО<br/>
            - ИНН:7810463916<br/>
            - КПП: 781301001
          </p>
        </div>
      </section>
      <MarkupScript jsonLd={jsonLdOrganization}/>
      <MarkupScript jsonLd={jsonLdBreadcrumbList}/>
    </>
  )
}

export default Page;