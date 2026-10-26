"use client";
import React, { SyntheticEvent, useEffect, useState } from "react";
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
    const [activeSize, setActiveSize] = useState<string | null>(null);
    useEffect(() => {
        let stateSizes = itemSizes.map((item) => {

            return {
                name: item.name,
                qty: item.qty,
                userQty: item.userQty ?? 0,
            };

        });
        dispatch(ustilActions.setInitialSizes(stateSizes));
        return () => {
            dispatch(ustilActions.resetStateSizes());
        };
    }, []);

    useEffect(() => {
        if (!sizes?.length) return;
        setActiveSize((current) => {
            if (current && sizes.some((size) => size.name === current)) return current;
            return sizes.find((size) => size.userQty > 0)?.name ?? null;
        });
    }, [sizes]);

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

    const active = sortedSizes.find((size) => size.name === activeSize) ?? null;

    const selectSize = (name: string) => {
        const size = sortedSizes.find((item) => item.name === name);
        if (!size || size.qty <= 0) return;
        setActiveSize(name);
        if (size.userQty === 0) {
            dispatch(ustilActions.updateSizes({ id: 'increase', name }));
        }
    };

    return (
        <div className={styles.sizePicker}>
            <div className={styles.sizeRow} role="group" aria-label="Размер">
                {sortedSizes.map((size) => {
                    const inStock = size.qty > 0;
                    const selected = size.userQty > 0;
                    return (
                        <button
                            key={size.name}
                            type="button"
                            className={[
                                styles.sizeOption,
                                selected ? styles.sizeOptionSelected : '',
                                !inStock ? styles.sizeOptionDisabled : '',
                            ].join(' ')}
                            aria-pressed={selected}
                            disabled={!inStock}
                            onClick={() => selectSize(size.name)}
                        >
                            {size.name.toUpperCase()}
                        </button>
                    );
                })}
            </div>
            <div className={styles.qtyControl}>
                <button
                    type="button"
                    className={styles.qtyCell}
                    aria-label="Уменьшить количество"
                    disabled={!active || active.userQty <= 0}
                    onClick={() => active && dispatch(ustilActions.updateSizes({ id: 'decrease', name: active.name }))}
                >
                    −
                </button>
                <span className={styles.qtyCell}>{active?.userQty ?? 0}</span>
                <button
                    type="button"
                    className={styles.qtyCell}
                    aria-label="Увеличить количество"
                    disabled={!active || active.userQty >= active.qty}
                    onClick={() => active && dispatch(ustilActions.updateSizes({ id: 'increase', name: active.name }))}
                >
                    +
                </button>
            </div>
        </div>
    );
};

export default SizeChanger;
