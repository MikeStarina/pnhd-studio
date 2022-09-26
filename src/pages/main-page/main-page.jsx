import React from "react";
import styles from "./main-page.module.css";

import FirstScreen from "../../components/main-page-components/first-screen.jsx";
import FaqScreen from "../../components/main-page-components/faq-screen.jsx";
import ThirdScreen from "../../components/main-page-components/third-screen.jsx";
import CaseGallery from "../../components/main-page-components/case-gallery.jsx";
import ConstructorScreen from "../../components/main-page-components/constructor-screen.jsx";
import MethodsGallery from "../../components/main-page-components/methods-gallery.jsx";





const MainPage = () => {
  return (
    <main className={styles.main_page}>
      <FirstScreen />
      <FaqScreen />
      <ThirdScreen />
      <CaseGallery />
      <ConstructorScreen />
      <MethodsGallery />
    </main>
  );
};

export default MainPage;
