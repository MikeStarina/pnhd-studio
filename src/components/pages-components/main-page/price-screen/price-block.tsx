'use client'
import React, { SyntheticEvent, useState } from 'react'
import styles from './price-block.module.css';

import { tumblers, prices } from '@/app/utils/constants';








const PriceBlock: React.FC = () => {

    const [ activeTumbler, setActiveTumbler ] = useState<string>('DTG');
    const activePriceData = prices.filter(item => item.name === activeTumbler)[0];

    return (
        <div className={styles.priceBlock}>
            <div className={styles.priceBlock_tumblers}>
                {tumblers.map((item, index) => (
                    <button
                        key={index}
                        type='button'
                        onClick={(e: SyntheticEvent<HTMLButtonElement>) => {setActiveTumbler(e.currentTarget.id)}}
                        id={item}
                        className={activeTumbler === item ? styles.priceBlock_tumbler__active : styles.priceBlock_tumbler}
                    >
                        {item}
                    </button>
                ))}
            </div>
            <div className={styles.priceBlock_tableHeader}>
                <p className={styles.tableHeader_text}>Формат</p>
                <p className={styles.tableHeader_text}>{activeTumbler === 'DTG' ? 'На белом / цветном' : 'Стоимость' }</p>
            </div>

            <div className={styles.priceBlock_table}>
                {activePriceData.prices.map((item, index) => (
                    <div className={styles.table_tableRow} key={index}>
                        <p className={styles.tableRow_format}>{item.format}</p>
                        <p className={styles.tableRow_price}>{item.price}</p>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default PriceBlock;