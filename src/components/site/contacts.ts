import { contactsHref } from './links';

const MAX_HREF = 'https://max.ru/u/f9LHodD0cOLPoya-nl--At_duzt7fmJjN6-3xbnFVdcytMmjXzFDz4fRzDU';

export const siteContacts = {
  phone: '+7 (812) 904-61-56',
  phoneHref: 'tel:+78129046156',
  email: 'studio@pnhd.ru',
  hours: 'Ежедневно, 10:00–20:00',
  /** Город рядом с номером в меню. Нужен для локального SEO */
  city: 'Санкт-Петербург',
  address: 'Санкт-Петербург, ул. Чапыгина, д. 1',
  /** Мессенджер MAX: профиль студии — в кнопке «Написать нам» и в подвале */
  maxHref: MAX_HREF,
  socials: [
    { label: 'Telegram', icon: 'telegram', href: 'https://t.me/pnhd_studio_bot' },
    { label: 'MAX', icon: 'max', href: MAX_HREF },
    { label: 'ВКонтакте', icon: 'vk', href: 'https://vk.com/pinheadspb' },
  ],
  /** Реквизиты — как на прежнем сайте и в политике конфиденциальности */
  company: 'ООО «ПИНХЭД СТУДИО»',
  inn: '7810463916',
  kpp: '781301001',
} as const;

export const siteNav = [
  { label: 'Каталог', href: '/shop' },
  { label: 'Методы нанесения', href: '/methods' },
  { label: 'Бонусы', href: '/loyalty' },
  { label: 'Контакты', href: contactsHref },
] as const;
