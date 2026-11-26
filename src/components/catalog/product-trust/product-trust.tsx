import React from 'react';
import { Icon, type IconName } from '@/features/constructor/ui/icons';
import { REVIEWS_URL } from '@/components/home/reviews/reviews';
import type { YandexRating } from '@/components/home/reviews/yandex-reviews';
import styles from './product-trust.module.css';

// Факты — с главной (hero, «Как получить заказ»): минимальный тираж, срочная печать, способы получения, бонусы
const facts: { icon: IconName; text: React.ReactNode }[] = [
  { icon: 'clock', text: <>Готово от&nbsp;15&nbsp;минут</> },
  { icon: 'tshirt', text: <>Печать от&nbsp;1&nbsp;штуки</> },
  { icon: 'mapPin', text: <>Самовывоз или доставка по&nbsp;РФ</> },
  { icon: 'discount', text: <>Оплата бонусами до&nbsp;50%</> },
];

/** Блок доверия под кнопками покупки: четыре обещания студии и ссылка на отзывы с оценкой, если Яндекс её отдал. */
const ProductTrust: React.FC<{ rating: YandexRating | null }> = ({ rating }) => (
  <div className={styles.trust}>
    <ul className={styles.facts} aria-label="Условия заказа">
      {facts.map(({ icon, text }, index) => (
        <li key={index} className={styles.fact}>
          <Icon name={icon} size={24} stroke={1.5} />
          <span>{text}</span>
        </li>
      ))}
    </ul>
    <a className={styles.reviews} href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">
      {rating && (
        <span className={styles.score}>
          <span className={styles.star}>
            <Icon name="star" size={16} />
          </span>
          {rating.score.toLocaleString('ru', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
        </span>
      )}
      Отзывы на&nbsp;Яндекс Картах
      <Icon name="arrowUpRight" size="1.25em" stroke={2} />
      <span className="visually-hidden"> (откроется в новой вкладке)</span>
    </a>
  </div>
);

export default ProductTrust;
