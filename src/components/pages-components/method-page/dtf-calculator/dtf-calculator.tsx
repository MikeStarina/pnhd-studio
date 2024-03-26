'use client'
import React, { ChangeEvent, useState } from "react";
import styles from './dtf-calculator.module.css'
import { Box } from "@mui/material";
import { TextField } from "@mui/material";
import { dtfCalculatorFunc } from "@/app/utils/dtf-calculator-utils";


const initialPrintParams = {
    width: '',
    height: '',
    qty: ''
}
const textFieldSx = {
    "& .MuiInputLabel-root": { fontFamily: "Neue_machina" },
    "& .MuiInputLabel-root.Mui-focused": { color: "rgb(57,57,57)" },
    "& .MuiOutlinedInput-root.Mui-focused": {
        "& > fieldset": { borderColor: "rgb(57,57,57)" },
    },
};
const initResult = {
        filmLength: '',
        printPrice: '',
        transferPrice: '',
        totalPrice: '',
        printSize: '',
        printOrientation: '',
        qty: '',
}

const DtfCalculator: React.FC = () => {

    const [ printParams, setPrintParams ] = useState(initialPrintParams);
    const [ result, setResult ] = useState(initResult);

    

    const changeHandler = (e: ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setPrintParams({
            ...printParams,
            [id]: value,
        })
    }

    const submitHandler = (e: any) => {
        e.preventDefault();
        const result = dtfCalculatorFunc(printParams);
        setResult(result)
        setPrintParams(initialPrintParams);
    }

        return (
            <div className={styles.dtfCalc} id='dtfcalculator'>
                <Box
                    component='form'
                    onSubmit={submitHandler}
                    className={styles.dtfCalc_form}
                >
                    <h3 className={styles.dtfCalc_title}>Рассчитать dtf</h3>
                    <TextField
                        required
                        fullWidth
                        autoComplete="off"
                        label='Ширина (см)'
                        id='width'
                        onChange={changeHandler}
                        sx={textFieldSx}
                        size="small"
                        value={printParams.width}
                    />
                    <TextField
                        required
                        fullWidth
                        autoComplete="off"
                        label='Высота (см)'
                        id='height'
                        onChange={changeHandler}
                        sx={textFieldSx}
                        size="small"
                        value={printParams.height}
                    />
                    <TextField
                        required
                        fullWidth
                        autoComplete="off"
                        label='Количество (шт)'
                        id='qty'
                        onChange={changeHandler}
                        sx={textFieldSx}
                        size="small"
                        value={printParams.qty}
                    />
                    <button type="submit" className={styles.dtfCalc_button}>Рассчитать</button>
                </Box>    
                <div className={styles.dtfCalc_result}>
                    <p className={styles.result_text}>{result.filmLength}</p>
                    <p className={styles.result_text}>{result.printSize}</p>
                    <p className={styles.result_text}>{result.printOrientation}</p>
                    <p className={styles.result_text}>{result.qty}</p>
                    <p className={styles.result_text}>{result.printPrice}</p>
                    <p className={styles.result_text}>{result.transferPrice}</p>
                    <p className={styles.result_title}>Итого: {result.totalPrice}</p>
                </div>
            </div>
        )
}

export default DtfCalculator