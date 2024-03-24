'use client'
import React, { useState } from 'react';
import styles from './faq-card.module.css'

import Image from 'next/image';
import arrow from '../../../../../public/button_arrow.svg'
import arrow_active from '../../../../../public/button_arrow_right.svg'



const FaqCard: React.FC<{ item: {title: string, text: string}}> = ({ item }) => {

    const [ isCardActive, setisCardActive ] = useState(false);

    return (
        <div 
            className={isCardActive ? styles.card__active : styles.card}
        >
            <div className={styles.card_textWrapper}>
                <h4 className={styles.card_title}>{item.title}</h4>
                {isCardActive &&
                    <p className={styles.card_text}>{item.text}</p>
                }
            </div>
            <button
                type='button'
                onClick={() => setisCardActive(!isCardActive)}
                className={isCardActive ? styles.card_button__active : styles.card_button}
            >
                {isCardActive ? 
                    (<Image src={arrow_active} alt='стрелка вправо' />)
                    :
                    (<Image src={arrow} alt='стрелка вправо вверх' />)
                }
            </button>
        </div>
    )
}

export default FaqCard;