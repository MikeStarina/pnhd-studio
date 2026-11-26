'use client';
import { useEffect, useRef, useState } from 'react';
import { photosOf } from '../api/catalog';
import type { Garment } from '../model/types';
import s from './constructor.module.css';
import m from './modelInfo.module.css';
import { Icon } from './icons';
import { useDismiss } from './useDismiss';

/** Описание модели: первое непустое среди цветов (у цветов одной модели оно почти всегда одинаковое). */
export const descriptionOf = (g: Garment) => g.variants.find((v) => v.description)?.description ?? '';

const FOCUSABLE = 'button, [href], [tabindex]:not([tabindex="-1"])';

/** Окно «Фото вживую»: галерея фото модели и описание из каталога. Текст выводится как текст, не как HTML. */
export function ModelInfo({ garment, onClose }: { garment: Garment; onClose: () => void }) {
  const { leaving, dismiss } = useDismiss();
  const close = () => dismiss(onClose);
  const photos = photosOf(garment);
  const text = descriptionOf(garment);
  const [index, setIndex] = useState(0);
  const dialog = useRef<HTMLDivElement>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const closeRef = useRef(close);
  closeRef.current = close;

  useEffect(() => {
    closeBtn.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== 'Tab' || !dialog.current) return;
      // Фокус не уходит за окно: Tab по кругу внутри него.
      const items = [...dialog.current.querySelectorAll<HTMLElement>(FOCUSABLE)];
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, []);

  return (
    <div className={`${s.modalBg} ${m.bg}`} data-leaving={leaving || undefined} onClick={close}>
      <div ref={dialog} className={m.card} role="dialog" aria-modal="true" aria-label={garment.name} onClick={(e) => e.stopPropagation()}>
        <button ref={closeBtn} className={m.close} onClick={close} aria-label="Закрыть"><Icon name="close" size={20} stroke={2} /></button>
        <h3 className={m.title}>{garment.name}</h3>
        {photos.length > 0 && (
          <div className={m.gallery}>
            <div className={m.stage}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img key={photos[index]} src={photos[index]} alt={`${garment.name}, фото ${index + 1} из ${photos.length}`} draggable={false} />
            </div>
            {photos.length > 1 && (
              <div className={m.thumbs}>
                {photos.map((src, i) => (
                  <button
                    key={src} className={i === index ? m.thumbActive : m.thumb} aria-label={`Фото ${i + 1}`}
                    aria-current={i === index || undefined} onClick={() => setIndex(i)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" loading="lazy" draggable={false} />
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
        {text && <p className={m.text}>{text}</p>}
      </div>
    </div>
  );
}
