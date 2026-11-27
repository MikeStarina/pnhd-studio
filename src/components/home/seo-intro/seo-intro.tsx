import React from 'react';
import Link from 'next/link';
import Section from '../section/section';
import SectionHead from '../section-head/section-head';
import Facts, { type Fact } from '../facts/facts';
import Marquee from '../marquee/marquee';
import styles from './seo-intro.module.css';

const methodsLine = ['Принт', 'Вышивка', 'DTF', 'DTG', 'Шелкография'];

// Изделия — ссылки на страницы категорий: с главной поисковик и человек идут прямо в нужный раздел
const products = [
  { title: 'футболках', href: '/futbolki' },
  { title: 'худи', href: '/hudi' },
  { title: 'свитшотах', href: '/svitshoty' },
  { title: 'лонгсливах', href: '/longslivy' },
  { title: 'шопперах', href: '/shoppery' },
  { title: 'кепках', href: '/kepki' },
];

// Факты — с живой главной studio.pnhd.ru и страницы /loyalty; минимальная цена — из таблицы цен (DTG, А6 на белом)
const promises: Fact[] = [
  {
    prefix: 'от',
    value: '400',
    unit: '₽',
    text: <>за&nbsp;принт формата А6. На&nbsp;твоей вещи&nbsp;— та&nbsp;же цена</>,
    link: { href: '#price', label: 'Все цены' },
  },
  { value: '0', unit: '₽', text: <>за&nbsp;помощь дизайнера: вместе поправим, где и&nbsp;как встанет рисунок</> },
  { value: '15', unit: 'мин', text: <>ждать звонка после заявки в&nbsp;рабочее время. Назовём цену и&nbsp;срок</>, link: { href: '#price', label: 'Оставить заявку' } },
  { prefix: 'до', value: '50', unit: '%', text: <>заказа можно оплатить бонусами. 500&nbsp;бонусов&nbsp;— сразу за&nbsp;регистрацию</>, link: { href: '/loyalty', label: 'Про бонусы' } },
];

/** Второй блок главной: начинается с бегущей строки, ниже — шапка по центру и четыре обещания студии. */
const SeoIntro: React.FC = () => (
  <Section
    tone="white"
    id="studio"
    labelledBy="seo-intro-title"
    fitScreen
    strip={<Marquee items={methodsLine} tone="black" label="Что мы делаем" />}
  >
    <SectionHead
      titleId="seo-intro-title"
      title={<>Напечатаем твой принт на&nbsp;любой вещи</>}
      centered
      lead={
        <>
          Печатаем на{' '}
          {products.map((product, i) => (
            <React.Fragment key={product.href}>
              {i > 0 && (i === products.length - 1 ? ' и ' : ', ')}
              <Link href={product.href} className={styles.link}>
                {product.title}
              </Link>
            </React.Fragment>
          ))}{' '}
          в&nbsp;Санкт-Петербурге.
          <br />
          Подарок в&nbsp;одном экземпляре, вещи для друзей или тираж для команды&nbsp;— от&nbsp;одной штуки до&nbsp;тысяч.
        </>
      }
      readOnScroll
    />
    <Facts items={promises} />
  </Section>
);

export default SeoIntro;
