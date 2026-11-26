import Link from 'next/link';
import styles from './consent-field.module.css';

type Props = {
  id: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  error?: string;
  disabled?: boolean;
  /** dark — для тёмных карточек (форма «Цена»), light — для светлых страниц */
  tone?: 'light' | 'dark';
};

/** Согласие на обработку персональных данных — отдельная галочка; политика конфиденциальности — строкой ниже, без галочки. */
export default function ConsentField({ id, checked, onChange, error, disabled, tone = 'light' }: Props) {
  const errorId = `${id}-error`;
  return (
    <div className={`${styles.root} ${tone === 'dark' ? styles.dark : ''}`}>
      <label className={styles.agree}>
        <input
          id={id}
          type="checkbox"
          className={styles.checkbox}
          checked={checked}
          disabled={disabled}
          onChange={(event) => onChange(event.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? errorId : undefined}
        />
        <span>
          Даю{' '}
          <Link href="/consent" target="_blank" className={styles.link}>
            согласие на обработку персональных данных
          </Link>
        </span>
      </label>
      {error && (
        <p id={errorId} className={styles.error} role="alert">
          {error}
        </p>
      )}
      <p className={styles.note}>
        Отправляя, ты принимаешь{' '}
        <Link href="/privacy" target="_blank" className={styles.link}>
          политику конфиденциальности
        </Link>
      </p>
    </div>
  );
}
