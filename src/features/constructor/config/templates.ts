import { letterBoxes, maskAspect } from '../model/slot';
import type { ImageLayer, ImageMask, TextLayer } from '../model/types';
import { artAspect, artImage, photoPlaceholder, type ArtColors, type ArtId } from './template-art';

/**
 * Готовые принты: композиции из надписей, графики и мест под фото, которые одним нажатием
 * заменяют дизайн текущей стороны.
 *
 * Координаты шаблона — в долях ШИРИНЫ композиции (ширина = 1, высота = height): так взаимное положение
 * элементов не зависит от пропорций зоны печати. В доли зоны их переводит buildTemplate.
 * Цвета в шаблоне не хранятся: элемент помечен тоном, цвет выбирается по ткани.
 */
export type TemplateTone = 'main' | 'accent' | 'dark' | 'white';

/** Наклон элемента вместе с группой: поворот на deg вокруг точки (px, py). */
type Tilt = { deg: number; px: number; py: number };

interface TplText {
  kind: 'text';
  text: string;
  font: string;
  /** Кегль в долях ширины композиции. */
  size: number;
  /** Центр надписи. */
  cx: number;
  cy: number;
  bold?: boolean;
  italic?: boolean;
  arc?: number;
  lineHeight?: number;
  /** Повтор надписи столбиком. */
  repeat?: number;
  tone?: TemplateTone;
  tilt?: Tilt;
}
interface TplArt { kind: 'art'; art: ArtId; x: number; y: number; w: number; tilt?: Tilt }
/** Место под фото клиента: aspect — высота в долях ширины. */
/** С маской-словом пропорции окна считаются по буквам, aspect — только ориентир для раскладки. */
interface TplPhoto { kind: 'photo'; x: number; y: number; w: number; aspect: number; mask?: ImageMask; tilt?: Tilt }
/** Слово, в каждой букве которого — своё место под фото (буква — отдельный слой, все вместе — группа принта). */
interface TplLetters { kind: 'letters'; text: string; font: string; bold?: boolean; x: number; y: number; w: number }
type TplItem = TplText | TplArt | TplPhoto | TplLetters;

export interface PrintTemplate {
  id: string;
  title: string;
  category: (typeof TEMPLATE_CATEGORIES)[number];
  /** Высота композиции в долях её ширины. */
  height: number;
  /** Элементы снизу вверх. */
  items: TplItem[];
}

export const TEMPLATE_CATEGORIES = ['С фото', 'Надписи', 'Команда', 'Праздник'] as const;

/** Слой, готовый к добавлению в дизайн: без id и стороны. */
export type BuiltLayer = Omit<TextLayer, 'id' | 'side'> | Omit<ImageLayer, 'id' | 'side'>;

const colors = (light: boolean): ArtColors => ({ ink: light ? '#111111' : '#ffffff', accent: light ? '#2f6b00' : '#99ff00', light });
const fill = (tone: TemplateTone, c: ArtColors) =>
  tone === 'accent' ? c.accent : tone === 'dark' ? '#111111' : tone === 'white' ? '#ffffff' : c.ink;

/** Доля высоты зоны, которую может занять композиция, и отступ сверху у высокой зоны (в долях ширины). */
const FILL = 0.9;
const TOP = 0.1;

/**
 * Переводит шаблон в слои для зоны печати.
 * aspect — высота зоны в долях её ширины; light — ткань светлая.
 * Композиция вписывается в зону целиком: в низкой зоне (рукав, шоппер) уменьшается и встаёт по центру,
 * в высокой — стоит сверху, на уровне груди.
 * fit — для зоны на всё изделие: предельная ширина и верх композиции (доли ширины и высоты зоны).
 */
