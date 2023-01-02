import React from "react";
import styles from './cards-block.module.css';
import CardItem from "./card-item.jsx";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { apiBaseUrl } from "../../utils/constants";



const CardsBlock = () => {

    const { data, filter } = useSelector(store => store.shopData);
    let filteredData = [];

    if (filter) {
        filteredData = data.filter(item => item.attributes.category === filter)
    } else {
        filteredData = data;
    }

    
 

    return (
        <section className={styles.screen}>
            
            {filteredData && filteredData.map((item) => {


                const url = `${apiBaseUrl}${item.attributes.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item.id}`}} className={styles.link} key={item.id}>
                    <CardItem key={item.id} title={item.attributes.name} price={item.attributes.price} img={url} />
                </Link>
            )}
            )}
           
        </section>
    );
}

export default CardsBlock;