export type Client = { name: string; logo?: string; ratio?: number };

// Векторные логотипы обрезаны по содержимому (viewBox); ratio — ширина к высоте viewBox, по нему плитка выравнивает видимую площадь
// Стена стоит на чёрном фоне: берём версии логотипов on-dark — фирменные цвета те же, чёрные и тёмно-синие части белые
const logo = (file: string, w: number, h: number) => ({ logo: `/home/clients/on-dark/${file}.svg`, ratio: w / h });

// Клиенты — со страницы корпоративного мерча pnhd.ru; логотипы — официальные SVG, где их нашли, иначе векторизованы из растра
export const clients: Client[] = [
  { name: 'Кинопоиск', ...logo('kinopoisk', 438.63, 60.13) },
  { name: 'Apt', ...logo('apt', 1392, 801.44) },
  { name: 'Авиасейлс', ...logo('aviasales', 360, 75) },
  { name: 'МТС', ...logo('mts', 393.75, 98) },
  { name: 'Bolt', ...logo('bolt', 219.25, 127.63) },
  { name: 'Додо Пицца', ...logo('dodo', 377.75, 127.38) },
  { name: 'Буше', ...logo('bushe', 1504.9, 592.9) },
  { name: 'Пивоварня Бакунин', ...logo('bakunin', 1044, 1044) },
  { name: 'Яндекс', ...logo('yandex', 366, 106) },
  { name: 'ВКонтакте', ...logo('vk', 168, 168) },
  { name: 'Toyo Tires', ...logo('toyo', 1013.21, 106.68) },
  { name: 'Tillypad', ...logo('tillypad', 1771.85, 403.42) },
  { name: 'iPort', ...logo('iport', 21000, 5969.25) },
  { name: 'Hyundai', ...logo('hyundai', 1000, 128.75) },
  { name: 'Frank by Баста', ...logo('frank', 77.5, 68.88) },
  { name: 'Кассир.ру', ...logo('kassir', 204, 49.5) },
  { name: 'JetBrains', ...logo('jetbrains', 154.25, 166.88) },
  { name: 'Italy Group', ...logo('italy-group', 1319.49, 427.88) },
  { name: 'Petshop.ru', ...logo('petshop', 180, 27.88) },
  { name: 'Parmalat', ...logo('parmalat', 96, 47.88) },
  { name: 'Stihl', ...logo('stihl', 885.18, 191.01) },
  { name: 'Sony Centre', ...logo('sony-centre', 3200, 664) },
  { name: 'Samsung', ...logo('samsung', 380, 126.25) },
];
