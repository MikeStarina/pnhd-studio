'use client'
import React, { useState, useEffect, useCallback } from "react";
import styles from './products-filter.module.css';
import { useRouter, useSearchParams } from "next/navigation";
import ProductCardsBlock from "../product-cards-block/product-cards-block";
import { IProduct } from "@/app/utils/types";
import { toCategoryArray } from "@/app/utils/product-categories";
import { toTagArray } from "@/app/utils/product-tags";
import { useGetCategoriesQuery, useGetTagsQuery } from "@/api/api";
import Breadcrumbs from '@/components/shared-components/breadcrumbs/Breadcrumbs';

const filterParams = {
    type: [
        { name: 'Футболка', value: 'tshirt' },
        { name: 'Лонгслив', value: 'longsleeve' },
        { name: 'Свитшот', value: 'sweatshirt' },
        { name: 'Худи', value: 'hoodie' },
        { name: 'Шоппер', value: 'totebag' },
        { name: 'Кепка', value: 'cap' },
    ],
} as const;

const priceOptions = [
    { name: '↑ по возрастанию', value: 'ASC' as const },
    { name: '↓ по убыванию', value: 'DESC' as const },
];

const printableOptions = [
    { name: 'Все', value: '' },
    { name: 'Для печати', value: 'print' },
    { name: 'Бланк', value: 'blank' },
] as const;

type FilterState = { category: string; tags: string[]; type: string; priceSort: string; printable: string };

function buildQueryString(state: FilterState): string {
    const parts: string[] = [];
    if (state.category) parts.push(`category=${encodeURIComponent(state.category)}`);
    if (state.tags.length) parts.push(`tags=${encodeURIComponent(state.tags.join(','))}`);
    if (state.type) parts.push(`type=${encodeURIComponent(state.type)}`);
    if (state.priceSort) parts.push(`priceSort=${encodeURIComponent(state.priceSort)}`);
    if (state.printable) parts.push(`printable=${encodeURIComponent(state.printable)}`);
    return parts.length ? `?${parts.join('&')}` : '';
}

function applyFilters(shopData: IProduct[], state: FilterState): IProduct[] {
    let data = [...shopData];
    if (state.category) data = data.filter((item) => toCategoryArray(item.category).includes(state.category));
    if (state.tags.length) data = data.filter((item) => toTagArray(item.tags).some((tagId) => state.tags.includes(tagId)));
    if (state.type) data = data.filter((item) => item.type === state.type);
    if (state.printable === 'print') data = data.filter((item) => item.isForPrinting);
    if (state.printable === 'blank') data = data.filter((item) => !item.isForPrinting);
    if (state.priceSort === 'ASC') data.sort((a, b) => a.price - b.price);
    if (state.priceSort === 'DESC') data.sort((a, b) => b.price - a.price);
    return data;
}

