/**
 * Доменные типы конструктора. Модуль src/features/constructor переносится
 * в pnhd-studio как есть, поэтому не зависит от остального приложения.
 */

/** Типы изделий — совпадают с полем `type` в API Pinhead. */
export type GarmentType = 'tshirt' | 'hoodie' | 'longsleeve' | 'sweatshirt' | 'totebag' | 'cap';

/**
 * Стороны нанесения. Рукава есть только у изделий с мокапом и рисуются на виде спереди.
 * Левый/правый — с точки зрения того, кто носит: на виде спереди левый рукав справа.
 */
export type Side = 'front' | 'back' | 'pocket' | 'sleeve_left' | 'sleeve_right';
export const SIDES: Side[] = ['front', 'back', 'pocket', 'sleeve_left', 'sleeve_right'];
export const SIDE_LABEL: Record<Side, string> = {
  front: 'Перед', back: 'Спина', pocket: 'Карман', sleeve_left: 'Левый рукав', sleeve_right: 'Правый рукав',
};
/** Короткие подписи для вкладок над холстом — четыре полных не влезают в ширину телефона. */
export const SIDE_TAB: Record<Side, string> = { front: 'Перед', back: 'Спина', pocket: 'Карман', sleeve_left: 'Рукав Л', sleeve_right: 'Рукав П' };
export const isSleeve = (s: Side) => s === 'sleeve_left' || s === 'sleeve_right';

/** Товар в том виде, в каком его отдаёт GET {API}/api/products (подмножество IProduct из pnhd-studio). */
export interface ApiProduct {
  _id: string;
  slug: string;
  name: string;
  type: GarmentType;
  price: number;
  color: string;
  stageColor?: string;
  isForPrinting: boolean;
  photos: string[];
  editor_front_view: string;
  editor_back_view: string;
  sizes: Array<{ name: string; qty: number }>;
  description?: string;
  order?: number;
}

/** Цветовой вариант модели = один товар из API. */
export interface GarmentVariant {
  productId: string;
  /** Адрес товара на сайте: по нему страница товара открывает конструктор с этим изделием и цветом. */
  slug: string;
  colorName: string;
  hex: string;
  price: number;
  sizes: string[];
  /** Остаток на складе по размерам (название размера → штук) из каталога; размера в словаре нет — остаток неизвестен. */
  stock: Record<string, number>;
  /** Описание из каталога: крой, состав, плотность. У цветов одной модели бывает разным. */
  description: string;
  /** Плоские мокапы для редактора; пусто — рисуем векторный силуэт. */
  mockups: Partial<Record<Side, string>>;
  /** Фото товара из каталога (только абсолютные URL) — для окна «Подробнее». */
  photos: string[];
}

/** Модель изделия (например «Футболка OVERSIZE») со всеми цветами. */
export interface Garment {
  id: string;
  type: GarmentType;
  /** Ключ плоского мокапа (config/garment-shapes). null — мокапа нет. */
  shapeId: import('../config/garment-shapes').ShapeId | null;
  name: string;
  basePrice: number;
  variants: GarmentVariant[];
}

/** Зона печати в координатах мокапа (доли 0..1 от ширины/высоты холста изделия). */
export interface PrintArea {
  x: number;
  y: number;
  width: number;
  height: number;
  /** Реальная ширина зоны в сантиметрах — нужна для расчёта DPI и формата (A4/A3...). */
  widthCm: number;
  /**
   * Контур непрямоугольной зоны: замкнутый многоугольник в долях собственного бокса зоны (0..1, пары [x, y],
   * по часовой стрелке, последняя точка не дублирует первую). Нет контура — зона прямоугольная.
   */
  outline?: Array<[number, number]>;
  /**
   * Зона из нескольких печатаемых частей (зип-худи: две половины по молнии): многоугольники в долях рамки зоны.
   * outline тогда — общий контур вместе с зазором между частями: он задаёт границу «вне зоны», а печатается и показывается только то, что внутри частей.
   */
  parts?: Array<Array<[number, number]>>;
  /** Шов горловины по центру изделия: x — ось изделия, y — низ воротника; доли кадра. От него отсчитываются стандартные места нанесения. */
  collar?: { x: number; y: number };
  /** Стандартные места нанесения, доступные кнопками; нет — кнопок нет (шоппер, рукава). */
  places?: PlaceSpot[];
}

