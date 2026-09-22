'use client'
import React, { useState, useEffect, useCallback } from "react";
import styles from './products-filter.module.css';
import { useRouter, useSearchParams } from "next/navigation";
import ProductCardsBlock from "../product-cards-block/product-cards-block";
import { IProduct } from "@/app/utils/types";
import { toCategoryArray } from "@/app/utils/product-categories";
import { toTagArray } from "@/app/utils/product-tags";
import { getShopColorOptions, isLightHex, normalizeColorKey } from "@/app/utils/product-colors";
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
    { name: 'Принты', value: 'blank' },
] as const;

type FilterState = { categories: string[]; colors: string[]; tags: string[]; types: string[]; priceSort: string; printable: string };

function parseListParam(value: string | null): string[] {
    return (value || '').split(',').filter(Boolean);
}

function toggleListValue(list: string[], value: string): string[] {
    return list.includes(value) ? list.filter((item) => item !== value) : [...list, value];
}

function buildQueryString(state: FilterState): string {
    const parts: string[] = [];
    if (state.categories.length) parts.push(`category=${encodeURIComponent(state.categories.join(','))}`);
    if (state.colors.length) parts.push(`color=${encodeURIComponent(state.colors.join(','))}`);
    if (state.tags.length) parts.push(`tags=${encodeURIComponent(state.tags.join(','))}`);
    if (state.types.length) parts.push(`type=${encodeURIComponent(state.types.join(','))}`);
    if (state.priceSort) parts.push(`priceSort=${encodeURIComponent(state.priceSort)}`);
    if (state.printable) parts.push(`printable=${encodeURIComponent(state.printable)}`);
    return parts.length ? `?${parts.join('&')}` : '';
}

function countActiveFilters(state: FilterState): number {
    return (
        state.categories.length +
        state.colors.length +
        state.tags.length +
        state.types.length +
        (state.priceSort ? 1 : 0) +
        (state.printable ? 1 : 0)
    );
}

