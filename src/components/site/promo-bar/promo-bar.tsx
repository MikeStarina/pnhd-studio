'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Icon } from '@/features/constructor/ui/icons';
import { PROMO_ENDS_AT, PROMO_TEXT, promoActive } from '@/features/constructor/config/promo';
import { constructorHref } from '../links';
import { CATALOG_CATEGORIES } from '@/components/catalog/data';
import styles from './promo-bar.module.css';

/** Скрытая заглушка той же ширины, что отсчёт, — пока браузер не посчитал время */
const PLACEHOLDER = '0 дней 00:00:00';

/** Где видна полоса: главная, каталог с разделами и страницы товаров. В конструкторе цены со скидкой и так на виду */
const shownOn = (pathname: string) =>
  pathname === '/' || pathname === '/shop' || pathname.startsWith('/shop/') && !pathname.endsWith('/constructor') ||
  CATALOG_CATEGORIES.some((category) => pathname === category.href);

const pad = (n: number) => String(n).padStart(2, '0');

const daysWord = (n: number) => {
  const d = n % 10, h = n % 100;
  return d === 1 && h !== 11 ? 'день' : d >= 2 && d <= 4 && (h < 12 || h > 14) ? 'дня' : 'дней';
};

/** Сколько осталось до конца акции: «3 дня 05:12:44», в последние сутки — только часы */
const left = (now: number) => {
  const s = Math.max(0, Math.floor((PROMO_ENDS_AT - now) / 1000));
  const days = Math.floor(s / 86400);
  const clock = `${pad(Math.floor((s % 86400) / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
  return days ? `${days} ${daysWord(days)} ${clock}` : clock;
};

/**
 * Полоса акции над шапкой (главная, каталог, товары): скидка в конструкторе и обратный отсчёт до конца. Вся полоса — ссылка в конструктор.
 * Отсчёт считается только в браузере: до этого место под ним занято, чтобы полоса не прыгала. После конца акции полосы нет.
 * Первая отрисовка в браузере повторяет решение сервера (`initiallyActive`), иначе при расхождении часов полоса
 * не совпала бы с HTML сервера; дальше решают часы посетителя.
 */
const PromoBar: React.FC<{ initiallyActive: boolean }> = ({ initiallyActive }) => {
  const pathname = usePathname();
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    setNow(Date.now());
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (!shownOn(pathname) || !(now === null ? initiallyActive : promoActive(now))) return null;

  return (
    <Link
      href={constructorHref}
      className={styles.bar}
      data-promo-bar
      data-source="promo-bar"
      aria-label={`${PROMO_TEXT.bar}, на трикотаж, до 30 ноября. Открыть конструктор`}
    >
      <span className={styles.inner} aria-hidden="true">
        <span className={styles.badge}>{PROMO_TEXT.badge}</span>
        <span className={styles.textLong}>{PROMO_TEXT.barLong}</span>
        <span className={styles.textShort}>{PROMO_TEXT.barShort}</span>
        <span className={styles.timer}>
          <span className={styles.timerLabel}>до конца</span>
          <time className={styles.clock} dateTime={new Date(PROMO_ENDS_AT).toISOString()} data-ready={now !== null || undefined}>
            {now === null ? PLACEHOLDER : left(now)}
          </time>
        </span>
        <span className={styles.arrow}>
          <Icon name="arrowRight" size={18} stroke={2} />
        </span>
      </span>
    </Link>
  );
};

export default PromoBar;
