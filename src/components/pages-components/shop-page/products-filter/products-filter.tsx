'use client'
import React, {ChangeEvent, useState} from "react";
import styles from './products-filter.module.css';
import { TextField } from "@mui/material";
import { MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";
import Link from "next/link";

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


const ProductFilterComp: React.FC<{ searchParams: {[n:string]: string}}> = ({searchParams}) => {

    
    const [ filterState, setFilterState ] = useState<{'category': string, 'type': string, 'priceSort': string, [n:string]: string}>({...searchParams, 'category': '', 'type': '', 'priceSort': '',})
    const router = useRouter();

    // const resetFilterButtonClickHandler = () => {
    //     setFilterState({...searchParams, 'category': '', 'type': '', 'priceSort': ''});
    //     router.push('/shop');
    // }

    const filterInputChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFilterState({
            ...filterState,
            [e.target.name]: e.target.value
        })

    }

    const filtersSubmitHandler = (e: any) => {
        e.preventDefault();
        const keys = Object.keys(filterState);
        let queryString = '';
        keys.forEach((key) => {
            //@ts-ignore
            if (filterState[key]) {
                //@ts-ignore
                if (queryString === '') return queryString += `?${key}=${filterState[key]}`;
                //@ts-ignore
                return queryString += `&${key}=${filterState[key]}`
            }
        })
        router.push(`/shop${queryString}`);
    }

    return (
        <form className={styles.filters} onSubmit={filtersSubmitHandler}>
                <div className={styles.filters_wrapper}>   
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
                {/* <button type='button' className={styles.filters_submitButton} onClick={resetFilterButtonClickHandler}>сбросить</button> */}
                <Link className={styles.filters_submitButton} href={{ pathname: '/shop', query: (() => {
                    const { category, type, priceSort, ...rest} = searchParams;
                    return rest;
                })()}}>сбросить</Link>
                <button type='submit' className={styles.filters_submitButton}>применить</button>             
        </form>
    ) 
}

export default ProductFilterComp;
