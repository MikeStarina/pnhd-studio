export type CaseItem = {
  id: number
  image: string
  alt: string
  title: string
  description: string
}

/**
 * Страница /cases открыта поисковикам и есть в sitemap только с настоящими кейсами.
 * Заменили заглушки ниже — поставить true: уйдёт noindex и страница вернётся в sitemap.
 */
export const CASES_PUBLISHED = false

// ЗАГЛУШКА: заменить на реальные кейсы (название, описание, при необходимости метка «изделия · метод»)
export const cases: CaseItem[] = [
  {
    id: 1,
    image: '/photos_screen_image_one.png',
    alt: 'Оранжевая футболка с чёрным принтом',
    title: 'Кейс скоро появится',
    description: 'Добавим описание проекта: задача, изделия, метод печати.',
  },
  {
    id: 2,
    image: '/photos_screen_image_three.png',
    alt: 'Фотопринт на чёрной ткани',
    title: 'Кейс скоро появится',
    description: 'Добавим описание проекта: задача, изделия, метод печати.',
  },
  {
    id: 3,
    image: '/photos_screen_image_four.png',
    alt: 'Лонгслив с принтом на спине',
    title: 'Кейс скоро появится',
    description: 'Добавим описание проекта: задача, изделия, метод печати.',
  },
]