export function buildTemplate(tpl: PrintTemplate, aspect: number, light: boolean, fit?: { maxWidth: number; top: number }): BuiltLayer[] {
  const c = colors(light);
  const s = Math.min(FILL, (aspect * FILL) / tpl.height, fit?.maxWidth ?? Infinity);
  const x0 = (1 - s) / 2;
  const y0 = fit ? Math.min(fit.top * aspect, aspect - tpl.height * s) : Math.min(TOP, (aspect - tpl.height * s) / 2);
  /** Точка композиции → доли зоны; с наклоном — после поворота вокруг опорной точки. */
  const place = (x: number, y: number, tilt?: Tilt) => {
    let [px, py] = [x, y];
    if (tilt) {
      const a = (tilt.deg * Math.PI) / 180;
      const [dx, dy] = [x - tilt.px, y - tilt.py];
      px = tilt.px + dx * Math.cos(a) - dy * Math.sin(a);
      py = tilt.py + dx * Math.sin(a) + dy * Math.cos(a);
    }
    return { x: x0 + px * s, y: (y0 + py * s) / aspect };
  };

  return tpl.items.flatMap((it): BuiltLayer | BuiltLayer[] => {
    if (it.kind === 'letters') return letterSlots(it.text, { fontFamily: it.font, bold: !!it.bold }, place(it.x, it.y).x, place(it.x, it.y).y * aspect, it.w * s, aspect);
    const rotation = it.tilt?.deg ?? 0;
    if (it.kind === 'text') {
      const color = fill(it.tone ?? 'main', c);
      return {
        kind: 'text', text: it.text, fontFamily: it.font, fontSize: it.size * s, fill: color, align: 'center',
        bold: !!it.bold, italic: !!it.italic, lineHeight: it.lineHeight ?? 1.1, strokeWidth: 0,
        strokeColor: color === '#ffffff' ? '#111111' : '#ffffff', arc: it.arc ?? 0, rotation, ...place(it.cx, it.cy, it.tilt),
        ...(it.repeat ? { repeat: it.repeat } : null),
      };
    }
    // У картинки точка (x, y) — левый верхний угол, вокруг него она и поворачивается.
    const pos = place(it.x, it.y, it.tilt);
    if (it.kind === 'art') {
      return { kind: 'image', ...artImage(it.art, c), fileName: 'Графика шаблона.svg', isVector: true, width: it.w * s, rotation, ...pos };
    }
    const slotAspect = it.mask?.kind === 'text' ? maskAspect(it.mask) : it.aspect;
    return {
      kind: 'image', ...photoPlaceholder(slotAspect, !!it.mask), fileName: 'Место под фото', isVector: true, width: it.w * s, rotation, ...pos,
      slot: slotAspect, placeholder: true, ...(it.mask ? { mask: it.mask } : null),
    };
  });
}

/** Карточка моментального фото: рамка, место под снимок и подпись от руки. Ширина рамки — w. */
const polaroid = (x: number, y: number, w: number, caption: string, deg = 0): TplItem[] => {
  const tilt: Tilt = { deg, px: x + w / 2, py: y + (w * artAspect('polaroid')) / 2 };
  return [
    { kind: 'art', art: 'polaroid', x, y, w, tilt },
    { kind: 'photo', x: x + w * 0.07, y: y + w * 0.07, w: w * 0.86, aspect: 1, tilt },
    { kind: 'text', text: caption, font: 'Caveat', bold: true, size: w * 0.13, cx: x + w / 2, cy: y + w * 1.065, tone: 'dark', tilt },
  ];
};

