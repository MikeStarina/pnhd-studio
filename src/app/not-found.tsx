import React from 'react';
import StatusScreen from '@/components/site/status-screen/status-screen';

const NotFound: React.FC = () => (
  <StatusScreen
    tone="problem"
    title={<>Такой страницы нет</>}
    text={<>Возможно, адрес изменился или в&nbsp;ссылке опечатка. Начни с&nbsp;главной или загляни в&nbsp;каталог.</>}
    actions={[
      { label: 'На главную', href: '/' },
      { label: 'В каталог', href: '/shop' },
    ]}
  />
);

export default NotFound;
