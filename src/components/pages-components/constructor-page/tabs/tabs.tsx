'use client'
import React, { SyntheticEvent } from 'react';
import styles from './tabs.module.css';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import { actions as constructorActions } from '@/redux/constructor-slice/constructor.slice';
import { ICartOrderElement } from '@/app/utils/types';



const Tabs: React.FC<{ orderElement: ICartOrderElement}> = ({ orderElement }) => {

    const { activeView } = useAppSelector(store => store.printConstructor);
    const dispatch = useAppDispatch();

    const setActiveView = (e: SyntheticEvent<HTMLButtonElement>) => {
        dispatch(constructorActions.setActiveView(e.currentTarget.id));
    }

    return (
        <div className={styles.tabs_container}>
            <button
              type="button"
              className={
                activeView === 'front' ? styles.active_tab : styles.tab
              }
              id="front"
              onClick={setActiveView}
            >
              Грудь
            </button>
            <button
              type="button"
              className={activeView === 'back' ? styles.active_tab : styles.tab}
              id="back"
              onClick={setActiveView}
            >
              Спина
            </button>
            {orderElement.item!.type !== 'totebag' && (
              <button
                className={
                  activeView === 'lsleeve' ? styles.active_tab : styles.tab
                }
                id="lsleeve"
                onClick={setActiveView}
                type="button"
              >
                Левый&nbsp;рукав
              </button>
            )}
            {orderElement.item.type !== 'totebag' && (
              <button
                className={
                  activeView === 'rsleeve' ? styles.active_tab : styles.tab
                }
                id="rsleeve"
                onClick={setActiveView}
                type="button"
              >
                Правый&nbsp;рукав
              </button>
            )}
          </div>
    )
}

export default Tabs;