export const TEMPLATES: PrintTemplate[] = [
  // ─── С фото ───
  {
    id: 'polaroid', title: 'Снимок с подписью', category: 'С фото', height: 1.02,
    items: polaroid(0.1, 0.03, 0.8, 'лучший день', -4),
  },
  {
    id: 'polaroid-duo', title: 'Было — стало', category: 'С фото', height: 0.92,
    items: [...polaroid(0.02, 0.1, 0.52, 'было', -7), ...polaroid(0.46, 0.14, 0.52, 'стало', 6)],
  },
  {
    id: 'player', title: 'Наша песня', category: 'С фото', height: 1.3,
    items: [
      { kind: 'photo', x: 0.1, y: 0, w: 0.8, aspect: 1 },
      { kind: 'text', text: 'Наша песня', font: 'Montserrat', bold: true, size: 0.085, cx: 0.5, cy: 0.9 },
      { kind: 'text', text: 'вместе с 2019 года', font: 'Montserrat', size: 0.045, cx: 0.5, cy: 0.99, tone: 'accent' },
      { kind: 'art', art: 'player', x: 0.1, y: 1.07, w: 0.8 },
    ],
  },
  {
    id: 'film', title: 'Фотоплёнка', category: 'С фото', height: 1.56,
    items: [
      { kind: 'art', art: 'film', x: 0.25, y: 0, w: 0.5 },
      ...[12, 70, 128].map((y): TplItem => ({ kind: 'photo', x: 0.25 + (0.5 * 8) / 60, y: (0.5 * y) / 60, w: (0.5 * 44) / 60, aspect: 46 / 44 })),
    ],
  },
  {
    id: 'photo-letters', title: 'Фото в буквах', category: 'С фото', height: 0.46,
    items: [
      { kind: 'photo', x: 0.02, y: 0, w: 0.96, aspect: 0.24, mask: { kind: 'text', text: 'МАМА', fontFamily: 'Rubik Mono One', bold: false } },
      { kind: 'text', text: 'самая любимая', font: 'Caveat', bold: true, size: 0.1, cx: 0.5, cy: 0.37, tone: 'accent' },
    ],
  },
  {
    id: 'photo-each-letter', title: 'Снимок в каждой букве', category: 'С фото', height: 0.46,
    items: [
      { kind: 'letters', text: 'МАМА', font: 'Rubik Mono One', x: 0.02, y: 0, w: 0.96 },
      { kind: 'text', text: 'самая любимая', font: 'Caveat', bold: true, size: 0.1, cx: 0.5, cy: 0.37, tone: 'accent' },
    ],
  },
  {
    id: 'photo-strips', title: 'Фото-полосы', category: 'С фото', height: 1.14,
    items: [
      { kind: 'photo', x: 0.1, y: 0, w: 0.8, aspect: 1.2, mask: { kind: 'strips', count: 5, gap: 0.035 } },
      { kind: 'text', text: 'лучшие моменты', font: 'Montserrat', bold: true, size: 0.055, cx: 0.5, cy: 1.07 },
    ],
  },
  {
    id: 'poster', title: 'Афиша', category: 'С фото', height: 1.42,
    items: [
      { kind: 'photo', x: 0.08, y: 0, w: 0.84, aspect: 1.15 },
      { kind: 'text', text: 'ЛЕГЕНДА', font: 'Unbounded', bold: true, size: 0.125, cx: 0.5, cy: 1.09 },
      { kind: 'art', art: 'rule', x: 0.08, y: 1.19, w: 0.84 },
      { kind: 'text', text: 'ограниченный выпуск · 1 из 1', font: 'Montserrat', size: 0.042, cx: 0.5, cy: 1.26, tone: 'accent' },
      { kind: 'art', art: 'barcode', x: 0.33, y: 1.32, w: 0.34 },
    ],
  },
  {
    id: 'best-dad', title: 'Лучший папа', category: 'С фото', height: 1.3,
    items: [
      { kind: 'text', text: 'ЛУЧШИЙ ПАПА', font: 'Russo One', size: 0.1, cx: 0.5, cy: 0.12, arc: 55 },
      { kind: 'photo', x: 0.18, y: 0.24, w: 0.64, aspect: 1.2 },
      { kind: 'text', text: 'на свете с 2015 года', font: 'Caveat', bold: true, size: 0.08, cx: 0.5, cy: 1.12, tone: 'accent' },
    ],
  },

  // ─── Надписи ───
  {
    id: 'label', title: 'Этикетка', category: 'Надписи', height: 1.19,
    items: [
      { kind: 'art', art: 'label', x: 0.05, y: 0, w: 0.9 },
      { kind: 'text', text: 'СОСТАВ', font: 'Oswald', bold: true, size: 0.1, cx: 0.5, cy: 0.135 },
      { kind: 'text', text: '100%\nДРУГ', font: 'Rubik Mono One', size: 0.15, cx: 0.5, cy: 0.52, lineHeight: 1.15 },
      { kind: 'text', text: 'юмор · забота · терпение', font: 'Montserrat', size: 0.042, cx: 0.5, cy: 0.79, tone: 'accent' },
      { kind: 'art', art: 'barcode', x: 0.2, y: 0.93, w: 0.6 },
      { kind: 'text', text: 'не кантовать · беречь', font: 'Montserrat', bold: true, size: 0.034, cx: 0.5, cy: 1.125 },
    ],
  },
  {
    id: 'patronymic', title: 'Отчество', category: 'Надписи', height: 0.74,
    items: [
      { kind: 'text', text: 'АЛЕКСЕЕВИЧ', font: 'Unbounded', bold: true, size: 0.1, cx: 0.5, cy: 0.27, repeat: 5, lineHeight: 1.08 },
      { kind: 'art', art: 'rule', x: 0.1, y: 0.6, w: 0.8 },
      { kind: 'text', text: 'сын своего отца · с 1996', font: 'Montserrat', size: 0.045, cx: 0.5, cy: 0.67, tone: 'accent' },
    ],
  },
  {
    id: 'established', title: 'Год основания', category: 'Надписи', height: 0.66,
    items: [
      { kind: 'art', art: 'rule', x: 0.1, y: 0.02, w: 0.8 },
      { kind: 'text', text: 'ОСНОВАНО В', font: 'Oswald', bold: true, size: 0.065, cx: 0.5, cy: 0.12 },
      { kind: 'text', text: '1996', font: 'Playfair Display', bold: true, size: 0.3, cx: 0.5, cy: 0.35, tone: 'accent' },
      { kind: 'text', text: 'САНКТ-ПЕТЕРБУРГ', font: 'Oswald', size: 0.055, cx: 0.5, cy: 0.56 },
      { kind: 'art', art: 'rule', x: 0.1, y: 0.63, w: 0.8 },
    ],
  },
  {
    id: 'with-love', title: 'Сделано с любовью', category: 'Надписи', height: 0.5,
    items: [
      { kind: 'text', text: 'сделано\nс любовью', font: 'Marck Script', size: 0.16, cx: 0.5, cy: 0.2, lineHeight: 1 },
      { kind: 'art', art: 'heart', x: 0.44, y: 0.4, w: 0.12 },
    ],
  },

  // ─── Команда ───
  {
    id: 'emblem', title: 'Эмблема', category: 'Команда', height: 0.84,
    items: [
      { kind: 'art', art: 'ring', x: 0.08, y: 0, w: 0.84 },
      { kind: 'text', text: 'НАША КОМАНДА', font: 'Oswald', bold: true, size: 0.075, cx: 0.5, cy: 0.155, arc: 78 },
      { kind: 'art', art: 'star', x: 0.43, y: 0.28, w: 0.14 },
      { kind: 'text', text: 'НК', font: 'Unbounded', bold: true, size: 0.15, cx: 0.5, cy: 0.5 },
      { kind: 'text', text: 'С 2026 ГОДА', font: 'Oswald', bold: true, size: 0.06, cx: 0.5, cy: 0.69, arc: -62 },
    ],
  },
  {
    id: 'player-number', title: 'Игрок и номер', category: 'Команда', height: 0.86,
    items: [
      { kind: 'text', text: 'ИВАНОВ', font: 'Oswald', bold: true, size: 0.13, cx: 0.5, cy: 0.1, arc: 40 },
      { kind: 'text', text: '10', font: 'Russo One', size: 0.5, cx: 0.5, cy: 0.47 },
      { kind: 'art', art: 'stripes', x: 0.2, y: 0.78, w: 0.6 },
    ],
  },
  {
    id: 'crew', title: 'Свои люди', category: 'Команда', height: 0.46,
    items: [
      { kind: 'art', art: 'stripes', x: 0.3, y: 0, w: 0.4 },
      { kind: 'text', text: 'СВОИ ЛЮДИ', font: 'Rubik Mono One', size: 0.105, cx: 0.5, cy: 0.19 },
      { kind: 'text', text: 'команда · сезон 2026', font: 'Montserrat', size: 0.048, cx: 0.5, cy: 0.34, tone: 'accent' },
    ],
  },

  // ─── Праздник ───
  {
    id: 'birthday-number', title: 'Юбилей', category: 'Праздник', height: 0.82,
    items: [
      { kind: 'text', text: 'с днём рождения', font: 'Lobster', size: 0.095, cx: 0.5, cy: 0.07 },
      { kind: 'text', text: '30', font: 'Unbounded', bold: true, size: 0.42, cx: 0.5, cy: 0.39, tone: 'accent' },
      { kind: 'art', art: 'rule', x: 0.2, y: 0.63, w: 0.6 },
      { kind: 'text', text: 'и это только начало', font: 'Montserrat', bold: true, size: 0.05, cx: 0.5, cy: 0.72 },
    ],
  },
  {
    id: 'graduate', title: 'Выпуск', category: 'Праздник', height: 0.7,
    items: [
      { kind: 'art', art: 'star', x: 0.44, y: 0, w: 0.12 },
      { kind: 'text', text: 'ВЫПУСК', font: 'Russo One', size: 0.17, cx: 0.5, cy: 0.25 },
      { kind: 'text', text: '2026', font: 'Russo One', size: 0.17, cx: 0.5, cy: 0.44, tone: 'accent' },
      { kind: 'text', text: '11 «А» · мы это сделали', font: 'Caveat', bold: true, size: 0.075, cx: 0.5, cy: 0.62 },
    ],
  },
];

/**
 * Места под фото по буквам слова. x, y — левый верхний угол слова, w — его ширина, всё в долях ШИРИНЫ зоны
 * (y переводится в доли высоты через aspect зоны). Каждая буква — фото с маской из одной буквы.
 */
export function letterSlots(
  text: string, font: { fontFamily: string; bold: boolean }, x: number, y: number, w: number, aspect: number,
): Array<Omit<ImageLayer, 'id' | 'side'>> {
  return letterBoxes(text, font).map((b) => {
    const mask: ImageMask = { kind: 'text', text: b.ch, fontFamily: font.fontFamily, bold: font.bold };
    const slot = maskAspect(mask);
    return {
      kind: 'image', ...photoPlaceholder(slot, true), fileName: 'Место под фото', isVector: true,
      width: w * b.w, rotation: 0, x: x + w * b.x, y: (y + w * b.y) / aspect, slot, placeholder: true, mask,
    };
  });
}
