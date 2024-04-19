'use client'
import React from "react";
import styles from './products-filter.module.css';
import { TextField } from "@mui/material";
import { MenuItem } from "@mui/material";


const filterParams = {
    category: ['Мужское','Женское','Детское','Аксессуары'],
    type: ['Футболка','Лонгслив','Свитшот','Худи','Шоппер','Кепка']
}


const ProductFilterComp: React.FC = () => {

    const submitHandler = () => {

    }

    return (
        <form className={styles.filters} onSubmit={submitHandler}>
                <div className={styles.filters_wrapper}>   
                    <TextField
                        select
                        inputProps={{MenuProps: {disableScrollLock: true}}}
                        sx={{
                            "& .MuiInputLabel-root": { fontFamily: 'Neue_machina' },
                            "& .MuiInputLabel-root.Mui-focused": { color: 'rgb(57,57,57)' }, 
                            "& .MuiOutlinedInput-root.Mui-focused": {
                            "& > fieldset": { borderColor: 'rgb(57,57,57)' },
                            },
                            width: '200px'
                        }}
                        size='small'
                        label='Категория'
                        id='filter_category'
                        name='filter_category'
                    >
                        {filterParams.category.map((item, index) => (
                            <MenuItem value={item} key={index}>{item}</MenuItem>
                        ))}
                    </TextField>
                    <TextField
                        select
                        inputProps={{MenuProps: {disableScrollLock: true}}}
                        sx={{
                            "& .MuiInputLabel-root": { fontFamily: 'Neue_machina' },
                            "& .MuiInputLabel-root.Mui-focused": { color: 'rgb(57,57,57)' }, 
                            "& .MuiOutlinedInput-root.Mui-focused": {
                            "& > fieldset": { borderColor: 'rgb(57,57,57)' },
                            },
                            width: '200px'
                        }}
                        size='small'
                        label='Тип'
                        id='filter_type'
                        name='filter_type'
                    >
                        {filterParams.type.map((item, index) => (
                            <MenuItem value={item} key={index}>{item}</MenuItem>
                        ))}
                    </TextField>
                </div>
                <button type='submit' className={styles.filters_submitButton}>применить</button>
        </form>
    )
}

export default ProductFilterComp;
