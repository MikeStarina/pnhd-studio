import React from 'react';
import { Helmet } from 'react-helmet';
import styles from './type-of-print.module.css';
import PrintingFirstScreen from '../../components/printingFirstScreen/printingFirstScreen';
import FeedbackScreen from '../../components/main-page-components/feedback-screen';
import MapScreen from '../../components/main-page-components/map-screen';
import Brief from '../../components/brief/brief';
import PrintingGallery from '../../components/printing-gallery/printing-gallery';
import PrintingFaq from '../../components/printing-faq/printing-faq';

function TypeOfPrint(props) {
  const info = props.method;
  const { description } = info.faq;
  const faqProps = info.faq;
  // Для компонента Gallery, масив фотографий
  const galleryProps = info.images.gallery;
  // Для первого компанента Brief, без масива subtitle
  const data = {
    title: props.method.main_heading,
    subtitle: props.method.brief_subtitle,
  };
    // Для второго компанента Brief, с масивом subtitle
  const dataArray = {
    title: props.method.faq.title,
    subtitle: props.method.faq.subtitle,
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
      <Brief {...data} />
      <PrintingGallery gallery={galleryProps} />
      {description ? (
        <PrintingFaq {...faqProps} />
      ) : (
        <Brief {...dataArray} />
      )}
      <FeedbackScreen />
      <MapScreen />
    </>
  );
}

export default TypeOfPrint;