const ProductFilterComp: React.FC<{ children?: React.ReactNode; shopData: Array<IProduct> }> = ({
    children,
    shopData,
}) => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: categoriesData } = useGetCategoriesQuery();
    const categoryOptions = (categoriesData?.data ?? []).map((item) => ({
        name: item.label,
        value: item._id,
    }));
    const { data: tagsData } = useGetTagsQuery();
    const tagOptions = (tagsData?.data ?? []).map((item) => ({
        name: item.label,
        value: item._id,
    }));

    const [filterState, setFilterState] = useState<FilterState>({
        category: '',
        tags: [],
        type: '',
        priceSort: '',
        printable: '',
    });
    const [isFiltered, setIsFiltered] = useState(false);
    const [filteredData, setFilteredData] = useState<Array<IProduct> | null>(null);

    useEffect(() => {
        const category = searchParams.get('category') || '';
        const tags = (searchParams.get('tags') || '').split(',').filter(Boolean);
        const type = searchParams.get('type') || '';
        const priceSort = searchParams.get('priceSort') || '';
        const printable = searchParams.get('printable') || '';

        setFilterState({ category, tags, type, priceSort, printable });

        if (category || tags.length || type || priceSort || printable) {
            setFilteredData(applyFilters(shopData, { category, tags, type, priceSort, printable }));
            setIsFiltered(true);
        } else {
            setIsFiltered(false);
            setFilteredData(null);
        }
    }, [searchParams, shopData]);

    const navigateWithState = useCallback(
        (next: FilterState) => {
            router.push(`/shop${buildQueryString(next)}`);
        },
        [router]
    );

    const onCategoryPill = (value: string) => {
        if (filterState.category === value) {
            navigateWithState({ ...filterState, category: '' });
            return;
        }
        navigateWithState({ ...filterState, category: value });
    };

    const onTagPill = (value: string) => {
        const nextTags = filterState.tags.includes(value)
            ? filterState.tags.filter((t) => t !== value)
            : [...filterState.tags, value];
        navigateWithState({ ...filterState, tags: nextTags });
    };

    const onTypePill = (value: string) => {
        if (filterState.type === value) {
            navigateWithState({ ...filterState, type: '' });
            return;
        }
        navigateWithState({ ...filterState, type: value });
    };

    const onPricePill = (sort: 'ASC' | 'DESC') => {
        if (filterState.priceSort === sort) {
            navigateWithState({ ...filterState, priceSort: '' });
            return;
        }
        navigateWithState({ ...filterState, priceSort: sort });
    };

    const onPrintablePill = (value: string) => {
        navigateWithState({ ...filterState, printable: value });
    };

    const resetFilterButtonClickHandler = () => {
        router.push('/shop');
    };

    return (
        <section className={styles.main}>
            <header className={styles.header}>
                <Breadcrumbs items={[{label: 'Главная', href: '/'}, {label: 'Каталог', href: '/shop'}]} />
                <h1 className={styles.title}>Каталог</h1>
            </header>

            <div className={styles.preFilter} role="tablist" aria-label="Тип товара">
                {printableOptions.map((opt) => {
                    const active = filterState.printable === opt.value;
                    return (
                        <button
                            key={opt.value || 'all'}
                            type="button"
                            role="tab"
                            aria-selected={active}
                            className={`${styles.preFilterTab} ${active ? styles.preFilterTabActive : ''}`}
                            onClick={() => onPrintablePill(opt.value)}
                        >
                            {opt.name}
                        </button>
                    );
                })}
            </div>

            <div className={styles.filters}>
                <div className={styles.filterBar} role="group" aria-label="Фильтры каталога">
                    <div className={styles.filterGroup}>
                        <span className={styles.groupLabel}>Категория</span>
                        <div className={styles.pills}>
                            {categoryOptions.map((item) => {
                                const active = filterState.category === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                                        onClick={() => onCategoryPill(item.value)}
                                        aria-pressed={active}
                                    >
                                        {item.name}
                                        {active && (
                                            <span className={styles.pillClear} aria-hidden>
                                                ×
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={styles.filterGroup}>
                        <span className={styles.groupLabel}>Теги</span>
                        <div className={styles.pills}>
                            {tagOptions.map((item) => {
                                const active = filterState.tags.includes(item.value);
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                                        onClick={() => onTagPill(item.value)}
                                        aria-pressed={active}
                                    >
                                        {item.name}
                                        {active && (
                                            <span className={styles.pillClear} aria-hidden>
                                                ×
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`${styles.filterGroup} ${styles.filterGroupTypes}`}>
                        <span className={styles.groupLabel}>Тип</span>
                        <div className={styles.pills}>
                            {filterParams.type.map((item) => {
                                const active = filterState.type === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                                        onClick={() => onTypePill(item.value)}
                                        aria-pressed={active}
                                    >
                                        {item.name}
                                        {active && (
                                            <span className={styles.pillClear} aria-hidden>
                                                ×
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className={`${styles.filterGroup} ${styles.filterGroupPrice}`}>
                        <span className={styles.groupLabel}>Цена</span>
                        <div className={styles.pills}>
                            {priceOptions.map((item) => {
                                const active = filterState.priceSort === item.value;
                                return (
                                    <button
                                        key={item.value}
                                        type="button"
                                        className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                                        onClick={() => onPricePill(item.value)}
                                        aria-pressed={active}
                                    >
                                        {item.name}
                                        {active && (
                                            <span className={styles.pillClear} aria-hidden>
                                                ×
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
            <div className={styles.formActions}>
                <button
                    type="button"
                    className={styles.filters_submitButton}
                    onClick={resetFilterButtonClickHandler}
                >
                    сбросить
                </button>
            </div>

            {isFiltered && filteredData ? (
                <ProductCardsBlock shopData={filteredData} />
            ) : (
                <>{children}</>
            )}
        </section>
    );
};

export default ProductFilterComp;
