import React from "react";
import { useDispatch } from "react-redux";
import { Link } from "react-router-dom";
import styles from "./printing-method-price.module.css";
import { SET_POPUP_VISIBILITY } from "../../services/actions/utility-actions";

import PriceTable from "../main-page-components/price-screen-components/price-table";

const PrintingMethodPrice = (prices) => {
  const price = prices.price;
  const dispatch = useDispatch();

  const popupOpen = () => {
    dispatch({
      type: SET_POPUP_VISIBILITY,
    });
  };

  return (
    <section className={styles.screen} id="pricelistmethod">
      <h4 className={styles.heading}>
        А СКОЛЬКО <span className={styles.textStyle_italic}>СТОИТ</span> ПЕЧАТЬ?
      </h4>
      <p className={styles.description}>
        Приведена стоимость для тиражей до 10 штук. Скидки для больших тиражей
        уточняйте у наших менеджеров!
      </p>

      <div className={styles.price_table}>
        <PriceTable priceType={prices.priceType} price={price} />
      </div>

      <p className={styles.description}>
        * Стоимость не увеличивается при печати на своем текстиле 👌👌👌
      </p>

      <div className={styles.action_button_wrapper}>
        <Link to="/shop">
          <button type="button" className={styles.action_button}>
            ВЫБРАТЬ ТЕКCТИЛЬ
          </button>
        </Link>

        <button
          type="button"
          className={styles.action_button}
          onClick={popupOpen}
        >
          ЕСТЬ СВОЙ?
        </button>
      </div>
    </section>
  );
};

export default PrintingMethodPrice;
