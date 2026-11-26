'use client';

import React, { useState } from 'react';
import { useCreateLeadMutation } from '@/api/api';
import { readRoistatVisitId } from '@/components/shared-components/telegram-link/telegram-link';
import { track } from '@/components/site/analytics';
import ConsentField from '@/components/site/consent-field/consent-field';
import { siteContacts } from '@/components/site/contacts';
import styles from './price-estimate.module.css';

type Errors = { name?: string; phone?: string; agree?: string };

const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  // Первая 7 или 8 — код страны: в уже отформатированном «+7…», в первой набранной цифре и в полном номере из 11 цифр.
  // В номере из 10 цифр она часть кода города: «812 123-45-67».
  const prefixed = /^[78]/.test(digits) && (value.trim().startsWith('+7') || digits.length === 1 || digits.length > 10);
  const national = (prefixed ? digits.slice(1) : digits).slice(0, 10);
  const [a, b, c, d] = [national.slice(0, 3), national.slice(3, 6), national.slice(6, 8), national.slice(8, 10)];
  return `+7${a ? ` (${a}` : ''}${a.length === 3 ? ')' : ''}${b ? ` ${b}` : ''}${c ? `-${c}` : ''}${d ? `-${d}` : ''}`;
};

const validate = (name: string, phone: string, agree: boolean): Errors => ({
  ...(name.trim().length >= 2 ? {} : { name: 'Укажи, как к тебе обращаться' }),
  ...(phone.replace(/\D/g, '').length === 11 ? {} : { phone: 'Введи телефон полностью' }),
  ...(agree ? {} : { agree: 'Отметь согласие на обработку персональных данных, иначе заявку не отправить' }),
});

/** Заявка менеджеру. source — откуда заявка для Метрики: блок цен на главной или страница методов */
const PriceForm: React.FC<{ source?: 'price' | 'methods' }> = ({ source = 'price' }) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [agree, setAgree] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [createLead, { isLoading, isSuccess, isError, reset }] = useCreateLeadMutation();

  // Приём заявок на бэкенде принимает только имя, телефон (до 12 символов) и метку Roistat: лишние поля он отклоняет.
  const send = async () => {
    const found = validate(name, phone, agree);
    setErrors(found);
    if (Object.keys(found).length > 0 || isLoading) return;
    const result = await createLead({
      name: name.trim(),
      phone: phone.replace(/[^\d+]/g, ''),
      roistat: readRoistatVisitId() || 'n/a',
    });
    track('error' in result ? 'lead_error' : 'lead_submit', { form: source });
  };

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    send();
  };

  const again = () => {
    setName('');
    setPhone('');
    setAgree(false);
    setErrors({});
    reset();
  };

  if (isSuccess) {
    return (
      <div className={styles.card}>
        <div className={styles.result} role="status">
          <p className={styles.resultText}>Спасибо! Менеджер свяжется с тобой в рабочее время</p>
          <button type="button" className={styles.secondary} onClick={again}>
            Отправить ещё
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.card}>
      <form className={styles.form} onSubmit={submit} noValidate>
        <div className={styles.formHead}>
          <h3 className={styles.formTitle}>Посчитаем твой заказ</h3>
          <p className={styles.formLead}>
            Тираж, несколько мест нанесения или шелкография — менеджер позвонит и&nbsp;назовёт точную цену и&nbsp;сроки
          </p>
        </div>
        <div className={styles.field}>
          <label htmlFor="price-name" className={styles.fieldLabel}>Имя</label>
          <input
            id="price-name"
            className={styles.input}
            type="text"
            name="name"
            autoComplete="name"
            maxLength={30}
            placeholder="Как к тебе обращаться"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? 'price-name-error' : undefined}
          />
          {errors.name && <p id="price-name-error" className={styles.error}>{errors.name}</p>}
        </div>
        <div className={styles.field}>
          <label htmlFor="price-phone" className={styles.fieldLabel}>Телефон</label>
          <input
            id="price-phone"
            className={styles.input}
            type="tel"
            name="phone"
            inputMode="tel"
            autoComplete="tel"
            placeholder="+7 (999) 999-99-99"
            value={phone}
            onChange={(event) => setPhone(formatPhone(event.target.value))}
            aria-invalid={Boolean(errors.phone)}
            aria-describedby={errors.phone ? 'price-phone-error' : undefined}
          />
          {errors.phone && <p id="price-phone-error" className={styles.error}>{errors.phone}</p>}
        </div>
        <div className={styles.consent}>
          <ConsentField id="price-agree" tone="dark" checked={agree} onChange={setAgree} error={errors.agree} />
        </div>
        {isError && (
          <div className={styles.failure} role="alert">
            <p className={styles.failureText}>Не удалось отправить. Проверь соединение и попробуй ещё раз</p>
            <button type="button" className={styles.secondary} onClick={send}>Повторить</button>
          </div>
        )}
        <button type="submit" className={styles.submit} disabled={isLoading}>
          {isLoading ? 'Отправляем…' : 'Передать менеджеру'}
        </button>
        <p className={styles.hours}>Отвечаем в рабочее время: {siteContacts.hours.toLowerCase()}</p>
      </form>
    </div>
  );
};

export default PriceForm;
