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

    const teesArr = filteredData.filter(item => item.type === 'tshirt');
    const hoodiesArr = filteredData.filter(item => item.type === 'hoodie');
    const accesorizeArr = filteredData.filter(item => item.category === 'accesorize');
    const friendsArr = filteredData.filter(item => item.category === 'friends');

    
 

    return (
        <section className={styles.screen}>
            
            {/* filteredData && filteredData.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
                ) */}
            {teesArr && teesArr.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )}
            {hoodiesArr && hoodiesArr.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 1}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )}
             {friendsArr && friendsArr.map((item, index) => {


                    const url = `${apiBaseUrl}${item.image_url}`
                    return (
                    <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 3}>
                        <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                    </Link>
            )}
            )}
            {accesorizeArr && accesorizeArr.map((item, index) => {


                const url = `${apiBaseUrl}${item.image_url}`
                return (
                <Link to={{ pathname: `/shop/${item._id}`}} className={styles.link} key={index + 2}>
                    <CardItem title={item.name} price={item.price} img={url} sizes={item.sizes} />
                </Link>
            )}
            )}
           
           
        </section>
    );
}

export default CardsBlock;