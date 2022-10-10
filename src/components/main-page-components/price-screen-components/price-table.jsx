import React from "react";
import styles from './price-table.module.css';



const PriceTable = ({priceType, price}) => {




    return (
        <>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ ПЕЧАТИ</p>
                    <p className={styles.row_heading}>{priceType === 'DTG' ? 'НА БЕЛОМ / ЦВЕТНОМ' : 'СТОИМОСТЬ'}</p>
                    
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А6</p>
                    <p className={styles.row_heading}>{priceType === 'DTG' ? `${price.onWhite.A6} P. / ${price.onColored.A6} P.` : `${price.A6} P.`}</p>
                    
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А5</p>
                    <p className={styles.row_heading}>{priceType === 'DTG' ? `${price.onWhite.A5} P. / ${price.onColored.A5} P.` : `${price.A5} P.`}</p>
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А4</p>
                    <p className={styles.row_heading}>{priceType === 'DTG' ? `${price.onWhite.A4} P. / ${price.onColored.A4} P.` : `${price.A4} P.`}</p>
                </div>
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А3</p>
                    <p className={styles.row_heading}>{priceType === 'DTG' ? `${price.onWhite.A3} P. / ${price.onColored.A3} P.` : `${price.A3} P.`}</p>
                </div>
                {priceType !== 'ВЫШИВКА' &&
                <div className={styles.table_row}>
                    <p className={styles.row_heading}>ФОРМАТ А3+</p>
                    <p className={styles.row_heading}>{priceType === 'DTG' ? `${price.onWhite.A33} P. / ${price.onColored.A33} P.` : `${price.A33} P.`}</p>
                </div>
                }
        </>
    );
}

export default PriceTable;