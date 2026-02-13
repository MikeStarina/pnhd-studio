import React from "react";
import styles from './catalogLeadScreen.module.css';
import Image from "next/image";
import tshirt from './assets/tshirt.png'
import sweatshirt from './assets/sweatshirt.png'
import hoodie from './assets/hoodie.png'
import totebag from './assets/tote.png'
import cap from './assets/hat.png'
import pullover from './assets/pullover.png'
import Link from "next/link";



const config = [
    {
        title: '> Футболки',
        bgColor: '#F3F4F3',
        image: tshirt,
        color: 'black',
        query: '?type=tshirt'
    },
    {
        title: '> Свитшоты',
        bgColor: '#393939',
        image: sweatshirt,
        color: 'white',
        query: '?type=sweatshirt',
    },
    {
        title: '> Толстовки',
        bgColor: '#F3F4F3',
        image: pullover,
        color: 'black',
        query: '?type=hoodie'
    },
    {
        title: '> Худи',
        bgColor: '#393939',
        image: hoodie,
        color: 'white',
        query: '?type=hoodie'
    },
    {
        title: '> Шопперы',
        bgColor: '#F3F4F3',
        image: totebag,
        color: 'black',
        query: '?type=totebag'
    },
    {
        title: '> Кепки',
        bgColor: '#393939',
        image: cap,
        color: 'white',
        query: '?type=cap'
    },
]


const CatalogLeadScreen: React.FC = () => {
    return (
        <section className={styles.catalogLeadScreen}>
            <header className={styles.catalogLeadScreen__header}>
                <h2 className={styles.catalogLeadScreen__title}>Каталог одежды</h2>
                <p className={styles.catalogLeadScreen__subtitle}>отражай индивидуальность в мерче</p>
            </header>
            <div className={styles.catalogLeadScreen__content}>
                {config.map((item, index) => (
                    <div key={index} className={styles.catalogLeadScreen__item} style={{ backgroundColor: item.bgColor }}>
                        <Link href={`/shop${item.query}`} className={styles.catalogLeadScreen__itemTitle} style={{ color: item.color }}>{item.title}</Link>
                        <div className={styles.catalogLeadScreen__itemImageWrapper}>
                            <Image src={item.image} alt={item.title} className={styles.catalogLeadScreen__itemImageWrapper_image} />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

export default CatalogLeadScreen;