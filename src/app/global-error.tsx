'use client';
import React, { useEffect } from 'react';
import '@fontsource-variable/roboto-condensed/wght.css';
import './globals.css';
import { siteContacts } from '@/components/site/contacts';
import StatusScreen from '@/components/site/status-screen/status-screen';

/** Сбой самого каркаса (layout): шапки и подвала нет, страница рисуется с нуля. */
export default function GlobalError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="ru">
      <body>
        <StatusScreen
          tone="problem"
          title={<>Что-то пошло не&nbsp;так</>}
          text={
            <>
              Сайт не&nbsp;загрузился. Попробуй ещё раз через минуту. Если не&nbsp;выйдет, позвони нам:{' '}
              <a href={siteContacts.phoneHref}>{siteContacts.phone}</a>
            </>
          }
          note={`Работаем ${siteContacts.hours.toLowerCase()}`}
          actions={[
            { label: 'Попробовать ещё раз', onClick: reset },
            { label: 'На главную', href: '/' },
          ]}
        />
      </body>
    </html>
  );
}
