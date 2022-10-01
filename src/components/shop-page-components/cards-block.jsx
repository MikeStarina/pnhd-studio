import React from "react";
import styles from './cards-block.module.css';
import CardItem from "./card-item.jsx";



const CardsBlock = () => {

    return (
        <section className={styles.screen}>
            <CardItem />
        </section>
    );
}

export default CardsBlock;