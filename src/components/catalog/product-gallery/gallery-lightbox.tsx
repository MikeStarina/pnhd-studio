'use client';
import React, { useEffect, useRef } from 'react';
import Image from 'next/image';
import { Icon } from '@/features/constructor/ui/icons';
import Modal from '../modal/modal';
import styles from './gallery-lightbox.module.css';

const SWIPE_DISTANCE = 48;

/** Просмотр фото на весь экран: фото целиком, стрелки, свайп, счётчик. */
const GalleryLightbox: React.FC<{
  open: boolean;
  name: string;
  srcs: string[];
  /** Подписи кадров (alt); по умолчанию «<name>, фото N» */
  alts?: string[];
  /** Картинки из памяти браузера (blob:) — показываем как есть, оптимизатор Next их не берёт */
  unoptimized?: boolean;
  index: number;
  onIndex: (next: number) => void;
  onClose: () => void;
}> = ({ open, name, srcs, alts, unoptimized = false, index, onIndex, onClose }) => {
  const swipeFrom = useRef<number | null>(null);
  const last = srcs.length - 1;

  const go = (next: number) => onIndex(Math.max(0, Math.min(next, last)));
  const goRef = useRef(go);
  goRef.current = go;
  const indexRef = useRef(index);
  indexRef.current = index;

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowRight') goRef.current(indexRef.current + 1);
      else if (event.key === 'ArrowLeft') goRef.current(indexRef.current - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const onPointerUp = (event: React.PointerEvent) => {
    if (swipeFrom.current === null) return;
    const distance = event.clientX - swipeFrom.current;
    swipeFrom.current = null;
    if (Math.abs(distance) >= SWIPE_DISTANCE) go(index + (distance < 0 ? 1 : -1));
  };

  return (
    <Modal open={open} onClose={onClose} labelledBy="gallery-lightbox-title" variant="full">
      <h2 id="gallery-lightbox-title" className="visually-hidden">
        Фото: {name}
      </h2>
      <div
        className={styles.stage}
        onClick={(event) => event.target === event.currentTarget && onClose()}
        onPointerDown={(event) => (swipeFrom.current = event.clientX)}
        onPointerUp={onPointerUp}
        onPointerCancel={() => (swipeFrom.current = null)}
      >
        {srcs.map((src, position) => (
          <Image
            key={src}
            src={src}
            alt={alts?.[position] ?? `${name}, фото ${position + 1}`}
            fill
            unoptimized={unoptimized}
            sizes="100vw"
            loading="eager"
            className={styles.photo}
            data-active={position === index}
            aria-hidden={position !== index}
            draggable={false}
          />
        ))}
      </div>

      <button type="button" className={styles.close} aria-label="Закрыть просмотр" onClick={onClose}>
        <Icon name="close" size={20} stroke={2} />
      </button>

      {last > 0 && (
        <>
          <p className={styles.counter} role="status" aria-live="polite">
            <span className="visually-hidden">Фото </span>
            {index + 1} / {srcs.length}
          </p>
          <button
            type="button"
            className={styles.arrow}
            data-side="prev"
            aria-label="Предыдущее фото"
            disabled={index === 0}
            onClick={() => go(index - 1)}
          >
            <Icon name="chevronLeft" size={24} stroke={2} />
          </button>
          <button
            type="button"
            className={styles.arrow}
            data-side="next"
            aria-label="Следующее фото"
            disabled={index === last}
            onClick={() => go(index + 1)}
          >
            <Icon name="chevronRight" size={24} stroke={2} />
          </button>
        </>
      )}
    </Modal>
  );
};

export default GalleryLightbox;
