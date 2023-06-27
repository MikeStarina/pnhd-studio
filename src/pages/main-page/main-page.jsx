import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { CLOSE_MODAL_MENU } from "../../services/actions/utility-actions.jsx";
import styles from "./main-page.module.css";
import { Helmet } from "react-helmet";
import FirstScreen from "../../components/main-page-components/first-screen.jsx";
import FaqScreen from "../../components/main-page-components/faq-screen.jsx";
import ThirdScreen from "../../components/main-page-components/third-screen.jsx";
import CaseGallery from "../../components/main-page-components/case-gallery.jsx";
import ConstructorScreen from "../../components/main-page-components/constructor-screen.jsx";
import MethodsGallery from "../../components/main-page-components/methods-gallery.jsx";
import ShopGallery from "../../components/main-page-components/shop-gallery.jsx";
import PriceScreen from "../../components/main-page-components/price-screen.jsx";
import FeedbackScreen from "../../components/main-page-components/feedback-screen.jsx";
import MapScreen from "../../components/main-page-components/map-screen.jsx";
import Accordion from "../../components/accordion/accordion.jsx";


const MainPage = () => {

  const dispatch = useDispatch();

  useEffect(() => {
      dispatch({
          type: CLOSE_MODAL_MENU,
      })    
  }, [dispatch])




  return (
    <main className={styles.main_page}>
       <Helmet
                title='Печать на футболках заказать в Санкт-Петербурге цена от 1 штуки в Studio Pinhead'
                meta={[
                  {
                    name: 'description',
                    content: 'Заказать печать на футболке в Санкт-Петербурге онлайн с доставкой можно по выгодной цене в нашей студии. Печать на футболках на заказ от 1 штуки недорого от Studio Pinhead.',
                  },
                  {
                    name: 'keywords',
                    content: 'печать на футболках, санкт-петербург, недорого, на заказ, цена, от 1 шт, срочный, заказать, хороший, сделать, стоимость, доставка, быстрый, качественный, черный, оверсайз, белый, онлайн, спортивный, свой дизайн, конструктор, создать макет, нанесение, собственный, толстовка, худи, студия, услуги, каталог, а3, а4, одежда, свитшот',
                  },
                ]}
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


        />
      <FirstScreen />
      <FaqScreen />
      <ThirdScreen />
      <CaseGallery />
      <ConstructorScreen />
      <MethodsGallery />
      <ShopGallery />
      <PriceScreen />
      <FeedbackScreen />
      <Accordion/>
      {/*<FormScreen />*/}
      <MapScreen />
    </main>
  );
};

export default MainPage;
