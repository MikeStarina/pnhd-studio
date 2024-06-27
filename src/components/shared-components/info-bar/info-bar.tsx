'use client';
import React, { Suspense } from 'react';
import styles from './info-bar.module.css';
import { useSearchParams } from 'next/navigation';
import { useAppDispatch } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';



const InfoBar: React.FC = () => {
    const searchParams = useSearchParams();
    const dispatch = useAppDispatch();
    const promocode = searchParams.get('promocode');
    promocode && dispatch(cartActions.setUserPromocode(promocode));
    const text = promocode ? `Промокод ${promocode} автоматически сохранен и будет доступен при чекауте.` : '';
    //const text = '';

    return (
        <>
        <Suspense fallback={null}>
            {text &&
            
            <div className={styles.infoBar}>
                <div className={styles.infoBar_textWrapper}>
                    <p className={styles.infoBar_text}>{text}</p>
                </div>
            </div>
            }
        </Suspense>
        </>
    )
}

export default InfoBar;