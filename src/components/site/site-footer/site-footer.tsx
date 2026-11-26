import React from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import { siteContacts } from '../contacts';
import { constructorHref, contactsHref } from '../links';
import styles from './site-footer.module.css';

/** Две колонки по четыре: CSS раскладывает по столбцам, поэтому порядок здесь — сверху вниз, потом вправо */
const footerNav = [
  { label: 'Каталог', href: '/shop' },
  { label: 'Услуги', href: '/#methods' },
  { label: 'Методы нанесения', href: '/methods' },
  { label: 'Бонусы', href: '/loyalty' },
  { label: 'О нас', href: '/#about' },
  { label: 'Блог', href: '/blog' },
  { label: 'Как заказать', href: '/howto' },
  { label: 'Контакты', href: contactsHref },
];

const legal = [
  { label: 'Политика конфиденциальности', href: '/privacy' },
  { label: 'Договор оферты', href: '/oferta' },
  { label: 'Реквизиты', href: '/contacts' },
];

const SiteFooter: React.FC = () => (
  <footer className={styles.footer} data-surface="dark" data-source="footer">
    <div className={styles.inner}>
      <div className={styles.top} data-reveal-group>
        <nav className={styles.column} aria-label="Навигация в подвале">
          <p className={styles.caption}>Навигация</p>
          <div className={styles.navList}>
            {footerNav.map((item) => (
              <Link key={item.label} href={item.href} className={styles.navLink}>
                {item.label}
              </Link>
            ))}
          </div>
        </nav>

        <address className={styles.column}>
          <p className={styles.caption}>Контакты</p>
          <span className={styles.contactList}>
            <a href={siteContacts.phoneHref} className={styles.phone}>
              {siteContacts.phone}
            </a>
            <a href={`mailto:${siteContacts.email}`} className={styles.contact}>
              {siteContacts.email}
            </a>
            <span className={styles.contact}>{siteContacts.hours}</span>
            <span className={styles.contact}>{siteContacts.address}</span>
          </span>
          <span className={styles.socials}>
            {siteContacts.socials.map((social) => (
              <a
                key={social.href}
                href={social.href}
                className={styles.social}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.label}
                title={social.label}
              >
                <Icon name={social.icon} size={22} />
              </a>
            ))}
          </span>
        </address>

        <Link href={constructorHref} className={styles.button}>
          Нанести принт
        </Link>
      </div>

      <Link href="/" className={styles.logo} data-reveal aria-label="Пинхэд Студия — на главную">
        <img src="/brand/logo-ru-light.svg" alt="" width={1276} height={184} />
      </Link>

      <div className={styles.legal}>
        <div className={styles.legalLinks}>
          {legal.map((item) => (
            <Link key={item.label} href={item.href} className={styles.legalLink}>
              {item.label}
            </Link>
          ))}
        </div>
        <p className={styles.company}>
          <span>{siteContacts.company}</span>
          <span>ИНН {siteContacts.inn}</span>
          <span>КПП {siteContacts.kpp}</span>
          <span>© 2021–{new Date().getFullYear()}</span>
        </p>
      </div>
    </div>
  </footer>
);

export default SiteFooter;