function applyFilters(shopData: IProduct[], state: FilterState): IProduct[] {
    let data = [...shopData];
    if (state.categories.length) data = data.filter((item) => toCategoryArray(item.category).some((id) => state.categories.includes(id)));
    if (state.colors.length) data = data.filter((item) => state.colors.includes(normalizeColorKey(item.color)));
    if (state.tags.length) data = data.filter((item) => toTagArray(item.tags).some((tagId) => state.tags.includes(tagId)));
    if (state.types.length) data = data.filter((item) => state.types.includes(item.type));
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
    const colorOptions = getShopColorOptions(shopData);

    const [filterState, setFilterState] = useState<FilterState>({
        categories: [],
        colors: [],
        tags: [],
        types: [],
        priceSort: '',
        printable: '',
    });
    const [isFiltered, setIsFiltered] = useState(false);
    const [filteredData, setFilteredData] = useState<Array<IProduct> | null>(null);
    const [isFiltersOpen, setIsFiltersOpen] = useState(false);

    useEffect(() => {
        const categories = parseListParam(searchParams.get('category'));
        const colors = parseListParam(searchParams.get('color')).map(normalizeColorKey).filter(Boolean);
        const tags = parseListParam(searchParams.get('tags'));
        const types = parseListParam(searchParams.get('type'));
        const priceSort = searchParams.get('priceSort') || '';
        const printable = searchParams.get('printable') || '';

        setFilterState({ categories, colors, tags, types, priceSort, printable });

        if (categories.length || colors.length || tags.length || types.length || priceSort || printable) {
            setFilteredData(applyFilters(shopData, { categories, colors, tags, types, priceSort, printable }));
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
        navigateWithState({ ...filterState, categories: toggleListValue(filterState.categories, value) });
    };

    const onColorPill = (value: string) => {
        navigateWithState({ ...filterState, colors: toggleListValue(filterState.colors, value) });
    };

    const onTagPill = (value: string) => {
        navigateWithState({ ...filterState, tags: toggleListValue(filterState.tags, value) });
    };

    const onTypePill = (value: string) => {
        navigateWithState({ ...filterState, types: toggleListValue(filterState.types, value) });
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

    const openFilters = () => setIsFiltersOpen(true);
    const closeFilters = () => setIsFiltersOpen(false);

    useEffect(() => {
        if (!isFiltersOpen) return;
        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const onKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') closeFilters();
        };
        const onResize = () => {
            if (window.innerWidth > 900) closeFilters();
        };

        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('resize', onResize);
        return () => {
            document.body.style.overflow = prevOverflow;
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('resize', onResize);
        };
    }, [isFiltersOpen]);

    const activeFilterCount = countActiveFilters(filterState);
    const hasActiveFilters = activeFilterCount > 0;

    return (
        <section className={styles.main}>
            <header className={styles.header}>
                <Breadcrumbs items={[{ label: 'Главная', href: '/' }, { label: 'Каталог', href: '/shop' }]} />
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

            <button
                type="button"
                className={styles.filtersOpenButton}
                onClick={openFilters}
                aria-expanded={isFiltersOpen}
                aria-controls="catalog-filters"
            >
                фильтры
                {hasActiveFilters && (
                    <span className={styles.resetCount} aria-hidden>
                        {activeFilterCount}
                    </span>
                )}
            </button>

            <div className={styles.catalogLayout}>
                <div
                    id="catalog-filters"
                    className={`${styles.filtersWrapper} ${isFiltersOpen ? styles.filtersDialogOpen : ''}`}
                >
                    <div className={styles.filtersDialogHeader}>
                        <span className={styles.filtersDialogTitle}>Фильтры</span>
                        <button
                            type="button"
                            className={styles.filtersCloseButton}
                            onClick={closeFilters}
                            aria-label="Закрыть фильтры"
                        >
                            <span className={styles.closeLine} />
                            <span className={styles.closeLine} />
                        </button>
                    </div>
                    <div className={styles.filters}>
                        <div className={styles.filterBar} role="group" aria-label="Фильтры каталога">
                            <div className={styles.filterGroup}>
                                <details>
                                    <summary >
                                        <span className={styles.groupLabel}>Категория</span>
                                    </summary>
                                    <div className={styles.pills}>
                                        {categoryOptions.map((item) => {
                                            const active = filterState.categories.includes(item.value);
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
                                </details>
                            </div>

                            <div className={`${styles.filterGroup} ${styles.filterGroupTypes}`}>
                                <details>
                                    <summary >
                                        <span className={styles.groupLabel}>Тип</span>
                                    </summary>
                                    <div className={styles.pills}>
                                        {filterParams.type.map((item) => {
                                            const active = filterState.types.includes(item.value);
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
                                </details>
                            </div>

                            {colorOptions.length > 0 && (
                                <div className={styles.filterGroup}>
                                    <details>
                                        <summary >
                                            <span className={styles.groupLabel}>Цвет</span>
                                        </summary>
                                        <div className={styles.pills}>
                                            {colorOptions.map((item) => {
                                                const active = filterState.colors.includes(item.value);
                                                return (
                                                    <button
                                                        key={item.value}
                                                        type="button"
                                                        className={`${styles.pill} ${active ? styles.pillActive : ''}`}
                                                        onClick={() => onColorPill(item.value)}
                                                        aria-pressed={active}
                                                    >
                                                        <span
                                                            className={`${styles.colorSwatch} ${item.hex && isLightHex(item.hex) ? styles.colorSwatchLight : ''}`}
                                                            style={item.hex ? { backgroundColor: item.hex } : undefined}
                                                            aria-hidden
                                                        />
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
                                    </details>
                                </div>
                            )}

                           

                            <div className={styles.filterGroup}>
                                <details>
                                    <summary >
                                        <span className={styles.groupLabel}>Теги</span>
                                    </summary>
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
                                </details>
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

                        <div className={styles.formActions}>
                            <button
                                type="button"
                                className={styles.filters_submitButton}
                                onClick={resetFilterButtonClickHandler}
                                disabled={!hasActiveFilters}
                                aria-label={hasActiveFilters ? `Сбросить фильтры, выбрано ${activeFilterCount}` : 'Сбросить фильтры'}
                            >
                                сбросить
                                {hasActiveFilters && (
                                    <span className={styles.resetCount} aria-hidden>
                                        {activeFilterCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>


                {isFiltered && filteredData ? (
                    <ProductCardsBlock shopData={filteredData} />
                ) : (
                    <>{children}</>
                )}
            </div>
        </section>
    );
};

export default ProductFilterComp;
