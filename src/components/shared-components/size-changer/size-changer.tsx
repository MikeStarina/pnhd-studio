"use client";
import React, { SyntheticEvent, useEffect } from "react";
import styles from "./size-changer.module.css";
import { IProduct } from "@/app/utils/types";
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import { actions as ustilActions } from "@/redux/utils-slice/utils.slice";
import Image from "next/image";
import rightArrow from "../../../../public/button_arrow_right.svg";
import leftArrow from "../../../../public/button_arrow_left.svg";
import { usePathname } from "next/navigation";

const SizeChanger: React.FC<{ item: IProduct }> = ({ item }) => {
    //console.log(item);
    const pathname = usePathname();
    const currentItem = {...item};
    //console.log(currentItem);
    const { sizes: itemSizes } = currentItem;
    const dispatch = useAppDispatch();
    const { sizes } = useAppSelector((store) => store.utils);
    useEffect(() => {
        let stateSizes = itemSizes.map((item) => {
            
                return {
                    name: item.name,
                    qty: item.qty,
                    userQty: 0,
                };
            
        });
        //console.log(stateSizes);
        dispatch(ustilActions.setInitialSizes(stateSizes));
        return () => {
            //console.log('destructed');
            dispatch(ustilActions.resetStateSizes());
        }; 
    }, []);

    const sizeControlButtonClickHandler = (
        e: SyntheticEvent<HTMLButtonElement>
    ) => { 
        
        const { id, name } = e.currentTarget;
        dispatch(ustilActions.updateSizes({ id, name }))

    };

    return (
        <div className={pathname === '/cart' ? styles.sizeChanger__cart : styles.sizeChanger}>
            {sizes?.map((item, index) => {
                return (
                    <div
                        className={styles.sizeChanger_wrapper}
                        key={index}
                        id={item.name}
                    >
                        <div className={styles.size_contolsWrapper}>
                            <div className={styles.size_titleWrapper}>
                                <p className={styles.size_title}>{item.name}</p>
                                <p className={styles.size_qty}>
                                    &nbsp;{"x "}
                                    {item.userQty}
                                </p>
                            </div>
                            
                            <button
                                type="button"
                                className={styles.size_controlButton}
                                name={item.name}
                                id="decrease"
                                onClick={sizeControlButtonClickHandler}
                            >
                                <Image src={leftArrow} alt="стрелка влево" />
                            </button>
                            <button
                                type="button"
                                className={styles.size_controlButton}
                                name={item.name}
                                id="increase"
                                onClick={sizeControlButtonClickHandler}
                            >
                                <Image src={rightArrow} alt="стрелка вправо" />
                            </button>
                        </div>
                        <div className={styles.size_stockWrapper}>
                            <p className={styles.size_stock}>{`(${item.qty} шт.)`}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default SizeChanger;
