import { useEffect } from "react";
import React from "react";
import { useDispatch } from "react-redux";
import { CLOSE_MODAL_MENU } from "../../services/actions/utility-actions.jsx";
import styles from './shop-page.module.css';

import FiltersBlock from "../../components/shop-page-components/filters-block.jsx";
import CardsBlock from "../../components/shop-page-components/cards-block.jsx";


const ShopPage = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({
            type: CLOSE_MODAL_MENU,
        })    
    }, [dispatch])



    return (
        <main className={styles.main_screen}>
            <FiltersBlock />
            <CardsBlock />
        </main>
    )
}

export default ShopPage;