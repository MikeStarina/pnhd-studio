import React from "react";
import styles from './page.module.css';
import PrintMethodsScreen from "@/components/pages-components/main-page/print-methods-screen/print-methods-screen";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";





const Page: React.FC<{ searchParams: {[n:string]: string }}> = async ({ searchParams}) => {

    return (
        <>
        <Header searchParams={searchParams}/>
        <PrintMethodsScreen />
        <Footer searchParams={searchParams}/>
        </>
    )

}

export default Page;