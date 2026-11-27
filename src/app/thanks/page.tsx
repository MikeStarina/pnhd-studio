import React from 'react';
import { redirect } from 'next/navigation';
import { siteContacts } from '@/components/site/contacts';
import OrderNumbers from './order-numbers';
import OrderItems from './order-items';
import StatusScreen from '@/components/site/status-screen/status-screen';

/** Страница после оформления заказа. Без `?from=checkout` (прямой заход) — на главную. */
const Page: React.FC<{ searchParams: { [n: string]: string | undefined } }> = ({ searchParams }) => {
  if (searchParams.from !== 'checkout') redirect('/');

  return (
    <StatusScreen
      tone="success"
      title={<>Спасибо за&nbsp;заказ</>}
      text={
        <>
          <OrderNumbers />
          Менеджер свяжется с&nbsp;тобой в&nbsp;течение 15&nbsp;минут в&nbsp;рабочее время, подтвердит заказ
          и&nbsp;пришлёт ссылку на&nbsp;оплату.
        </>
      }
      note={`Работаем ${siteContacts.hours.toLowerCase()}`}
      actions={[
        { label: 'Вернуться в каталог', href: '/shop' },
        { label: 'На главную', href: '/' },
      ]}
    >
      <OrderItems />
    </StatusScreen>
  );
};

export default Page;
