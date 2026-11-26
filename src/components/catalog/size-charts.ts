import { IProduct } from '@/app/utils/types';
import classicTee from '../../../public/sizeChart/tee_classic_sizes.png';
import oversizeTee from '../../../public/sizeChart/tee_oversize_sizes.png';
import freeFitTee from '../../../public/sizeChart/tee_freefit_sizes.png';
import standartTee from '../../../public/sizeChart/tee_standart_sizes.png';
import gildanTee from '../../../public/sizeChart/tee_gildan_sizes.png';
import promoTee from '../../../public/sizeChart/tee_promo_sizes.png';
import classicHoodie from '../../../public/sizeChart/hoodie_classic_sizes.png';

export type SizeChartImage = { title: string; src: string; width: number; height: number };

const charts = {
  tshirt: [
    { model: /\bCLASSIC\b/i, title: 'Футболки CLASSIC', image: classicTee },
    { model: /\bOVERSIZE\b/i, title: 'Футболки OVERSIZE', image: oversizeTee },
    { model: /\bFREEFIT\b/i, title: 'Футболки FREEFIT', image: freeFitTee },
    { model: /\bSTANDART\b/i, title: 'Футболки BASIC STANDART', image: standartTee },
    { model: /\bPROMO\b/i, title: 'Футболки PROMO', image: promoTee },
    { model: /\bGILDAN\b/i, title: 'Футболки GILDAN HAMMER', image: gildanTee },
  ],
  hoodie: [{ model: /\bCLASSIC\b/i, title: 'Худи CLASSIC', image: classicHoodie }],
} as const;

/**
 * Таблица размеров модели — те же картинки, что на /size_chart. Модель берётся из названия товара;
 * REGULAR и прочие модели без своей таблицы дают null: ссылка ведёт на общую страницу.
 */
export const sizeChartFor = (product: Pick<IProduct, 'type' | 'name'>): SizeChartImage | null => {
  const list: readonly { model: RegExp; title: string; image: { src: string; width: number; height: number } }[] =
    charts[product.type as keyof typeof charts] ?? [];
  const found = list.find(({ model }) => model.test(product.name));
  return found ? { title: found.title, src: found.image.src, width: found.image.width, height: found.image.height } : null;
};
