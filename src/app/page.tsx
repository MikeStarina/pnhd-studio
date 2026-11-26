import React from 'react';
import { Metadata } from 'next';
import MarkupScript from '@/components/shared-components/markup-script/markup-script';
import { LocalBusinessJsonLD, ServiceJsonLD, WebPageJsonLD } from '@/app/utils/markups';
import Hero from '@/components/home/hero/hero';
import SeoIntro from '@/components/home/seo-intro/seo-intro';
import ConstructorPromo from '@/components/home/constructor-promo/constructor-promo';
import CatalogPreview from '@/components/home/catalog-preview/catalog-preview';
import PrintMethods from '@/components/home/print-methods/print-methods';
import PriceEstimate from '@/components/home/price-estimate/price-estimate';
import Delivery from '@/components/home/delivery/delivery';
import Business from '@/components/home/business/business';
import Reviews from '@/components/home/reviews/reviews';
import Faq from '@/components/home/faq/faq';
import About from '@/components/home/about/about';
import Marquee from '@/components/home/marquee/marquee';
import SheetCut from '@/components/home/sheet-cut/sheet-cut';
import SectionSnap from '@/components/site/smooth-scroll/section-snap';

const callLine = ['Закажи мерч', 'С любым принтом', 'Пинхэд'];

export const metadata: Metadata = {
  title: 'Печать на одежде в Санкт-Петербурге на заказ от 1 штуки цена в Pinhead Studio',
  description:
    'Печать на одежде на заказ от 1 штуки в Санкт-Петербурге по выгодной цене в Pinhead Studio. Сколько стоит печать на одежде смотри онлайн на нашем сайте.',
  keywords:
    'печать на футболках, санкт-петербург, недорого, на заказ, цена, от 1 шт, срочный, заказать, хороший, сделать, стоимость, доставка, быстрый, качественный, черный, оверсайз, белый, онлайн, спортивный, свой дизайн, конструктор, создать макет, нанесение, собственный, толстовка, худи, студия, услуги, каталог, а3, а4, одежда, свитшот',
  metadataBase: new URL('https://studio.pnhd.ru'),
  alternates: { canonical: '/' },
  openGraph: { type: 'website', title: 'PNHD STUDIO | Главная', images: '/opengraph-image.jpg' },
};

const HomePage: React.FC = () => (
  <div data-layout="wide" data-section-snap>
    <SectionSnap strong="studio" />
    <Hero />
    <SeoIntro />
    <ConstructorPromo />
    <CatalogPreview />
    <SheetCut index={0} />
    <PrintMethods />
    <SheetCut index={1} />
    <PriceEstimate />
    <SheetCut index={2} />
    <Delivery />
    <SheetCut index={3} />
    <Reviews />
    <Business />
    <Faq />
    <About />
    <Marquee items={callLine} tone="lime" label="Призыв" />
    <MarkupScript jsonLd={LocalBusinessJsonLD} />
    <MarkupScript jsonLd={WebPageJsonLD} />
    <MarkupScript jsonLd={ServiceJsonLD} />
  </div>
);

export default HomePage;
