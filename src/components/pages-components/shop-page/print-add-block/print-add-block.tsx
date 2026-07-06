'use client';
import React, { useState } from 'react';
import { IProduct } from '@/app/utils/types';
import styles from './print-add-block.module.css'


const TABS = [
    { id: 'noPrint', name: 'Без принта' },
    { id: 'front', name: 'На груди' },
    { id: 'back', name: 'На спине' },
    { id: 'lsleeve', name: 'Левый рукав' },
    { id: 'rsleeve', name: 'Правый рукав' },
]

export const PrintAddBlock: React.FC<{ item: IProduct }> = ({ item }) => {
    const [tabState, setTabState] = useState<'noPrint' | 'front' | 'back' | 'lsleeve' | 'rsleeve'>('noPrint');
    return (
        <div className={styles.block}>
            <span>Принт</span>
            <div className={styles.tabs}>
                {TABS.map((tab) => {
                    const isActive = tabState === tab.id;
                    return (
                        <button key={tab.id} className={isActive ? `${styles.tab} ${styles.tab_active}` : styles.tab} onClick={() => setTabState(tab.id as 'noPrint' | 'front' | 'back' | 'lsleeve' | 'rsleeve')}>
                            {tab.name}
                        </button>
                    )
                })}
            </div>
            <div className={styles.block__uploader}>
                
            </div>
        </div>
    );
};