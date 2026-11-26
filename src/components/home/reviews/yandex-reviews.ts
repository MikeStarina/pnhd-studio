export const YANDEX_ORG_ID = '183887374171'

export type YandexRating = { score: number; reviews: number; ratings: number }
export type YandexReview = { name: string; date: string; text: string; stars: number }

/* Официальный виджет отзывов Яндекс Карт — единственный открытый источник оценки и отзывов организации: оценка,
   число отзывов и оценок, пять последних отзывов (не по порядку — сортируем по дате, свежие первыми). Страница
   перестраивается раз в сутки; если Яндекс не ответил или поменял разметку — блок показывает свои отзывы и ссылку без оценки. */
const WIDGET_URL = `https://yandex.ru/maps-reviews-widget/${YANDEX_ORG_ID}?comments`

/* На главной — только хорошие отзывы: виджет отдаёт последние, без выбора */
const MIN_STARS = 4

export const getYandexReviews = async (): Promise<{ rating: YandexRating | null; reviews: YandexReview[] }> => {
  const response = await fetch(WIDGET_URL, {
    next: { revalidate: 86400 },
    signal: AbortSignal.timeout(5000),
  }).catch(() => null)
  if (!response?.ok) return { rating: null, reviews: [] }
  const html = await response.text()
  return { rating: parseRating(html), reviews: parseReviews(html).sort((a, b) => reviewTime(b.date) - reviewTime(a.date)) }
}

const months = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря']

const DAY = 86_400_000

/* Виджет отдаёт отзывы не по порядку, а дату пишет «10 ноября» (год — только у прошлых лет), у свежих — «сегодня»
   и «вчера»: дата без года, которая позже сегодняшней, — прошлого года */
const reviewTime = (date: string) => {
  const now = new Date()
  if (/сегодня/i.test(date)) return now.getTime()
  if (/вчера/i.test(date)) return now.getTime() - DAY
  const [, day, month, year] = date.match(/(\d{1,2})\s+([а-я]+)(?:\s+(\d{4}))?/) ?? []
  const monthIndex = months.indexOf(month)
  if (monthIndex < 0) return 0
  const time = new Date(Number(year ?? now.getFullYear()), monthIndex, Number(day)).getTime()
  return !year && time > now.getTime() ? new Date(now.getFullYear() - 1, monthIndex, Number(day)).getTime() : time
}

/* «5,0» в mini-badge__stars-count и строка «396 отзывов • 484 оценки» в ссылке под ней */
const parseRating = (html: string): YandexRating | null => {
  const score = html.match(/mini-badge__stars-count">\s*(\d[,.]\d)/)?.[1]
  const counts = html.match(/(\d[\d\s]*)\s*отзыв[а-я]*\D+?(\d[\d\s]*)\s*оцен/)
  if (!score || !counts) return null
  const rating = {
    score: Number(score.replace(',', '.')),
    reviews: Number(counts[1].replace(/\s/g, '')),
    ratings: Number(counts[2].replace(/\s/g, '')),
  }
  return rating.score > 0 && rating.score <= 5 && rating.reviews > 0 ? rating : null
}

/* Каждый отзыв — <div class="comment">: имя, дата, звёзды списком (полная — класс без модификатора), текст */
const parseReviews = (html: string): YandexReview[] =>
  html
    .split('<div class="comment">')
    .slice(1)
    .flatMap((block) => {
      const name = block.match(/comment__name">([^<]+)/)?.[1]
      const date = block.match(/comment__date">([^<]+)/)?.[1]
      const text = block.match(/comment__text">([\s\S]*?)<\/p>/)?.[1]
      const stars = block.match(/class="stars-list__star"/g)?.length ?? 0
      return name && date && text && stars >= MIN_STARS
        ? [{ name: shortName(cleanText(name)), date: cleanText(date), text: cleanText(text), stars }]
        : []
    })

/* «Иван Ахтырский» → «Иван А.»: на сайте — имя и первая буква фамилии */
const shortName = (name: string) => {
  const [first, last] = name.split(' ')
  return last ? `${first} ${last[0]}.` : first
}

const entities: Record<string, string> = { amp: '&', quot: '"', '#39': "'", '#x27': "'", lt: '<', gt: '>', nbsp: ' ' }

const cleanText = (raw: string) =>
  raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&(amp|quot|#39|#x27|lt|gt|nbsp);/g, (_, code: string) => entities[code])
    .replace(/\s+/g, ' ')
    .trim()
