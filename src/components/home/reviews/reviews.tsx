import { feedbackArr } from '@/app/utils/constants'
import { Icon } from '@/features/constructor/ui/icons'
import Section from '../section/section'
import SectionHead from '../section-head/section-head'
import styles from './reviews.module.css'
import { YANDEX_ORG_ID, getYandexReviews } from './yandex-reviews'

export const REVIEWS_URL = `https://yandex.ru/profile/${YANDEX_ORG_ID}`

/* Рядом с оценкой — бенто 3×2, свежие первыми: слева направо, сверху вниз */
const SHOWN = 4

const plural = new Intl.PluralRules('ru')
const countLabel = (n: number, forms: { one: string; few: string; many: string }) => {
  const form = plural.select(n)
  return `${n.toLocaleString('ru')} ${form === 'one' || form === 'few' ? forms[form] : forms.many}`
}

/* Свои отзывы — запасные: на случай, если Яндекс не ответил. Оценки и даты у них нет — звёзды не рисуем */
const ownReviews = feedbackArr.map(({ name, feedback }) => ({ name, text: feedback, date: undefined, stars: undefined }))

/* Пять звёзд, из них value закрашены; число — для читалок экрана */
const Stars = ({ value, size }: { value: number; size: number }) => (
  <span className={styles.stars}>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} className={i < value ? undefined : styles.starEmpty} aria-hidden="true">
        <Icon name="star" size={size} />
      </span>
    ))}
    <span className="visually-hidden">Оценка {value} из 5</span>
  </span>
)

const Reviews = async () => {
  const { rating, reviews } = await getYandexReviews()
  const items = (reviews.length > 0 ? reviews : ownReviews).slice(0, SHOWN)
  return (
    <Section tone="white" id="reviews" labelledBy="reviews-title">
      <SectionHead titleId="reviews-title" title="Что говорят клиенты" />
      <div className={styles.row}>
        <a className={styles.summary} href={REVIEWS_URL} target="_blank" rel="noopener noreferrer">
          <span className={styles.summarySource}>Яндекс Карты</span>
          {rating ? (
            <span className={styles.scoreBlock}>
              <span className={styles.score}>
                {rating.score.toLocaleString('ru', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
              </span>
              <Stars value={Math.round(rating.score)} size={28} />
              <span className={styles.counts}>
                {countLabel(rating.reviews, { one: 'отзыв', few: 'отзыва', many: 'отзывов' })} ·{' '}
                {countLabel(rating.ratings, { one: 'оценка', few: 'оценки', many: 'оценок' })}
              </span>
            </span>
          ) : (
            <span className={styles.scoreBlock}>
              <span className={styles.fallbackTitle}>Все отзывы — на&nbsp;Яндекс Картах</span>
            </span>
          )}
          <span className={styles.cta}>
            Читать все отзывы
            <Icon name="arrowUpRight" size="1.25em" stroke={2} />
          </span>
          <span className="visually-hidden"> (откроется в новой вкладке)</span>
        </a>
        <ul className={styles.grid} data-reveal-group="fan">
          {items.map(({ name, text, date, stars }, i) => (
            <li key={`${name}-${i}`} className={styles.item}>
              <a href={REVIEWS_URL} className={styles.card} target="_blank" rel="noopener noreferrer">
                {/* Стрелка — сверху: правый нижний угол блока на компьютере закрывает кнопка чата */}
                <span className={styles.cardTop}>
                  {stars && <Stars value={stars} size={16} />}
                  <span className={styles.meta}>
                    {date}
                    <Icon name="arrowUpRight" size="1.25em" stroke={2} />
                  </span>
                </span>
                <span className={styles.text}>{text}</span>
                <span className={styles.author}>
                  <span className={styles.avatar} data-tone={i % 2 ? 'blue' : 'lime'} aria-hidden="true">
                    {name.charAt(0).toUpperCase()}
                  </span>
                  <span className={styles.name}>{name}</span>
                  <span className="visually-hidden"> — все отзывы на Яндекс Картах (откроется в новой вкладке)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </Section>
  )
}

export default Reviews
