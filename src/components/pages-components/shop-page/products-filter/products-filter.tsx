'use client'
import React, {ChangeEvent, useState} from "react";
import styles from './products-filter.module.css';
import { TextField } from "@mui/material";
import { MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import ProductCardsBlock from "../product-cards-block/product-cards-block";
import { IProduct } from "@/app/utils/types";

const filterParams = {
    category: [
        {name:'Мужское',value:'man'},
        {name:'Женское',value:'woman'},
        {name:'Детское',value:'kids'},
        {name:'Аксессуары',value:'accesorize'}
    ],
    type: [
        {name:'Футболка',value:'tshirt'},
        {name:'Лонгслив',value:'longsleeve'},
        {name:'Свитшот',value:'sweatshirt'},
        {name:'Худи',value:'hoodie'},
        {name:'Шоппер',value:'totebag'},
        {name:'Кепка',value:'cap'}
    ]
}

const inputSx = {
    "& .MuiInputLabel-root": { fontFamily: 'Neue_machina' },
    "& .MuiInputLabel-root.Mui-focused": { color: 'rgb(57,57,57)' }, 
    "& .MuiOutlinedInput-root.Mui-focused": {
    "& > fieldset": { borderColor: 'rgb(57,57,57)' },
    },
    width: '200px'
}


const ProductFilterComp: React.FC<{ children?: React.ReactNode, shopData: Array<IProduct> }> = ({ children, shopData }) => {

    
    const [ filterState, setFilterState ] = useState<{'category': string, 'type': string, 'priceSort': string}>({'category': '', 'type': '', 'priceSort': ''});
    const [ isFiltered, setIsFiltred ] = useState<boolean>(false);
    const [ filteredData, setFilteredData ] = useState<Array<IProduct> | null>(null);
    //const router = useRouter();

    const resetFilterButtonClickHandler = () => {
        setFilterState({'category': '', 'type': '', 'priceSort': ''});
        setIsFiltred(false);
        setFilteredData(null);
        //router.push('/shop');
    }

    const filterInputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFilterState({
            ...filterState,
            [e.target.name]: e.target.value
        })

    }

    const filtersSubmitHandler = (e: any) => {
        e.preventDefault();
        // const keys = Object.keys(filterState);
        // let queryString = '';
        // keys.forEach((key) => {
        //     //@ts-ignore
        //     if (filterState[key]) {
        //         //@ts-ignore
        //         if (queryString === '') return queryString += `?${key}=${filterState[key]}`;
        //         //@ts-ignore
        //         return queryString += `&${key}=${filterState[key]}`
        //     }
        // })
        // router.push(`/shop${queryString}`);
        setIsFiltred(true)
        const filterFunc = () => {
            let filteredData = shopData;
            if (filterState.category) filteredData = filteredData.filter((item) => (item.category === filterState.category));
            if (filterState.type) filteredData = filteredData.filter((item) => (item.type === filterState.type));
            if (filterState.priceSort && filterState.priceSort === 'ASC') filteredData = filteredData.sort((a,b) => (a.price - b.price));
            if (filterState.priceSort && filterState.priceSort === 'DESC') filteredData = filteredData.sort((a,b) => (b.price - a.price));
            
            return filteredData;
        }
        setFilteredData(filterFunc());
    }

    return (
        <section className={styles.main}>
        <form className={styles.filters} onSubmit={filtersSubmitHandler}>
                <div className={styles.filters_wrapper}>
                    <h1> Каталог</h1>
                    <TextField
                        select
                        inputProps={{MenuProps: {disableScrollLock: true}}}
                        sx={inputSx}
                        size='small'
                        label='Категория'
                        id='category'
                        name='category'
                        value={filterState.category}
                        onChange={filterInputChangeHandler}
                    >
                        {filterParams.category.map((item, index) => (
                            <MenuItem value={item.value} key={index}>{item.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        inputProps={{MenuProps: {disableScrollLock: true}}}
                        sx={inputSx}
                        size='small'
                        label='Тип'
                        id='type'
                        name='type'
                        value={filterState.type}
                        onChange={filterInputChangeHandler}
                    >
                        {filterParams.type.map((item, index) => (
                            <MenuItem value={item.value} key={index}>{item.name}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        inputProps={{MenuProps: {disableScrollLock: true}}}
                        sx={inputSx}
                        size='small'
                        label='Цена'
                        id='priceSort'
                        name='priceSort'
                        value={filterState.priceSort}
                        onChange={filterInputChangeHandler}
                    >
                            <MenuItem value='ASC'>По возрастанию</MenuItem>
                            <MenuItem value='DESC'>По убыванию</MenuItem>
                    </TextField>
                </div>
                <button type='button' className={styles.filters_submitButton} onClick={resetFilterButtonClickHandler}>сбросить</button>
                <button type='submit' className={styles.filters_submitButton} >применить</button>                
        </form>
        {isFiltered && filteredData ? (<ProductCardsBlock shopData={filteredData} />) : (<>{children}</>)}
        </section>
    )
}

export default ProductFilterComp;
