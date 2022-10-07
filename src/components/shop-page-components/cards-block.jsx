import React from "react";
import styles from './cards-block.module.css';
import CardItem from "./card-item.jsx";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";



const CardsBlock = () => {

    const { data } = useSelector(store => store.shopData);
 

    return (
        <section className={styles.screen}>
            
            {data && data.map((item) => {
                return (
                <Link to={{ pathname: `/shop/${item.id}`}} className={styles.link} key={item.id}>
                    <CardItem key={item.id} title={item.attributes.name} price={item.attributes.price} img={item.attributes.image_url} />
                </Link>
            )}
            )}
           
        </section>
    );
}

export default CardsBlock;