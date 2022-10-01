import { useEffect } from "react";
import React from "react";
import { useDispatch } from "react-redux";
import { CLOSE_MODAL_MENU } from "../../services/actions/utility-actions.jsx";
//import styles from './shop-page.module.css';


const ShopPage = () => {

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch({
            type: CLOSE_MODAL_MENU,
        })    
    }, [dispatch])



    return (
        <main>
            <h1>Shop page</h1>
        </main>
    )
}

export default ShopPage;