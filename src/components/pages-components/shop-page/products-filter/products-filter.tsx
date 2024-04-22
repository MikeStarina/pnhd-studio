'use client'
import React, {ChangeEvent, useState} from "react";
import styles from './products-filter.module.css';
import { TextField } from "@mui/material";
import { MenuItem } from "@mui/material";
import { useRouter } from "next/navigation";

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


const ProductFilterComp: React.FC = () => {

    
    const [ filterState, setFilterState ] = useState<{'category': string, 'type': string, 'priceSort': string}>({'category': '', 'type': '', 'priceSort': ''})

    const router = useRouter();
    const onChangeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        setFilterState({
            ...filterState,
            [e.target.name]: e.target.value
        })

    }

    const submitHandler = (e: any) => {
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
        <form className={styles.filters} onSubmit={submitHandler}>
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
                        onChange={onChangeHandler}
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
                        onChange={onChangeHandler}
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
                        onChange={onChangeHandler}
                    >
                            <MenuItem value='ASC'>По возрастанию</MenuItem>
                            <MenuItem value='DESC'>По убыванию</MenuItem>
                    </TextField>
                </div>
                <button type='submit' className={styles.filters_submitButton}>применить</button>
        </form>
    )
}

export default ProductFilterComp;
