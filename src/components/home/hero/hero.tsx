'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/features/constructor/ui/icons';
import { constructorHref } from '../../site/links';
import styles from './hero.module.css';

const badgeText = 'Реализуем смелые идеи на твоей одежде ✦ ';

/** Вещи мини-конструктора: мокап из конструктора и белый вариант из каталога, с которым он откроется. */
const garments = [
  { id: 'tshirt', label: 'Футболка', mockup: '/home/constructor/tshirt_regular.webp', slug: 'futbolka-regular-belaya' },
  { id: 'hoodie', label: 'Худи', mockup: '/home/constructor/hoodie.webp', slug: 'hudi-classic-belyj-man' },
  { id: 'longsleeve', label: 'Лонгслив', mockup: '/home/constructor/longsleeve.webp', slug: 'longsliv-classic-belyj-woman' },
];

const steps = ['Выбери одежду из каталога', 'Расположи принт', 'Оформи заказ', 'Дождись и забери заказ'];

const Hero: React.FC = () => {
  const [garmentId, setGarmentId] = useState('hoodie');
  const garment = garments.find((item) => item.id === garmentId) ?? garments[0];
  const garmentHref = `${constructorHref}?product=${garment.slug}`;

  return (
    <section className={styles.section} aria-labelledby="hero-title">
      <div className={styles.inner}>
        <div className={styles.top} data-reveal-group>
          <h1 id="hero-title" className={styles.title}>
            <span className={styles.kicker}>Печать на&nbsp;одежде в&nbsp;Санкт-Петербурге</span>{' '}
            <span className={styles.lineOne}>Печать твоей</span>{' '}
            <span className={styles.lineTwo}>
              идеи <span className={styles.titlePill}>от&nbsp;1&nbsp;шт.</span>
            </span>{' '}
            <span className={styles.lineThree}>на&nbsp;любой</span> <span className={styles.lineFour}>одежде</span>
          </h1>

          <aside className={styles.about}>
            <img src="/home/scribble-asterisk.svg" alt="" className={styles.aboutScribble} />
            <Link href="/#about" className={styles.aboutPill}>
              Печатаем с&nbsp;2015&nbsp;года
            </Link>
            <p className={styles.aboutText}>
              Пинхэд Студия&nbsp;— печать на&nbsp;одежде с&nbsp;2015&nbsp;года. Своя вещь или наша, от&nbsp;1&nbsp;штуки&nbsp;—
              изделие готово от&nbsp;15&nbsp;минут.
            </p>
          </aside>
        </div>

        <div className={styles.bottom} data-reveal-group>
          <div className={styles.mini}>
            {/* Круглая «наклейка» сидит на правом верхнем углу мини-конструктора — как в макете */}
            <span className={styles.badge} aria-hidden="true">
              <svg viewBox="0 0 160 160" className={styles.badgeRing}>
                <defs>
                  <path id="hero-badge-path" d="M80,80 m-62,0 a62,62 0 1,1 124,0 a62,62 0 1,1 -124,0" />
                </defs>
                <text className={styles.badgeText}>
                  <textPath href="#hero-badge-path" textLength="388">
                    {badgeText}
                  </textPath>
                </text>
              </svg>
              <span className={styles.badgeStar} />
            </span>

            <div className={styles.miniChips} role="radiogroup" aria-label="Вещь для принта">
              {garments.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  role="radio"
                  aria-checked={item.id === garmentId}
                  className={styles.chip}
                  onClick={() => setGarmentId(item.id)}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className={styles.miniBody}>
              <div className={styles.miniPhoto}>
                {garments.map((item) => (
                  <img
                    key={item.id}
                    src={item.mockup}
                    alt={item.id === garmentId ? item.label : ''}
                    className={styles.miniMockup}
                    data-active={item.id === garmentId || undefined}
                  />
                ))}
              </div>
              <div className={styles.miniActions}>
                {/* Загрузка — в самом конструкторе: зона ведёт туда с выбранной вещью */}
                <Link href={garmentHref} className={styles.dropzone}>
                  <Icon name="upload" size={24} />
                  Загрузить принт
                </Link>
                <Link href={garmentHref} className={styles.miniOpen}>
                  Открыть
                  <Icon name="arrowRight" size={16} />
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.order}>
            <ol className={styles.steps} aria-label="Как собрать заказ">
              {steps.map((step, i) => (
                <li key={step} className={styles.step}>
                  {i + 1}. {step}
                </li>
              ))}
            </ol>
            <div className={styles.orderMain}>
              <div className={styles.orderCopy}>
                <p className={styles.orderTitle}>Создай собственную одежду с&nbsp;уникальными принтами</p>
                <p className={styles.orderText}>Почувствуй себя дизайнером и&nbsp;собери свою вещь в&nbsp;онлайн-конструкторе</p>
                <Link href={constructorHref} className={styles.orderButton}>
                  Перейти в&nbsp;конструктор
                  <Icon name="arrowRight" size={16} />
                </Link>
              </div>
              <Link href={constructorHref} className={styles.orderArrow} aria-hidden="true" tabIndex={-1}>
                <img src="/home/arrow-thin.svg" alt="" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
