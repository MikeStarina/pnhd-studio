import React from 'react';
import { Helmet } from 'react-helmet';
import styles from './type-of-print.module.css';
import PrintingFirstScreen from '../../components/printingFirstScreen/printingFirstScreen';
import FeedbackScreen from '../../components/main-page-components/feedback-screen';
import MapScreen from '../../components/main-page-components/map-screen';
import Brief from '../../components/brief/brief';
import PrintingGallery from '../../components/printing-gallery/printing-gallery';
import PrintingFaq from '../../components/printing-faq/printing-faq';

function TypeOfPrint({ method }) {
  const info = method;
  const { description } = info.faq;
  const faqProps = info.faq;
  // Для компонента Gallery, масив фотографий
  const galleryProps = info.images.gallery;
  // Для первого компанента Brief, без масива subtitle
  const data = {
    title: method.main_heading,
    subtitle: method.brief_subtitle,
  };
  // Для второго компанента Brief, с масивом subtitle
  const dataArray = {
    title: method.faq.title,
    subtitle: method.faq.subtitle,
  };
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
      <PrintingFirstScreen data={info} typePage="types" />
      <Brief type="h2" {...data} />
      <PrintingGallery gallery={galleryProps} />
      {description ? (
        <PrintingFaq {...faqProps} />
      ) : (
        <Brief type="h3" {...dataArray} />
      )}
      <FeedbackScreen />
      <MapScreen />
    </>
  );
}

export default TypeOfPrint;
