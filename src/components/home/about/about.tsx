import React from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import Section from '../section/section';
import { siteContacts } from '../../site/contacts';
import { constructorHref } from '../../site/links';
import RouteLink from './route-link';
import styles from './about.module.css';

// Карта грузится только в браузере; если она не загрузилась, остаётся подложка с адресом.
const AboutMap = dynamic(() => import('./about-map'), { ssr: false });

const mapLink = `https://yandex.ru/maps/?text=${encodeURIComponent(siteContacts.address)}`;

const stats = [
  { value: 'с 2015', caption: 'делаем одежду с принтом' },
  { value: 'от 1 шт.', caption: 'минимальный тираж' },
];


const About: React.FC = () => (
  <Section tone="white" id="about" labelledBy="about-title">
    {/* Видимой метки над блоком нет; название остаётся для экранных дикторов и структуры страницы */}
    <h2 id="about-title" className="visually-hidden">
      О нас и контакты
    </h2>

    <div className={styles.row} data-reveal-group>
      <div className={styles.about}>
        <span className={styles.mark} aria-hidden="true" />
        <p className={styles.lead}>
          Студия печати на&nbsp;одежде в&nbsp;центре Петербурга. Делаем яркие принты на&nbsp;любом текстиле: от&nbsp;скромного логотипа до&nbsp;сложных изображений на&nbsp;всей поверхности вещи
        </p>
        <dl className={styles.stats}>
          {stats.map((stat) => (
            <div key={stat.caption} className={styles.stat}>
              <dt className={styles.statValue}>{stat.value}</dt>
              <dd className={styles.statCaption}>{stat.caption}</dd>
            </div>
          ))}
        </dl>
        <Link href={constructorHref} className={styles.button}>
          Нанести принт&nbsp;<Icon name="arrowRight" size="1.25em" stroke={2} />
        </Link>
      </div>

      {/* Сюда ведут все ссылки «Контакты» (contactsHref) */}
      <div id="contacts" className={styles.contacts}>
        <div className={styles.primary}>
          <a href={siteContacts.phoneHref} className={styles.phone}>
            {siteContacts.phone}
          </a>
          <a href={`mailto:${siteContacts.email}`} className={styles.email}>
            {siteContacts.email}
          </a>
        </div>
        <dl className={styles.details}>
          <div>
            <dt>Адрес</dt>
            <dd>
              {siteContacts.address}
              <RouteLink />
            </dd>
          </div>
          <div>
            <dt>Часы работы</dt>
            <dd>{siteContacts.hours}</dd>
          </div>
        </dl>
        {/* Карта рядом с адресом — занимает свободное место карточки */}
        <div className={styles.map}>
          <div className={styles.fallback}>
            <p>{siteContacts.address}</p>
          </div>
          <AboutMap />
          <a href={mapLink} className={styles.mapLink} target="_blank" rel="noopener noreferrer">
            Открыть в Картах
          </a>
        </div>
        <div className={styles.socials}>
          {siteContacts.socials.map((social) => (
            <a key={social.href} href={social.href} className={styles.social} target="_blank" rel="noopener noreferrer">
              <Icon name={social.icon} size={20} />
              {social.label}
            </a>
          ))}
        </div>
      </div>
    </div>
  </Section>
);

export default About;
