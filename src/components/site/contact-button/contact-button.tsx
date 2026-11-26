'use client';

import { useEffect, useId, useRef, useState } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import TelegramLink from '@/components/shared-components/telegram-link/telegram-link';
import { Icon } from '@/features/constructor/ui/icons';
import { siteContacts } from '@/components/site/contacts';
import tg from '../../../../public/tg_logo.svg';
import styles from './contact-button.module.css';

const ContactButton = () => {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [onDark, setOnDark] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => setOpen(false), [pathname]);

  // Над чёрным блоком кнопка и карточка инвертируются
  useEffect(() => {
    let frame = 0;
    const check = () => {
      frame = 0;
      const button = buttonRef.current;
      if (button) setOnDark(isDarkBehind(button, rootRef.current));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(check);
    };
    schedule();
    // Блоки появляются при скролле и подгружаются после перехода — перепроверяем, когда страница устоялась
    const settle = window.setTimeout(schedule, 1200);
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.clearTimeout(settle);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setOpen(false);
      buttonRef.current?.focus();
    };
    const onPointer = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointer);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointer);
    };
  }, [open]);

  if (pathname?.includes('/constructor')) return null;

  const close = () => setOpen(false);

  return (
    <div ref={rootRef} className={styles.root} data-open={open || undefined} data-on-dark={onDark || undefined}>
      <div id={menuId} className={styles.menu} role="group" aria-label="Написать нам">
        <p className={styles.title}>Ответим в мессенджере</p>
        <TelegramLink className={styles.link} onClick={close}>
          <span className={styles.mark}>
            <Image src={tg} alt="" width={16} height={14} />
          </span>
          Telegram
          <Icon name="arrowUpRight" size={20} className={styles.arrow} />
        </TelegramLink>
        <a className={styles.link} href={siteContacts.maxHref} target="_blank" rel="noopener noreferrer" onClick={close}>
          <span className={styles.mark}>
            <Icon name="max" size={19} />
          </span>
          MAX
          <Icon name="arrowUpRight" size={20} className={styles.arrow} />
        </a>
      </div>
      <button
        ref={buttonRef}
        type="button"
        className={styles.button}
        aria-label="Написать нам"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <Icon name="chat" size={24} className={styles.iconChat} />
        <Icon name="close" size={24} className={styles.iconClose} />
      </button>
    </div>
  );
};

/**
 * Над чёрным ли блоком кнопка. Решает блок во всю ширину с data-surface="dark" (чёрная секция, бегущая строка,
 * подвал), а не цвет под точкой: карточки, фото и цветные панели внутри блоков кнопку не перекрашивают.
 */
function isDarkBehind(button: HTMLElement, root: HTMLElement | null): boolean {
  const { left, top, width, height } = button.getBoundingClientRect();
  const layer = document.elementsFromPoint(left + width / 2, top + height / 2).find((el) => !root?.contains(el));
  return Boolean(layer?.closest('[data-surface="dark"]'));
}

export default ContactButton;
