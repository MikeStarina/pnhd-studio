import { useEffect } from "react";
import React from "react";
import { Helmet } from "react-helmet";
import { SET_FILTER } from '../../services/actions/shop-data-actions';
import { useDispatch, useSelector } from "react-redux";
import { CLOSE_MODAL_MENU } from "../../services/actions/utility-actions.jsx";
import styles from './shop-page.module.css';
import { useHistory, useLocation } from "react-router-dom";
import CardsBlock from "../../components/shop-page-components/cards-block.jsx";


const ShopPage = () => {

    const dispatch = useDispatch();
    const { filter } = useSelector((store) => store.shopData);
    const { search } = useLocation();
    const history = useHistory();
    const searchValue = search.slice(3);
  

    const filterHandler = (e) => {
        
        if (e.target.value) {
            dispatch({
                type: SET_FILTER,
                payload: e.target.value,
            })
            history.push(`/shop?s=${e.target.value}`);
        } else {
            dispatch({
                type: SET_FILTER,
                payload: e.target.value,
            })
            history.push(`/shop`);
        }
    }

    useEffect(() => {
        dispatch({
            type: SET_FILTER,
            payload: searchValue,
        })
    }, [dispatch])

    useEffect(() => {
        dispatch({
            type: CLOSE_MODAL_MENU,
        })    
    }, [])



    return (
        <main className={styles.main_screen}>
            <Helmet
                title='PINHEAD STUDIO | Печать на футболках и толстовках | Магазин и конструктор'
                script = {[
                    { 
                    type: "application/ld+json",
                    innerHTML:
                        `{
                            "@context": "https://schema.org",
                            "@type": "Organization",
                            "url": "https://studio.pnhd.ru",
                            "logo": "/icon_logo.svg",
                            "address": {
                                "@type": "PostalAddress",
                                "streetAddress": "ул. Чапыгина 1",
                                "addressLocality": "Санкт-Петербург",
                                "addressRegion": "RU",
                                "postalCode": "197022",
                                "addressCountry": "RU"
                            },
                            "contactPoint" : [
                            {
                            "@type" : "ContactPoint",
                            "telephone" : "+78129046156",
                            "contactType" : "студия"
                            }
                            ],
                            "sameAs": [
                              'https://vk.com/pinheadspb',
                              'https://instagram.com/pnhd.studio'
                            ]
                        }
                        }
                        }`
                    }
                    
                ]}


            />
             <div className={styles.filter_wrapper}>
            
                <button type='button' className={filter === 'man' ? styles.filter_active : styles.filter} value='man' onClick={filterHandler}>МУЖСКОЕ</button>
                <button type='button' className={filter === 'woman' ? styles.filter_active : styles.filter} value='woman' onClick={filterHandler}>ЖЕНСКОЕ</button>
                <button type='button' className={filter === 'kids' ? styles.filter_active : styles.filter} value='kids' onClick={filterHandler}>ДЕТСКОЕ</button>
                <button type='button' className={filter === 'accesorize' ? styles.filter_active : styles.filter} value='accesorize' onClick={filterHandler}>АКСЕССУАРЫ</button>
                <button type='button' className={filter === 'friends' ? styles.filter_active : styles.filter} value='friends' onClick={filterHandler}>PNHD&nbsp;&&nbsp;FRIENDS</button>
                <button type='button' className={styles.filter} value='' onClick={filterHandler}>СБРОСИТЬ</button>
               

            </div>
            <CardsBlock />
        </main>
    )
}

export default ShopPage;