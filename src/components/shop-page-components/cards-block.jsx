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
        filteredData = data.filter(item => item.category === filter)
    } else {
        filteredData = data;
    }

    
 

    return (
        <section className={styles.screen}>
            
            {filteredData && filteredData.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )}
           
        </section>
    );
}

export default CardsBlock;