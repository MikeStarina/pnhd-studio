'use client';
import React, { useEffect } from 'react';
import { siteContacts } from '@/components/site/contacts';
import StatusScreen from '@/components/site/status-screen/status-screen';

/** Сбой страницы: шапка и подвал остаются, вместо содержимого — объяснение и повтор. */
export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <StatusScreen
      tone="problem"
      title={<>Что-то пошло не&nbsp;так</>}
      text={
        <>
          Страница не&nbsp;загрузилась. Попробуй ещё раз&nbsp;— обычно это помогает. Если не&nbsp;выйдет, позвони нам:{' '}
          <a href={siteContacts.phoneHref}>{siteContacts.phone}</a>
        </>
      }
      note={`Работаем ${siteContacts.hours.toLowerCase()}`}
      actions={[
        { label: 'Попробовать ещё раз', onClick: reset },
        { label: 'На главную', href: '/' },
      ]}
    />
  );
}
