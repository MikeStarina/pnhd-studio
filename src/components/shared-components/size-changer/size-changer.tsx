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


const getSizeOrder = (sizes: Array<{ name: string, qty: number, userQty: number }>) => {
    // Базовый порядок известных размеров
    const knownSizeOrder = ['XXXS', 'XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', 'XXXXXL', 'XXXXXXL'];

    return sizes.sort((a, b) => {
        const aIndex = knownSizeOrder.indexOf(a.name);
        const bIndex = knownSizeOrder.indexOf(b.name);

        // Если оба размера известны, сортируем по их позиции
        if (aIndex !== -1 && bIndex !== -1) {
            return aIndex - bIndex;
        }

        // Если только один размер известен, он идет первым
        if (aIndex !== -1 && bIndex === -1) {
            return -1;
        }
        if (aIndex === -1 && bIndex !== -1) {
            return 1;
        }

        // Если оба размера неизвестны, сортируем алфавитно
        return a.name.localeCompare(b.name);
    });
}



const SizeChanger: React.FC<{ item: IProduct }> = ({ item }) => {
    const pathname = usePathname();
    const currentItem = { ...item };
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
        dispatch(ustilActions.setInitialSizes(stateSizes));
        return () => {
            dispatch(ustilActions.resetStateSizes());
        };
    }, []);

    const sizeControlButtonClickHandler = (
        e: SyntheticEvent<HTMLButtonElement>
    ) => {

        const { id, name } = e.currentTarget;
        dispatch(ustilActions.updateSizes({ id, name }))

    };

    // Сортируем размеры в правильном порядке
    const sortedSizes = sizes ? getSizeOrder([...sizes]) : [];

    if (pathname === '/cart') {
        return (
            <div className={styles.sizeChanger__cart}>
                {sortedSizes.map((item, index) => {
                    return (
                        <div
                            className={styles.sizeChanger_wrapper}
                            key={item.name}
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
                                <p className={styles.size_stock}>{`(${item.qty ?? 0} шт.)`}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    }

    return (
        <div className={styles.sizeChangerNew}>
            {sortedSizes.map((item, index) => {
                return (
                    <SizeCard
                        {...item}
                        key={index}
                        onCardClick={(id: string, name: string) => dispatch(ustilActions.updateSizes({ id, name }))}
                    />
                );
            })}
        </div>
    );
};


type TSizeCardProps = {
    name: string;
    qty: number;
    userQty: number;
    onCardClick: (id: string, name: string) => void;
}
const SizeCard: React.FC<TSizeCardProps> = ({ name, qty, userQty, onCardClick }) => {
    const isInStock = qty > 0;
    const isActive = userQty > 0;
    return (
        <div
            className={[styles.sizeCard, isActive ? styles.sizeCard__active : ''].join(' ')}
            style={!isInStock ? { opacity: 0.25, cursor: 'not-allowed', backgroundColor: 'lightgray' } : {}}
            data-in-stock={isInStock}
            onClick={() => onCardClick('increase', name)}
        >
            <div className={styles.sizeCard_header}>
                <p className={styles.sizeCard_title} title={name}>{name}</p>
            </div>
            <div className={styles.sizeCard__footer}>
                {isInStock ? (
                    <>
                        <span>Осталось {qty - userQty}</span>
                        <span style={{ opacity: 0.5 }}>Из {qty}</span>
                    </>
                ) : (
                    <span>Нет в наличии</span>
                )}

            </div>
            {!isActive && isInStock && <span className={styles.sizeCard__plusIcon}>+</span>}
            {isActive && isInStock &&
                <div className={styles.sizeCard__minusIcon}
                    onClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        onCardClick('decrease', name)
                    }}
                >
                    <button
                        className={styles.sizeCard__minusButton}
                    >-</button>
                    <span>{userQty}</span>
                </div>
            }
        </div>
    );
}

export default SizeChanger;
