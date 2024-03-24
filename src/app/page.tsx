import React from "react";
// import styles from "./page.module.css";

import MainScreen from "@/components/pages-components/main-page/main-screen/main-screen";
import PhotosScreen from "@/components/pages-components/main-page/photos-screen/photos-screen";
import PrintMethodsScreen from "@/components/pages-components/main-page/print-methods-screen/print-methods-screen";
import ShopLeadScreen from "@/components/pages-components/main-page/shop-lead-screen/shop-lead-screen";
import StagesScreen from "@/components/pages-components/main-page/stages-screen/stages-screen";
import PriceScreen from "@/components/pages-components/main-page/price-screen/price-screen";
import HowToScreen from "@/components/pages-components/main-page/howto-screen/howto-screen";
import FeedbackScreen from "@/components/pages-components/main-page/feedback-screen/feedback-screen";
import FaqScreen from "@/components/pages-components/main-page/faq-screen/faq-screen";
import MapScreen from "@/components/pages-components/main-page/map-screen/map-screen";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: 'Печать на одежде в Санкт-Петербурге на заказ от 1 штуки цена в Pinhead Studio',
  description: 'Печать на одежде на заказ от 1 штуки в Санкт-Петербурге по выгодной цене в Pinhead Studio. Сколько стоит печать на одежде смотрите онлайн на нашем сайте.',
  keywords: 'печать на футболках, санкт-петербург, недорого, на заказ, цена, от 1 шт, срочный, заказать, хороший, сделать, стоимость, доставка, быстрый, качественный, черный, оверсайз, белый, онлайн, спортивный, свой дизайн, конструктор, создать макет, нанесение, собственный, толстовка, худи, студия, услуги, каталог, а3, а4, одежда, свитшот',
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

const App: React.FC = () => {
  return (
    <>
      <MainScreen />
      <PhotosScreen />
      <PrintMethodsScreen />
      <ShopLeadScreen />
      <StagesScreen />
      <PriceScreen />
      <HowToScreen />
      <FeedbackScreen />
      <FaqScreen />
      <MapScreen />
    </>
  );
}

export default App;
