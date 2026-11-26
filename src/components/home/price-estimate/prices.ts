/**
 * Цены нанесения с главной studio.pnhd.ru (блок «Рассчитайте стоимость», ноябрь 2026). Цена — за один принт.
 * Размеры форматов A — стандартные листы, «Мини» и A3+ — как в конструкторе (features/constructor/config/pricing.ts).
 */
export type PriceFormat = {
  name: string;
  /** Ширина и высота в сантиметрах */
  w: number;
  h: number;
  /** Цена по колонкам метода */
  prices: number[];
};

export type PriceMethod = {
  id: string;
  name: string;
  slug: string;
  columns: string[];
  /** Своя оговорка вместо общей «Скидки на тираж — у менеджера» */
  note?: string;
  formats: PriceFormat[];
};

const mini = (price: number): PriceFormat => ({ name: 'Мини', w: 8, h: 8, prices: [price] });
const a6 = (...prices: number[]): PriceFormat => ({ name: 'А6', w: 10.5, h: 14.8, prices });
const a5 = (...prices: number[]): PriceFormat => ({ name: 'А5', w: 14.8, h: 21, prices });
const a4 = (...prices: number[]): PriceFormat => ({ name: 'А4', w: 21, h: 29.7, prices });
const a3 = (...prices: number[]): PriceFormat => ({ name: 'А3', w: 29.7, h: 42, prices });
const a3plus = (...prices: number[]): PriceFormat => ({ name: 'А3+', w: 32.9, h: 48.3, prices });

export const priceMethods: PriceMethod[] = [
  {
    id: 'dtg',
    name: 'DTG',
    slug: 'pryamaya-dtg-pechat',
    columns: ['На белом', 'На цветном'],
    formats: [a6(400, 500), a5(500, 650), a4(650, 800), a3(800, 900), a3plus(900, 1100)],
  },
  {
    id: 'dtf',
    name: 'DTF',
    slug: 'dtf-pechat',
    columns: ['Цена'],
    formats: [mini(400), a6(450), a5(550), a4(700), a3(850), a3plus(1050)],
  },
  {
    id: 'transfer',
    name: 'Термотрансфер',
    slug: 'termotransfernaya-pechat',
    columns: ['Цена'],
    formats: [mini(400), a6(550), a5(700), a4(950), a3(1050), a3plus(1200)],
  },
  {
    id: 'embroidery',
    name: 'Вышивка',
    slug: 'vishivka',
    columns: ['Цена'],
    note: 'Вышивка — при тираже от\u00a010\u00a0штук, на меньший тираж цену назовёт менеджер',
    formats: [a6(900), a5(1100), a4(1600), a3(2100)],
  },
];
