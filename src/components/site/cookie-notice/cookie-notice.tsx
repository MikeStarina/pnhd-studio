'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ANALYTICS_OFF_KEY, COOKIE_SEEN_KEY, METRIKA_ID } from '../analytics';
import styles from './cookie-notice.module.css';

/** На страницах документов уведомление не мешает их читать. */
const QUIET_PATHS = ['/privacy', '/oferta'];

const read = (key: string) => {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
};

const write = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {
    // приватный режим: ответ действует до перезагрузки страницы
  }
};

/**
 * Уведомление о cookie и Метрике. Метрика, Roistat и коллтрекинг UIS работают, пока посетитель не отказался;
 * после отказа загрузчики в layout их не запускают (со следующей загрузки страницы), а события конструктора не отправляются.
 */
const CookieNotice: React.FC = () => {
  const pathname = usePathname();
  // Хранилище читаем после монтирования: первый кадр на сервере и в браузере одинаковый.
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setOpen(!read(COOKIE_SEEN_KEY));
  }, []);

  const answer = (refuse: boolean) => {
    write(COOKIE_SEEN_KEY, 'AGREED');
    if (refuse) {
      write(ANALYTICS_OFF_KEY, '1');
      // Штатный способ остановить уже загруженный счётчик Метрики.
      (window as unknown as Record<string, boolean>)[`disableYaCounter${METRIKA_ID}`] = true;
    }
    setOpen(false);
  };

  if (!open || QUIET_PATHS.includes(pathname ?? '')) return null;

  return (
    <section className={styles.notice} aria-label="Уведомление о cookie">
      <p className={styles.text}>
        Мы используем cookie и&nbsp;Яндекс Метрику, чтобы сайт работал и&nbsp;становился удобнее. Подробнее&nbsp;—
        в&nbsp;<Link href="/privacy">политике конфиденциальности</Link>.
      </p>
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={() => answer(true)}>
          Отказаться
        </button>
        <button type="button" className={styles.primary} onClick={() => answer(false)}>
          Хорошо
        </button>
      </div>
    </section>
  );
};

export default CookieNotice;
