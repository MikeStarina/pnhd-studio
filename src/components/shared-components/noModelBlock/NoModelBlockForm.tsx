'use client';

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import styles from './NoModelBlock.module.css';
import TextField from '@mui/material/TextField';
import { MuiTelInput } from 'mui-tel-input';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from 'next/link';
import Image from 'next/image';
import { v4 as uuidv4 } from 'uuid';
import RU_FLAG from '../../../../public/ru_flag.webp';
import { photoProcessing } from '@/app/utils/constructor-utils';
import { IUploadPrintResponse } from '@/app/utils/types';
import { useCreateLeadMutation, useUploadPrintImageMutation } from '@/api/api';

const muiFieldSx = {
  '& .MuiInputLabel-root': { fontFamily: 'Neue_machina' },
  '& .MuiInputLabel-root.Mui-focused': { color: 'rgb(57,57,57)' },
  '& .MuiOutlinedInput-root.Mui-focused': {
    '& > fieldset': { borderColor: 'rgb(57,57,57)' },
  },
  '& .MuiOutlinedInput-root': { fontFamily: 'Neue_machina' },
} as const;

function TshirtIcon() {
  return (
    <svg className={styles.uploadIconSvg} viewBox="0 0 48 48" fill="none" aria-hidden>
      <path
        d="M14 10 10 16v6h4v18h20V22h4v-6l-4-6-5 3h-10l-5-3Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const NoModelBlockForm = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [comment, setComment] = useState('');
  const [referenceFile, setReferenceFile] = useState<File | null>(null);
  const [isAgreed, setIsAgreed] = useState(true);
  const [createLead, { isUninitialized, isSuccess, isError, reset }] = useCreateLeadMutation();
  const [uploadPrint, { isLoading: isUploading }] = useUploadPrintImageMutation();

  useEffect(() => {
    const t = setTimeout(() => reset(), 2000);
    return () => clearTimeout(t);
  }, [isSuccess, reset]);

  const onFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const processed = photoProcessing(file);
    setReferenceFile(processed || null);
    if (!processed) {
      e.target.value = '';
    }
  };

  const submitHandler = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const roistat = 'n/a';
    let reference_url: string | undefined;

    if (referenceFile) {
      const data = new FormData();
      data.append('files', referenceFile, `${uuidv4()}_${referenceFile.name}`);
      try {
        const uploaded = (await uploadPrint(data).unwrap()) as IUploadPrintResponse;
        reference_url = uploaded?.data?.url;
      } catch {
        reference_url = undefined;
      }
    }

    try {
      await createLead({
        roistat,
        name,
        phone: phone.replaceAll(' ', ''),
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(comment.trim() ? { comment: comment.trim() } : {}),
        ...(reference_url ? { reference_url } : {}),
      }).unwrap();
      setName('');
      setPhone('');
      setEmail('');
      setComment('');
      setReferenceFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch {
      /* статус покажет RTK mutation */
    }
  };

  return (
    <form className={styles.customOrderForm} onSubmit={submitHandler}>
      <div className={styles.formRow2}>
        <TextField
          id="custom-order-name"
          required
          autoComplete="name"
          fullWidth
          size="small"
          label="Твоё имя *"
          InputLabelProps={{ required: false }}
          value={name}
          sx={muiFieldSx}
          onChange={(ev: ChangeEvent<HTMLInputElement>) => setName(ev.target.value)}
        />
        <MuiTelInput
          onlyCountries={['RU']}
          fullWidth
          size="small"
          autoComplete="tel"
          defaultCountry="RU"
          label="Твой телефон *"
          required
          InputLabelProps={{ required: false }}
          value={phone}
          disableDropdown
          sx={{ ...muiFieldSx, fontFamily: 'Neue_machina' }}
          getFlagElement={() => (
            <Image width={26} height={17} alt="Россия" src={RU_FLAG} />
          )}
          onChange={setPhone}
        />
      </div>
      <TextField
        id="custom-order-email"
        autoComplete="email"
        fullWidth
        size="small"
        type="email"
        label="Почта"
        placeholder="Это необязательно"
        value={email}
        sx={muiFieldSx}
        onChange={(ev: ChangeEvent<HTMLInputElement>) => setEmail(ev.target.value)}
      />
      {/* <div className={styles.uploadBlock}>
        <div className={styles.uploadIconWrap} aria-hidden>
          <TshirtIcon />
        </div>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg"
          className={styles.uploadInput}
          onChange={onFileChange}
        />
        <button
          type="button"
          className={styles.uploadButton}
          onClick={() => fileInputRef.current?.click()}
        >
          ЗАГРУЗИТЬ РЕФЕРЕНС
        </button>
        {referenceFile && (
          <span className={styles.uploadFileName}>{referenceFile.name}</span>
        )}
      </div> */}
      <TextField
        id="custom-order-comment"
        fullWidth
        size="small"
        multiline
        minRows={6}
        label="Комментарий"
        placeholder="Опиши изделие своей мечты"
        value={comment}
        sx={muiFieldSx}
        onChange={(ev: ChangeEvent<HTMLInputElement>) => setComment(ev.target.value)}
      />
      {isUninitialized && (
        <button
          type="submit"
          disabled={!isAgreed || isUploading}
          className={styles.submitOrder}
        >
          Оформить заказ
        </button>
      )}
      <FormControlLabel
        control={
          <Checkbox
            checked={isAgreed}
            onChange={() => setIsAgreed((v) => !v)}
            sx={{
              color: 'rgb(57,57,57)',
              '&.Mui-checked': { color: 'rgb(57,57,57)' },
            }}
          />
        }
        className={styles.consentLabel}
        label={
          <span className={styles.consentText}>
            Нажимая на кнопку Оформить заказ, вы соглашаетесь с{' '}
            <Link className={styles.consentLink} href="/privacy" target="_blank">
              политикой обработки персональных данных
            </Link>
          </span>
        }
      />
      {isSuccess && <p className={styles.formStatus}>Заявка отправлена!</p>}
      {isError && <p className={styles.formStatus}>Что-то пошло не так :/</p>}
    </form>
  );
};

export default NoModelBlockForm;
