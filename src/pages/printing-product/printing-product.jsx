import React from 'react';
import PrintingFirstScreen from '../../components/printingFirstScreen/printingFirstScreen';
import PrintingGallery from '../../components/printing-gallery/printing-gallery';
import styles from './printing-product.module.css';
import PrintingFaq from '../../components/printing-faq/printing-faq';
import FeedbackScreen from '../../components/main-page-components/feedback-screen';
import ShopGallery from '../../components/main-page-components/shop-gallery';
import MapScreen from '../../components/main-page-components/map-screen';

function PrintingProduct(data) {
  const { method, shopGalleryData } = data;
  const { faq } = method;
  return (
    <>
      <PrintingFirstScreen data={method} typePage="product" />
      <section className={styles.brief}>
        <h2 className={styles.brief_title}>КРАТКО</h2>
        <p className={styles.brief_subtitle}>{faq.brief_subtitle}</p>
      </section>
      <PrintingGallery gallery={method.images.gallery} />
      <PrintingFaq
        faq={faq}
        title={faq.title}
        description={faq.description}
        variants={faq.variants}
      />
      <ShopGallery printingProduct="true" data={shopGalleryData} />
      <FeedbackScreen />
      <MapScreen />
    </>
  );
}

export default PrintingProduct;
