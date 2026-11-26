'use client';
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styles from './modal.module.css';

const focusable = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Окно поверх страницы: подложка, Escape, фокус внутри и возврат на то, что его открыло.
 * Лежит в body — липкая панель покупки создаёт свой слой и спрятала бы окно под шапкой.
 * Содержимое строится при первом открытии и остаётся: уход окна — анимация, а не размонтирование.
 */
const Modal: React.FC<{
  open: boolean;
  onClose: () => void;
  labelledBy: string;
  variant?: 'dialog' | 'full';
  children: React.ReactNode;
}> = ({ open, onClose, labelledBy, variant = 'dialog', children }) => {
  const [mounted, setMounted] = useState(false);
  const [used, setUsed] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    setUsed(true);
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    panelRef.current?.focus();
    document.documentElement.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') return onCloseRef.current();
      if (event.key !== 'Tab' || !panelRef.current) return;
      const items = Array.from(panelRef.current.querySelectorAll<HTMLElement>(focusable));
      if (items.length === 0) return event.preventDefault();
      const [firstItem, lastItem] = [items[0], items[items.length - 1]];
      const current = document.activeElement;
      if (event.shiftKey && (current === firstItem || current === panelRef.current)) {
        event.preventDefault();
        lastItem.focus();
      } else if (!event.shiftKey && current === lastItem) {
        event.preventDefault();
        firstItem.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [open]);

  if (!mounted) return null;
  return createPortal(
    <>
      <div className={styles.backdrop} data-open={open || undefined} onClick={onClose} aria-hidden="true" />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        tabIndex={-1}
        className={styles.panel}
        data-variant={variant}
        data-open={open || undefined}
      >
        {used ? children : null}
      </div>
    </>,
    document.body
  );
};

export default Modal;
