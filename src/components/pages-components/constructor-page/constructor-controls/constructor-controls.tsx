'use client'
import React from 'react';
import styles from './constructor-controls.module.css';
import Tabs from '../tabs/tabs';
import FileUploader from '../file-uploader/file-uploader';
import { ICartOrderElement } from '@/app/utils/types';
import OrderInfo from '../order-info/order-info';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { splitString } from '@/app/utils/constants';



const Controls: React.FC<{ orderElement: ICartOrderElement}> = ({ orderElement }) => {
    const params = splitString(useSearchParams().toString());

    return (
        <div className={styles.controls_container}>
            <Tabs orderElement={orderElement} />
            <FileUploader orderElement={orderElement} />
            <OrderInfo orderElement={orderElement} />

            <Link href={{pathname: '/cart', query: {...params}}} style={{ alignSelf: 'flex-end', marginTop: '50px'}}>
                <button
                    type='button'
                    className={styles.controls_cartButton}
                >
                    в корзину
                </button>
            </Link>
        </div>
    )
}

export default Controls;