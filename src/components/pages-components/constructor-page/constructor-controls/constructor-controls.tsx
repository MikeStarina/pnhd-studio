'use client'
import React from 'react';
import styles from './constructor-controls.module.css';
import Tabs from '../tabs/tabs';
import FileUploader from '../file-uploader/file-uploader';
import { ICartOrderElement } from '@/app/utils/types';
import OrderInfo from '../order-info/order-info';
import Link from 'next/link';
import { useAppSelector } from '@/redux/redux-hooks';
import { actions as constructorActions } from '@/redux/constructor-slice/constructor.slice';
import { useAppDispatch } from '@/redux/redux-hooks';



const Controls: React.FC<{ itemCartId: any}> = ({ itemCartId }) => {
    const { order } = useAppSelector((store) => store.cart);
    const orderElement = order?.filter((item) => item.itemCartId === itemCartId)[0];
    const dispatch = useAppDispatch();

    const clickHandler = () => {
        dispatch(constructorActions.setActiveView('front'));
    }

    return (
        <>
        {orderElement && 
            <>
            <div className={styles.controls_container}>
        
            <Tabs orderElement={orderElement} />
            <FileUploader orderElement={orderElement} />
            <div style={{width: '100%', display: 'flex', justifyContent: 'flex-end', margin: '10px 0 0 0'}}>
                <Link className={styles.link} href='/howto' target='blank'>Как использовать конструктор ?</Link>
            </div>
            <OrderInfo orderElement={orderElement} />

            <Link href='/cart' style={{ alignSelf: 'flex-end', marginTop: '50px'}} onClick={clickHandler}>
                <button
                    type='button'
                    className={styles.controls_cartButton}
                >
                    в корзину
                </button>
            </Link>
        </div>
        </>
    }
    </>
    )
}

export default Controls;