import { priceMethods } from '@/components/home/price-estimate/prices';
import { methodPanels } from '@/components/home/print-methods/data';

/** Место в бенто на компьютере (как на старом /methods): широкая с фото слева или справа, высокая с фото сверху */
export type MethodShape = 'wide' | 'wide-right' | 'tall';

export type MethodItem = {
  slug: string;
  /** Ячейка в сетке: silk — сверху слева, dtf/dtg — по центру друг над другом, flex/emb — высокие по краям */
  area: 'silk' | 'emb' | 'dtf' | 'dtg' | 'flex';
  shape: MethodShape;
  name: string;
  text: string;
  photo: string;
  /** «от 400 ₽» — меньшая цена принта из таблицы цен главной; null — цену называет менеджер */
  priceFrom: string | null;
  /** «от 1 шт.» — тираж из данных методов главной */
  minRun: string;
};

/** Названия и тексты — из макета «04 · Методы нанесения»; порядок — по чтению бенто (номера 01–05 идут за взглядом);
 * цены и тиражи — из общих данных сайта */
const list = [
  {
    slug: 'shelkografiya',
    area: 'silk' as const,
    shape: 'wide' as const,
    name: 'Шелкография',
    text: 'Обеспечивает высокую детализацию принтов разных цветов и оттенков, устойчивость к стирке и износу',
    photo: '/methods/shelkografiya.webp',
  },
  {
    slug: 'termotransfernaya-pechat',
    area: 'flex' as const,
    shape: 'tall' as const,
    name: 'Флекс',
    text: 'Подходит для принтов с кислотными, золотыми, медными цветами и светоотражателей',
    photo: '/methods/flex.webp',
  },
  {
    slug: 'dtf-pechat',
    area: 'dtf' as const,
    shape: 'wide-right' as const,
    name: 'DTF',
    text: 'Помогает нанести рисунок с яркими насыщенными цветами, которые не выцветают со временем',
    photo: '/methods/dtf.webp',
  },
  {
    slug: 'pryamaya-dtg-pechat',
    area: 'dtg' as const,
    shape: 'wide' as const,
    name: 'DTG',
    text: 'Наносится на белые вещи за 5–15 минут, а рисунок сохраняется столько же, сколько на обычных вещах из магазинов',
    photo: '/methods/dtg.webp',
  },
  {
    slug: 'vishivka',
    area: 'emb' as const,
    shape: 'tall' as const,
    name: 'Вышивка',
    text: 'Используется для лого и фраз, которые выделяются на одежде и добавляют индивидуальности',
    photo: '/methods/vishivka.webp',
  }
];

const rub = (value: number) => `от ${value.toLocaleString('ru-RU')} ₽`;

export const methods: MethodItem[] = list.map((method) => {
  const prices = priceMethods.find((item) => item.slug === method.slug)?.formats.flatMap((format) => format.prices) ?? [];
  const panel = methodPanels.find((item) => item.slug === method.slug);
  // Тираж не придумываем: метода нет в данных главной — сборка падает здесь, а не показывает неверную цифру
  if (!panel) throw new Error(`Нет тиража для метода ${method.slug} в home/print-methods/data`);
  return { ...method, priceFrom: prices.length ? rub(Math.min(...prices)) : null, minRun: panel.minRun };
});
