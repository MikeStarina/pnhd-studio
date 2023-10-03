import React from 'react';
import PrintingFirstScreen from '../../components/printingFirstScreen/printingFirstScreen';
import PrintingGallery from '../../components/printing-gallery/printing-gallery';
import styles from './printing-product.module.css';
import PrintingFaq from '../../components/printing-faq/printing-faq';
import FeedbackScreen from '../../components/main-page-components/feedback-screen';
import ShopGallery from '../../components/main-page-components/shop-gallery';
import MapScreen from '../../components/main-page-components/map-screen';

function PrintingProduct(data) {
  const info = data.method;
  const methodFaq = info.faq;
  return (
    <>
      <PrintingFirstScreen data={info} typePage="product" />
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
      <ShopGallery />
      <FeedbackScreen />
      <MapScreen />
    </>
  );
}

export default PrintingProduct;
