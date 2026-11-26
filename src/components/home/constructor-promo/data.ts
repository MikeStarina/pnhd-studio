import { resolveColorHex } from '@/app/utils/product-colors';
import type { IconName } from '@/features/constructor/ui/icons';

export type Side = 'front' | 'back' | 'side';

export type Zone = { x: number; y: number; w: number; h: number };

export type GarmentDef = {
  id: string;
  name: string;
  icon: IconName;
  file: string;
  zone: Zone;
};

const base = '/home/constructor';

// Зоны печати — доли мокапа, как в конструкторе
const tee: Zone = { x: 0.3, y: 0.22, w: 0.4, h: 0.5 };

export const garments: GarmentDef[] = [
  { id: 'tshirt', name: 'Футболки', icon: 'tshirt', file: `${base}/tshirt_regular.webp`, zone: tee },
  { id: 'hoodie', name: 'Худи', icon: 'hoodie', file: `${base}/hoodie.webp`, zone: { x: 0.32, y: 0.3, w: 0.36, h: 0.3 } },
  { id: 'longsleeve', name: 'Лонгсливы', icon: 'longsleeve', file: `${base}/longsleeve.webp`, zone: tee },
  { id: 'sweatshirt', name: 'Свитшоты', icon: 'sweatshirt', file: `${base}/sweatshirt.webp`, zone: tee },
  { id: 'totebag', name: 'Шопперы', icon: 'totebag', file: `${base}/totebag.webp`, zone: { x: 0.25, y: 0.38, w: 0.5, h: 0.48 } },
];

// Цвета, которые есть в каталоге сайта
export const colors = ['белый', 'чёрный', 'серый', 'розовый', 'голубой'].map((name) => ({
  name: name[0].toUpperCase() + name.slice(1),
  hex: resolveColorHex(name) ?? '#ffffff',
}));

// Готовые принты конструктора, снятые с холста: вариант для светлой и для тёмной ткани
export const prints = [1, 3, 5, 6, 8].map((id) => ({
  id,
  light: `${base}/prints/print-${id}-light.webp`,
  dark: `${base}/prints/print-${id}-dark.webp`,
}));

export const sideLabels = ['Перед', 'Спина', 'Рукав'];

export const railSteps = [
  { title: 'Изделие', text: 'Футболка, худи, свитшот, лонгслив или шоппер' },
  { title: 'Цвет и размеры', text: 'Цвет изделия и нужные размеры с количеством' },
  { title: 'Принт', text: 'Своя картинка, текст или готовый принт' },
  { title: 'Заказ', text: 'Цена видна сразу — положи в корзину и оформи заказ' },
];

// Каждый круг витрины берёт следующую вещь, цвет и принт: данные не откатываются назад без причины
export const garmentOrder = [1, 0, 2, 3, 4];
export const colorOrder = [1, 3, 0, 4, 2];

// Такт шага: курсор едет к цели, нажимает, результат держится до следующего шага
export const beat = { move: 900, press: 180, step: 3600 };
