'use client';
import React, { useEffect, useState } from 'react';
import { readOrderNumbers } from '../checkout/sent-orders';

/** Номера заявок на изделия со своим принтом: по ним покупатель называет заказ менеджеру. */
const OrderNumbers: React.FC = () => {
  const [numbers, setNumbers] = useState<string[]>([]);
  useEffect(() => setNumbers(readOrderNumbers()), []);
  if (!numbers.length) return null;
  return (
    <>
      <strong>{numbers.length > 1 ? 'Номера заявок' : 'Номер заявки'}: {numbers.join(', ')}.</strong>{' '}
    </>
  );
};

export default OrderNumbers;
