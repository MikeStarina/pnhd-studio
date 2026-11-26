'use client';
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import s from './constructor.module.css';
import { useDismiss } from './useDismiss';

/** Подтверждение «Очистить всё»: удаляются слои всех сторон; изделие, цвет и размеры остаются. */
export function ClearPrompt({ count, onConfirm, onCancel }: { count: number; onConfirm: () => void; onCancel: () => void }) {
  const { leaving, dismiss } = useDismiss();
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') dismiss(onCancel); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dismiss, onCancel]);
  // Окно открывается из панели слоёв, а у панели на телефоне анимация со сдвигом: fixed внутри неё считается
  // от панели, и ручка листа с шапкой сайта ложатся поверх окна. Поэтому окно — в корне конструктора (там его переменные).
  return createPortal(
    <div className={s.modalBg} data-leaving={leaving || undefined} onClick={(e) => { if (e.target === e.currentTarget) dismiss(onCancel); }}>
      <div className={s.modal} role="dialog" aria-label="Очистить всё?">
        <h3>Очистить всё?</h3>
        <p className={s.muted}>
          Удалим все слои на всех сторонах ({count}). Изделие, цвет и размеры останутся. Это можно отменить кнопкой «Отменить».
        </p>
        <button type="button" className={s.btnDanger} onClick={() => dismiss(onConfirm)}>Очистить всё</button>
        <button type="button" className={s.btn} onClick={() => dismiss(onCancel)} autoFocus>Оставить</button>
      </div>
    </div>,
    document.querySelector(`.${s.app}`) ?? document.body,
  );
}
