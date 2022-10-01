import React from "react";
import styles from "./main-page.module.css";

import FirstScreen from "../../components/main-page-components/first-screen.jsx";
import FaqScreen from "../../components/main-page-components/faq-screen.jsx";
import ThirdScreen from "../../components/main-page-components/third-screen.jsx";
import CaseGallery from "../../components/main-page-components/case-gallery.jsx";
import ConstructorScreen from "../../components/main-page-components/constructor-screen.jsx";
import MethodsGallery from "../../components/main-page-components/methods-gallery.jsx";
import ShopGallery from "../../components/main-page-components/shop-gallery.jsx";
import PriceScreen from "../../components/main-page-components/price-screen.jsx";
import FeedbackScreen from "../../components/main-page-components/feedback-screen.jsx";
import FormScreen from "../../components/main-page-components/form-screen.jsx";
import MapScreen from "../../components/main-page-components/map-screen.jsx";
import Footer from "../../components/footer/footer.jsx";


const MainPage = () => {
  return (
    <main className={styles.main_page}>
      <FirstScreen />
      <FaqScreen />
      <ThirdScreen />
      <CaseGallery />
      <ConstructorScreen />
      <MethodsGallery />
      <ShopGallery />
      <PriceScreen />
      <FeedbackScreen />
      <FormScreen />
      <MapScreen />
      <Footer />
    </main>
  );
};

export default MainPage;