/** Стандартное место нанесения: на сердце (слева у носящего), по центру груди, на спине. */
export type PlaceSpot = 'heart' | 'chest' | 'back';

interface LayerBase {
  id: string;
  side: Side;
  /** Позиция и размер в долях зоны печати (0..1) — не зависят от размера экрана. */
  x: number;
  y: number;
  rotation: number;
  /** Отражение по горизонтали: рисуется внутри слоя, поворот и размер от него не зависят. */
  flipX?: boolean;
  /** Отражение по вертикали — так же, внутри слоя. */
  flipY?: boolean;
  /**
   * Группа готового принта: слои шаблона двигаются, крутятся и масштабируются вместе, пока клиент
   * не выберет один из них повторным нажатием. Слои группы идут в списке подряд.
   */
  group?: string;
  /** Скрыт: не рисуется, не выбирается, не попадает в превью, файл печати, габарит и цену. Остаётся в списке слоёв. */
  hidden?: boolean;
}

export interface ImageLayer extends LayerBase {
  kind: 'image';
  src: string; // objectURL / dataURL загруженного файла
  fileName: string;
  /** SVG — масштабируется без потери качества, dpi не проверяем. */
  isVector: boolean;
  /** Размер рисунка в пикселях — после обрезки пустых полей, если она была. */
  naturalWidth: number;
  naturalHeight: number;
  /** Видимая часть исходной картинки без пустых полей (пиксели исходника). Нет — картинка целиком. */
  crop?: import('./trim').CropRect;
  width: number; // доля ширины зоны печати
  /** Место под фото из готового принта: пропорции окна (высота в долях ширины). Новое фото обрезается под них. */
  slot?: number;
  /** В месте под фото пока стоит заглушка — клиент ещё не вставил свой снимок. */
  placeholder?: boolean;
  /** Форма, по которой обрезается фото: буквы слова или горизонтальные полосы. Нет — прямоугольник. */
  mask?: ImageMask;
  /** Размер исходного снимка в пикселях — чтобы заново обрезать его, когда меняются пропорции окна. */
  srcSize?: { w: number; h: number };
  /** Кадр выбран вручную (кадрирование), а не автоматической обрезкой пустых полей. */
  cropped?: boolean;
  /** Кадр до выбора формы обрезки — к нему возвращает «Без формы» (null — снимок целиком). */
  beforeShape?: import('./trim').CropRect | null;
}

export type ImageMask =
  /** Фото видно сквозь буквы слова. */
  | { kind: 'text'; text: string; fontFamily: string; bold: boolean }
  /** Фото нарезано на count полос; gap — просвет между ними в долях высоты. */
  | { kind: 'strips'; count: number; gap: number }
  /** Фото обрезано по форме (круг, сердце…), которую клиент выбрал сам. */
  | { kind: 'shape'; shape: PhotoShape };

/** Формы обрезки своего фото. Контуры — config/photo-shapes. */
export type PhotoShape = 'circle' | 'rounded' | 'heart' | 'star' | 'arch' | 'hexagon';

export interface TextLayer extends LayerBase {
  kind: 'text';
  text: string;
  fontFamily: string;
  fontSize: number; // доля ширины зоны печати
  fill: string;
  align: 'left' | 'center' | 'right';
  bold: boolean;
  italic: boolean;
  /** Межстрочный шаг в долях кегля. */
  lineHeight: number;
  /** Обводка: толщина наружу в долях кегля; 0 — без обводки. */
  strokeWidth: number;
  strokeColor: string;
  /** Изгиб дугой −100…+100: 0 — прямой, плюс — горбом вверх, минус — улыбкой. */
  arc: number;
  /** Сколько раз надпись повторяется столбиком (слово в несколько рядов); нет или 1 — один раз. */
  repeat?: number;
}

export type DesignLayer = ImageLayer | TextLayer;

export type SizeQuantities = Record<string, number>;

/** Метод нанесения. Клиенту даём выбор с описанием разницы. */
export type PrintMethod = 'dtf' | 'dtg';

export interface OrderContacts {
  name: string;
  phone: string;
  email: string;
  /** «@nick»; пусто — в старых заявках, до поля в оформлении */
  telegram: string;
  /** Самовывоз из студии или доставка; город обязателен только для доставки. */
  delivery: 'pickup' | 'delivery';
  city: string;
  address?: string;
  comment?: string;
  /** Согласие на обработку персональных данных — без него заявка не отправляется. */
  consent: boolean;
}
