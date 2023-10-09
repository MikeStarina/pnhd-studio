import React from 'react';
import styles from './printing-method.module.css';
import PrintingGallery from '../../components/printing-gallery/printing-gallery';
import PrintingFaq from '../../components/printing-faq/printing-faq';
import PrintingMethodPrice from '../../components/printing-methods-components/printing-method-price';
import MapScreen from '../../components/main-page-components/map-screen';
import PrintingFirstScreen from '../../components/printingFirstScreen/printingFirstScreen';

function PrintingMethod({ method }) {
  const info = method;
  const methodFaq = info.faq;
  return (
    <>
      <PrintingFirstScreen data={info} typePage="method" />
      <section className={styles.brief}>
        <h2 className={styles.brief_title}>КРАТКО</h2>
        <p className={styles.brief_subtitle}>{info.brief_subtitle}</p>
      </section>
      <PrintingGallery gallery={method.images.gallery} />
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
}

export default PrintingMethod;
