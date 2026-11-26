'use client';
import React from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/redux-hooks';
import { actions as cartActions } from '@/redux/cart-slice/cart.slice';
import form from '../form/form.module.css';

export type TCheckoutErrors = Partial<Record<'name' | 'surname' | 'phone' | 'email' | 'telegram' | 'city' | 'point' | 'feedback' | 'printFiles' | 'agree', string>>;

/** Телефон в виде «+7 (999) 123-45-67» — тот же разбор, что в форме «Цена» на главной. */
const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, '');
  if (!digits) return '';
  // Первая 7 или 8 — код страны, если номер уже начат с «+7», это первая цифра или цифр больше 10.
  const prefixed = /^[78]/.test(digits) && (value.trim().startsWith('+7') || digits.length === 1 || digits.length > 10);
  const national = (prefixed ? digits.slice(1) : digits).slice(0, 10);
  const [a, b, c, d] = [national.slice(0, 3), national.slice(3, 6), national.slice(6, 8), national.slice(8, 10)];
  return `+7${a ? ` (${a}` : ''}${a.length === 3 ? ')' : ''}${b ? ` ${b}` : ''}${c ? `-${c}` : ''}${d ? `-${d}` : ''}`;
};

const FIELDS = [
  { key: 'name', label: 'Имя', type: 'text', autoComplete: 'given-name', placeholder: 'Как к тебе обращаться' },
  { key: 'surname', label: 'Фамилия', type: 'text', autoComplete: 'family-name', placeholder: 'Для получения заказа' },
  { key: 'phone', label: 'Телефон', type: 'tel', autoComplete: 'tel', placeholder: '+7 (999) 999-99-99' },
  { key: 'telegram', label: 'Ник в Telegram', type: 'text', autoComplete: 'off', placeholder: '@pinhead_fan' },
  { key: 'email', label: 'Почта', type: 'email', autoComplete: 'email', placeholder: 'name@example.ru' },
] as const;

/**
 * Контакты покупателя. Телефон в состоянии хранится как «+79991234567»: так его ждёт сборка заказа
 * (`checkoutOrderObjectCreateFunc` отрезает «+»), а в поле показывается с пробелами и скобками.
 */
const MainUserData: React.FC<{ errors: TCheckoutErrors; disabled: boolean }> = ({ errors, disabled }) => {
  const dispatch = useAppDispatch();
  const userData = useAppSelector((store) => store.cart.userData);

  const change = (key: (typeof FIELDS)[number]['key'], value: string) => {
    const digits = formatPhone(value).replace(/\D/g, '');
    dispatch(cartActions.setUserData({ id: key, value: key === 'phone' ? (digits ? `+${digits}` : '') : value }));
  };

  return (
    <fieldset className={form.section} disabled={disabled}>
      <legend className={form.legend}>
        <span className={form.step}>01</span>
        Контакты
      </legend>
      <div className={form.grid}>
        {FIELDS.map((field) => {
          const id = `checkout-${field.key}`;
          const error = errors[field.key];
          const value = field.key === 'phone' ? formatPhone(userData.phone) : userData[field.key];
          return (
            <div className={form.field} key={field.key}>
              <label htmlFor={id} className={form.label}>
                {field.label}
              </label>
              <input
                id={id}
                className={form.input}
                type={field.type}
                inputMode={field.type === 'tel' ? 'tel' : undefined}
                autoComplete={field.autoComplete}
                placeholder={field.placeholder}
                maxLength={field.key === 'email' || field.key === 'telegram' ? 100 : 40}
                autoCapitalize={field.key === 'telegram' ? 'none' : undefined}
                spellCheck={field.key === 'telegram' ? false : undefined}
                value={value}
                onChange={(event) => change(field.key, event.target.value)}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? `${id}-error` : undefined}
              />
              {error && (
                <p id={`${id}-error`} className={form.error}>
                  {error}
                </p>
              )}
            </div>
          );
        })}
      </div>
    </fieldset>
  );
};

export default MainUserData;
