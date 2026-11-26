'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAppSelector } from '@/redux/redux-hooks';
import { Icon } from '@/features/constructor/ui/icons';
import { siteContacts, siteNav } from '../contacts';
import { businessSiteHref, constructorHref } from '../links';
import styles from './site-header.module.css';

/** Порядковый номер пункта меню: по нему CSS задаёт задержку появления (пункты выезжают друг за другом). */
const stagger = (index: number) => ({ '--i': index }) as React.CSSProperties;

/** Переключатель направления: «Для себя» — этот сайт, «Для бизнеса» — оптовый сайт в новой вкладке. */
const DirectionSwitch: React.FC = () => (
  <nav className={styles.direction} aria-label="Направление">
    <a href={businessSiteHref} className={styles.segment} target="_blank" rel="noopener noreferrer">
      Для бизнеса
      <Icon name="arrowUpRight" size={14} />
      <span className="visually-hidden"> (откроется в новой вкладке)</span>
    </a>
    <span className={styles.segmentCurrent} aria-current="page">
      Для себя
    </span>
  </nav>
);

const SiteHeader: React.FC = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();
  const inConstructor = pathname?.includes('/constructor') ?? false;
  const cartCount = useAppSelector((store) => (store.cart.order?.length ?? 0) + store.cartDesigns.items.length);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    document.documentElement.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.documentElement.style.overflow = '';
      window.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  return (
    <>
      <header className={styles.header} data-source="header">
        <div className={styles.bar}>
          <Link href="/" className={styles.logo} aria-label="Пинхэд Студия — на главную">
            <img src="/brand/logo-ru.svg" alt="" width={192} height={28} />
          </Link>

          <nav className={styles.nav} aria-label="Основное меню">
            {siteNav.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={styles.navLink}
                aria-current={pathname === item.href ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <div className={styles.actions}>
            {/* Номер — скрытым текстом: коллтрекинг подменяет его на странице по источнику и городу */}
            <a href={siteContacts.phoneHref} className={styles.call} title={siteContacts.phone}>
              <Icon name="call" size={20} />
              <span className="visually-hidden">Позвонить в студию: {siteContacts.phone}</span>
            </a>
            <Link href="/cart" className={styles.cart} aria-label={`Корзина, товаров: ${cartCount}`}>
              <Icon name="bag" size={20} />
              {cartCount > 0 && (
                <span className={styles.cartCount} aria-hidden="true">
                  {cartCount}
                </span>
              )}
            </Link>
            <Link href={constructorHref} className={styles.primary}>
              Нанести принт
            </Link>
            <button
              type="button"
              className={styles.burger}
              aria-expanded={menuOpen}
              aria-controls="site-menu"
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span className={menuOpen ? styles.burgerLinesOpen : styles.burgerLines} />
            </button>
          </div>
        </div>
      </header>

      {/* Переключатель — строкой под капсулой, уезжает вместе со страницей. В конструкторе его нет: там экран под шапкой */}
      {!inConstructor && (
        <div className={styles.directionRow}>
          <DirectionSwitch />
        </div>
      )}

      <div
        className={styles.menuBackdrop}
        data-open={menuOpen || undefined}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Меню всегда на странице, чтобы анимировать и открытие, и закрытие; закрытое скрыто через visibility */}
      <div id="site-menu" className={styles.menu} data-open={menuOpen || undefined}>
        <nav className={styles.menuNav} aria-label="Меню">
          {[...siteNav, { label: 'Блог', href: '/blog' }].map((item, i) => (
            <Link
              key={item.label}
              href={item.href}
              className={styles.menuLink}
              style={stagger(i)}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href={constructorHref} className={styles.menuPrimary} style={stagger(siteNav.length + 1)}>
          Нанести принт
        </Link>
        <div className={styles.menuContacts} style={stagger(siteNav.length + 2)}>
          <a href={siteContacts.phoneHref}>{siteContacts.phone}</a>
          <a href={`mailto:${siteContacts.email}`}>{siteContacts.email}</a>
          <span>
            {siteContacts.city}, {siteContacts.hours.toLowerCase()}
          </span>
        </div>
      </div>
    </>
  );
};

export default SiteHeader;
