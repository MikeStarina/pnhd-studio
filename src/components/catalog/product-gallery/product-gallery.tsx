"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { Icon } from "@/features/constructor/ui/icons";
import { Badge } from "../data";
import GalleryLightbox from "./gallery-lightbox";
import { track } from "@/components/site/analytics";
import styles from "./product-gallery.module.css";

type Photo = { cdn: string; api: string | null };

/**
 * Галерея товара. На компьютере — большое фото и миниатюры под ним (стрелки клавиатуры листают),
 * на телефоне — та же стопка превращается в ленту с прилипанием и точками.
 * Нажатие на большое фото (и Enter/пробел на нём) открывает просмотр на весь экран.
 * Фото не из CDN подменяется запасным адресом API; если и его нет, кадр исчезает из ряда.
 */
const ProductGallery: React.FC<{
  name: string;
  photos: Photo[];
  badges: Badge[];
}> = ({ name, photos, badges }) => {
  const [active, setActive] = useState(0);
  // Сколько раз кадр не загрузился: 1 — переходим на запасной адрес API, 2 — убираем кадр
  const [errors, setErrors] = useState<Record<number, number>>({});
  const [zoomed, setZoomed] = useState(false);
  const openZoom = () => {
    setZoomed(true);
    track('gallery_open', { product: name });
  };
  const strip = useRef<HTMLDivElement>(null);

  const frames = photos.flatMap((photo, index) => {
    const tries = errors[index] ?? 0;
    const src = tries === 0 ? photo.cdn : tries === 1 ? photo.api : null;
    return src ? [{ index, src }] : [];
  });
  const current = Math.min(active, Math.max(frames.length - 1, 0));

  const onError = (index: number, src: string) => {
    setErrors((current) => {
      const tries = current[index] ?? 0;
      const failedSrc = tries === 0 ? photos[index].cdn : photos[index].api;
      return failedSrc === src ? { ...current, [index]: tries + 1 } : current;
    });
  };

  const show = (next: number) => {
    const target = Math.max(0, Math.min(next, frames.length - 1));
    setActive(target);
    const track = strip.current;
    if (track && track.scrollWidth > track.clientWidth) {
      track.scrollTo({ left: target * track.clientWidth, behavior: "smooth" });
    }
  };

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === "ArrowRight") show(current + 1);
    else if (event.key === "ArrowLeft") show(current - 1);
    else if (
      (event.key === "Enter" || event.key === " ") &&
      event.target === strip.current
    )
      openZoom();
    else return;
    event.preventDefault();
  };

  const onScroll = (event: React.UIEvent<HTMLDivElement>) => {
    const track = event.currentTarget;
    if (track.scrollWidth <= track.clientWidth) return;
    setActive(Math.round(track.scrollLeft / track.clientWidth));
  };

  return (
    <>
      <div className={styles.gallery} onKeyDown={onKeyDown}>
        <div className={styles.viewer}>
          <div
            ref={strip}
            className={styles.track}
            onScroll={onScroll}
            onClick={() => openZoom()}
            tabIndex={0}
            role="group"
            aria-roledescription="галерея"
            aria-label={`Фото: ${name}`}
          >
            {frames.map((frame, position) => (
              <div
                key={frame.index}
                className={styles.slide}
                data-active={position === current}
              >
                <Image
                  src={frame.src}
                  alt={`${name}, фото ${position + 1}`}
                  fill
                  priority={position === 0}
                  sizes="(max-width: 1023px) 100vw, 58vw"
                  className={styles.photo}
                  onError={() => onError(frame.index, frame.src)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className={styles.zoom}
            aria-label="Открыть фото на весь экран"
            aria-haspopup="dialog"
            onClick={() => openZoom()}
          >
            <Icon name="expand" size={20} stroke={2} />
          </button>
          {badges.length > 0 && (
            <ul className={styles.badges}>
              {badges.map((badge) => (
                <li
                  key={badge.label}
                  className={styles.badge}
                  data-tone={badge.tone}
                >
                  {badge.label}
                </li>
              ))}
            </ul>
          )}
        </div>

        {frames.length > 1 && (
          <>
            <ul className={styles.thumbs}>
              {frames.map((frame, position) => (
                <li key={frame.index}>
                  <button
                    type="button"
                    className={styles.thumb}
                    aria-label={`Фото ${position + 1}`}
                    aria-current={position === current ? "true" : undefined}
                    onClick={() => show(position)}
                  >
                    <Image
                      src={frame.src}
                      alt=""
                      fill
                      sizes="96px"
                      className={styles.photo}
                    />
                  </button>
                </li>
              ))}
            </ul>
            <ul className={styles.dots} aria-hidden="true">
              {frames.map((frame, position) => (
                <li
                  key={frame.index}
                  className={styles.dot}
                  data-active={position === current}
                />
              ))}
            </ul>
          </>
        )}
      </div>
      <GalleryLightbox
        open={zoomed}
        name={name}
        srcs={frames.map((frame) => frame.src)}
        index={current}
        onIndex={show}
        onClose={() => setZoomed(false)}
      />
    </>
  );
};

export default ProductGallery;
