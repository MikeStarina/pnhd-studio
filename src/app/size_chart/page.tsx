import React from "react";
import styles from "./page.module.css";
import Image from "next/image";
import classicTee from "../../../public/sizeChart/tee_classic_sizes.png";
import oversizeTee from "../../../public/sizeChart/tee_oversize_sizes.png";
import freeFit from "../../../public/sizeChart/tee_freefit_sizes.png";
import standartTee from "../../../public/sizeChart/tee_standart_sizes.png";
import gildanTee from "../../../public/sizeChart/tee_gildan_sizes.png";
import promoTee from "../../../public/sizeChart/tee_promo_sizes.png";
import classicHood from "../../../public/sizeChart/hoodie_classic_sizes.png";
import Header from "@/components/shared-components/header/header";
import Footer from "@/components/shared-components/footer/footer";

const itemsArr = [
    {
        title: "Футболки CLASSIC",
        image: classicTee,
    },
    {
        title: "Футболки OVERSIZE",
        image: oversizeTee,
    },
    {
        title: "Футболки FREEFIT",
        image: freeFit,
    },
    {
        title: "Футболки BASIC STANDART",
        image: standartTee,
    },
    {
        title: "Футболки PROMO",
        image: promoTee,
    },
    {
        title: "Футболки GILDAN HAMMER",
        image: gildanTee,
    },
    {
        title: "Худи CLASSIC",
        image: classicHood,
    },
];

const SizeChartPage: React.FC<{ searchParams: {[n:string]: string}}> = ({ searchParams }) => {
    return (
        <>
        <Header searchParams={searchParams}/>
        <section className={styles.sizeChart}>
            <h1 className={styles.sizeChart_mainTitle}>РАЗМЕРЫ / SIZE CHART</h1>
            {itemsArr.map((item, index) => (
                <div className={styles.sizeChart_item} key={index}>
                    <h2 className={styles.item_title}>{item.title}</h2>
                    <Image
                        src={item.image}
                        alt="size chart classic tee"
                        className={styles.item_img}
                    />
                </div>
            ))}
        </section>
        <Footer searchParams={searchParams}/>
        </>
    );
};

export default SizeChartPage;
