import React from "react";
import styles from './price-screen.module.css';
import { useSelector, useDispatch } from "react-redux";
import { SET_ACTIVE_PRICE_TABLE } from "../../services/actions/utility-actions";
import PriceTable from "./price-screen-components/price-table.jsx";


const price = {
    dtg: {
        onWhite: {
            A6: 300,
            A5: 400,
            A4: 500,
            A3: 650,
            A33: 750,
        },
        onColored: {
            A6: 400,
            A5: 500,
            A4: 650,
            A3: 750,
            A33: 900,
        }
    },
    dtf: {
        A6: 400,
        A5: 500,
        A4: 650,
        A3: 750,
        A33: 900,
    },
    hTransfer: {
        A6: 400,
        A5: 500,
        A4: 650,
        A3: 750,
        A33: 900,
    },
    emb: {
        A6: 900,
        A5: 1100,
        A4: 1600,
        A3: 2100,
    }
}



const PriceScreen = () => {


    const { mainMenuPriceTable } = useSelector(store => store.utilityState);
    const dispatch = useDispatch();


    const setActiveTab = (e) => {
        
        dispatch({
            type: SET_ACTIVE_PRICE_TABLE,
            payload: e.target.textContent
        })
    }


    return (
        <section className={styles.screen}>
            <h4 className={styles.heading}>А СКОЛЬКО <span className={styles.textStyle_italic}>СТОИТ</span> ПЕЧАТЬ?</h4>
            <p className={styles.description}>
                Приведена стоимость для тиражей до 10 штук. Скидки для больших тиражей уточняйте у наших менеджеров!
            </p>

            <div className={styles.button_wrapper}>
                <button type='button' className={mainMenuPriceTable.activeTab === 'DTG' ? styles.button_active : styles.button} onClick={setActiveTab}>DTG</button>
                <button type='button' className={mainMenuPriceTable.activeTab === 'DTF' ? styles.button_active : styles.button} onClick={setActiveTab}>DTF</button>
                <button type='button' className={mainMenuPriceTable.activeTab === 'ТЕРМОПЕРЕНОС' ? styles.button_active : styles.button} onClick={setActiveTab}>ТЕРМОПЕРЕНОС</button>
                <button type='button' className={mainMenuPriceTable.activeTab === 'ВЫШИВКА' ? styles.button_active : styles.button} onClick={setActiveTab}>ВЫШИВКА</button>
            </div>

            <div className={styles.price_table}>
               {mainMenuPriceTable.activeTab === 'DTG' && <PriceTable priceType={mainMenuPriceTable.activeTab} price={price.dtg}/>}
               {mainMenuPriceTable.activeTab === 'DTF' && <PriceTable priceType={mainMenuPriceTable.activeTab} price={price.dtf}/>}
               {mainMenuPriceTable.activeTab === 'ТЕРМОПЕРЕНОС' && <PriceTable priceType={mainMenuPriceTable.activeTab} price={price.hTransfer}/>}
               {mainMenuPriceTable.activeTab === 'ВЫШИВКА' && <PriceTable priceType={mainMenuPriceTable.activeTab} price={price.emb}/>}
            </div>



            <a href='#contacts'>
                <button type='button' className={styles.action_button}>ЗАКАЗАТЬ</button>
            </a>
            
        </section>
    );
}

export default PriceScreen;