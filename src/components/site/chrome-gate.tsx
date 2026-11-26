'use client';
import React from 'react';
import { usePathname } from 'next/navigation';

/**
 * Скрывает обвязку сайта там, где она мешает: на входе — шапку и подвал,
 * в конструкторе — только подвал (шапка остаётся, чтобы можно было вернуться на сайт).
 */
const ChromeGate: React.FC<{ part: 'header' | 'footer'; children: React.ReactNode }> = ({ part, children }) => {
  const pathname = usePathname() ?? '';
  const inConstructor = pathname.includes('/constructor');
  const bare =
    pathname.startsWith('/auth') ||
    (inConstructor && (part === 'footer' || pathname !== '/constructor'));
  return bare ? null : <>{children}</>;
};

export default ChromeGate;
