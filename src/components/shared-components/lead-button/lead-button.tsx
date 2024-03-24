'use client'
import React from "react"
import styles from './lead-button.module.css';
import { actions as utilsActions } from "@/redux/utils-slice/utils.slice";
import { useAppDispatch } from "@/redux/redux-hooks";




const LeadButton: React.FC<{styleType: 'green' | 'white'}> = ({ styleType }) => {
    const dispatch = useAppDispatch()
    const buttonStyle = styleType === 'green' ? 
        styles.leadButton__green : styleType === 'white' ? 
        styles.leadButton__white : styles.leadButton__green;

    const leadButtonClickHandler = () => {
        dispatch(utilsActions.setPopupVisibility());
        dispatch(utilsActions.setPopupType('lead'));
        dispatch(utilsActions.setPopupTitle('Воплощай смелые идеи с любым методом нанесения'));
    }

    return (
        <button className={buttonStyle} onClick={leadButtonClickHandler}>проконсультироваться</button>
    )
}

export default LeadButton;