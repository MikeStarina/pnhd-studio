import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { Helmet } from 'react-helmet';
import { CLOSE_MODAL_MENU } from '../../services/actions/utility-actions';
import styles from './main-page.module.css';
import FirstScreen from '../../components/main-page-components/first-screen';
import FaqScreen from '../../components/main-page-components/faq-screen';
import ThirdScreen from '../../components/main-page-components/third-screen';
import CaseGallery from '../../components/main-page-components/case-gallery';
import ConstructorScreen from '../../components/main-page-components/constructor-screen';
import MethodsGallery from '../../components/main-page-components/methods-gallery';
import ShopGallery from '../../components/main-page-components/shop-gallery';
import PriceScreen from '../../components/main-page-components/price-screen';
import FeedbackScreen from '../../components/main-page-components/feedback-screen';
import MapScreen from '../../components/main-page-components/map-screen';
import Accordion from '../../components/accordion/accordion';
import shopGalleryData from '../../data/shop-gallery-data/shop-gallery-data';

function MainPage() {
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch({
      type: CLOSE_MODAL_MENU,
    });
  }, [dispatch]);

  return (
    <main className={styles.main_page}>
      <Helmet
        title="Печать на футболках заказать в Санкт-Петербурге цена от 1 штуки в Studio Pinhead"
        meta={[
          {
            name: 'yandex-verification',
            content: 'ea65d19e93bf5159',
          },
          {
            name: 'description',
            content:
              'Заказать печать на футболке в Санкт-Петербурге онлайн с доставкой можно по выгодной цене в нашей студии. Печать на футболках на заказ от 1 штуки недорого от Studio Pinhead.',
          },
          {
            name: 'keywords',
            content:
              'печать на футболках, санкт-петербург, недорого, на заказ, цена, от 1 шт, срочный, заказать, хороший, сделать, стоимость, доставка, быстрый, качественный, черный, оверсайз, белый, онлайн, спортивный, свой дизайн, конструктор, создать макет, нанесение, собственный, толстовка, худи, студия, услуги, каталог, а3, а4, одежда, свитшот',
          },
          {
            property: 'og:image',
            content:
              'https://sun9-77.userapi.com/impg/r3SRF7rtra4wl-3EmEgVqIRaaGNbjeO6q9ufUw/-yeDgKpu2CQ.jpg?size=500x500&quality=95&sign=d7fc90ef8c432358c10c8b1e16b4945f&type=album',
          },
          {
            property: 'og:title',
            content:
              'Печать на футболках заказать в Санкт-Петербурге цена от 1 штуки в Studio Pinhead',
          },
          {
            property: 'og:url',
            content: 'https://studio.pnhd.ru/',
          },
          {
            property: 'og:type',
            content: 'website',
          },
        ]}
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
      <FirstScreen />
      <FaqScreen />
      <ThirdScreen />
      <CaseGallery />
      <ConstructorScreen />
      <MethodsGallery />
      <ShopGallery data={shopGalleryData.mainPage} />
      <PriceScreen />
      <FeedbackScreen />
      <Accordion />
      {/* <FormScreen /> */}
      <MapScreen />
    </main>
  );
}

export default MainPage;
