'use client'
import React, { ChangeEvent, FormEvent, useEffect, useState } from "react"
import styles from './lead-form.module.css'
import { useAppDispatch, useAppSelector } from "@/redux/redux-hooks";
import TextField from '@mui/material/TextField';
import { MuiTelInput } from 'mui-tel-input'
import ConsentField from '@/components/site/consent-field/consent-field';
import { actions as leadActions } from "@/redux/lead-slice/lead.slice";
import { useCreateLeadMutation } from "@/api/api";
import { track } from "@/components/site/analytics";
import Link from "next/link";
import Image from "next/image";
import RU_FLAG from '../../../../public/ru_flag.webp';



const LeadForm: React.FC = () => {

    const dispatch = useAppDispatch();
    const { name, phone, isAgreedWithPrivacyPolicy } = useAppSelector(store => store.leads);
    const [agreeError, setAgreeError] = useState('');
    const [ createLead, { isUninitialized, isSuccess, isError, reset} ] = useCreateLeadMutation();

    useEffect(() => {
        const timeout = setTimeout(() => { reset() }, 2000);
        return () => { clearTimeout(timeout) };
    }, [isSuccess])

    const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!isAgreedWithPrivacyPolicy) {
            setAgreeError('Отметь согласие на обработку персональных данных, иначе заявку не отправить');
            document.getElementById('lead-agree')?.focus();
            return;
        }
        //const cookie: {[n: string]: string} = getCookie(document.cookie);

        const roistat = 'n/a';
        createLead({roistat, name, phone: phone.replaceAll(' ', '')}).then((result) => {
            track('error' in result ? 'lead_error' : 'lead_submit', { form: 'popup' });
        });
        dispatch(leadActions.resetLeadData());
    }

    return (
                    <form className={styles.footer_form} onSubmit={submitHandler}>
                        <span className={styles.form_title}>Заполни форму, мы
                            свяжемся для консультации
                        </span>
                        <TextField 
                            id='name'
                            required
                            autoComplete='off'
                            fullWidth
                            size='small'
                            label='Твоё имя'
                            value={name}
                            sx={{
                                "& .MuiInputLabel-root": { fontFamily: 'Neue_machina' },
                                "& .MuiInputLabel-root.Mui-focused": { color: 'rgb(57,57,57)' }, 
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                  "& > fieldset": { borderColor: 'rgb(57,57,57)' },
                                },
                            }}
                            onChange={(e: ChangeEvent<HTMLInputElement>) => { dispatch(leadActions.setUserData({ id: e.target.id, value: e.target.value })) }}
                        />
                        <MuiTelInput
                            onlyCountries={['RU']}
                            fullWidth
                            size='small'
                            autoComplete='off'
                            defaultCountry="RU"
                            label='Твой телефон'
                            required
                            value={phone}
                            disableDropdown
                            sx={{
                                fontFamily: 'Neue_machina',
                                "& .MuiInputLabel-root": { fontFamily: 'Neue_machina' },
                                "& .MuiInputLabel-root.Mui-focused": { color: 'rgb(57,57,57)' }, 
                                "& .MuiOutlinedInput-root.Mui-focused": {
                                  "& > fieldset": { borderColor: 'rgb(57,57,57)' },
                                },
                            }}
                            getFlagElement={() => {
                                return <Image width={26} height={17} alt='ГОЙДААА!' src={RU_FLAG} aria-label='Россия' />
                              }}
                            onChange={(newValue: string) => { dispatch(leadActions.setUserData({ id: 'phone', value: newValue })) }}
                        />
                        <ConsentField
                            id='lead-agree'
                            checked={isAgreedWithPrivacyPolicy}
                            error={agreeError}
                            onChange={() => { dispatch(leadActions.setPrivacyPolicyAgreement()); setAgreeError('') }}
                        />
                         {isUninitialized && <button type='submit' className={styles.form_submitButton}>проконсультироваться</button>}
                         {isSuccess && <p className={styles.form_statusText}>Заявка отправлена!</p>}
                         {isError && <p className={styles.form_statusText}>Что-то пошло не так :/</p>}
                    </form>
    )
}

export default LeadForm;