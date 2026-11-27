import type { GarmentType, PlaceSpot, PrintArea, Side } from '../model/types';
import { BASE_PATH } from './base-path';

/**
 * Плоские мокапы изделий: серые фото (яркость 128 = основной цвет ткани), которые
 * перекрашиваются в цвет варианта с сохранением складок. Лежат в /public/mockups.
 * Координаты зон — в системе кадра 400×460 (так размечены фото), ширина зоны — в см.
 *
 * Шкала сантиметров одна на обе оси зоны: ширина зоны в единицах кадра ↔ widthCm, высота — в той же шкале (квадрат на холсте —
 * квадрат на ткани). Мокапы вытянуты по высоте, поэтому зоны переда и спины идут вниз только на реальную длину изделия M.
 */
export const FRAME = { w: 400, h: 460 };

export type ShapeId = 'tshirt_regular' | 'tshirt_oversize' | 'longsleeve' | 'sweatshirt' | 'hoodie' | 'ziphoodie' | 'totebag';

type Flat = 'front' | 'back';

/** Перед и спина есть у всех мокапов; рукава — только у одежды (у шоппера их нет); карман — у худи (тот же мокап, что у переда). */
export interface GarmentShape {
  images: Record<Flat, string> & Partial<Record<Side, string>>;
  areas: Record<Flat, PrintArea> & Partial<Record<Side, PrintArea>>;
}

/** Прямоугольник в единицах кадра → доли. */
const area = (x: number, y: number, w: number, h: number, widthCm: number): PrintArea => ({
  x: x / FRAME.w, y: y / FRAME.h, width: w / FRAME.w, height: h / FRAME.h, widthCm,
});
const img = (name: string) => `${BASE_PATH}/mockups/${name}.png`;
/**
 * Мокапы рукавов — кадр 1200×1380 (3× от логического). Рукава — на виде сбоку: `<name>_side` — левый бок (перед изделия смотрит влево), `<name>_side_r` — тот же снимок
 * зеркально для правого рукава.
 */
const views = (front: string, back: string, side: string): Partial<Record<Side, string>> & Record<'front' | 'back', string> => ({
  front: img(front), back: img(back), sleeve_left: img(`${side}_side`), sleeve_right: img(`${side}_side_r`),
});

type Outline = NonNullable<PrintArea['outline']>;

/**
 * ВРЕМЕННО, до обмеров производства: размеры изделия M в сантиметрах — ширина корпуса (грудь, шов — шов) и длина от плеча до низа.
 * По ним посчитаны ширина зон (widthCm: ширина корпуса на мокапе = w см) и их высота (длина l минус ~4 см). Когда придут обмеры —
 * поправить таблицу и пересчитать зоны.
 */
export const GARMENT_REF_CM = {
  tshirt_regular: { w: 52, l: 72 },
  tshirt_oversize: { w: 60, l: 74 },
  longsleeve: { w: 52, l: 70 },
  sweatshirt: { w: 56, l: 68 },
  hoodie: { w: 58, l: 70 },
  ziphoodie: { w: 58, l: 70 },
} as const;

/** Места, которые предлагаются кнопками на переде и на спине. */
const FRONT_PLACES: PlaceSpot[] = ['heart', 'chest'];
const BACK_PLACES: PlaceSpot[] = ['back'];

/**
 * Зона переда или спины: рамка в единицах кадра, ширина в см, контур (доли рамки; нет — прямоугольник), шов горловины
 * по центру (единицы кадра), места нанесения и части, если зону делит молния.
 */
const body = (
  x: number, y: number, w: number, h: number, widthCm: number, outline: Outline | undefined,
  collar: [x: number, y: number] | undefined, places: PlaceSpot[], parts?: Outline[],
): PrintArea => ({
  ...area(x, y, w, h, widthCm), outline, parts, collar: collar && { x: collar[0] / FRAME.w, y: collar[1] / FRAME.h }, places,
});

/**
 * Зона рукава на виде сбоку; правый рукав — зеркально по кадру.
 * outline — фигурная зона по форме рукава (доли рамки зоны, по часовой стрелке); для правого рукава
 * зеркалится по x, порядок точек разворачивается, чтобы обход остался по часовой.
 * fromTop — сколько срезать сверху (доля высоты рамки от плечевого шва): у плеча печатать тяжело даже DTF;
 * контур обрезается по этой линии.
 */
const sleeves = (x: number, y: number, w: number, h: number, widthCm: number, outline?: Outline, fromTop = 0) => {
  const cut = outline && fromTop ? clipBelow(outline, fromTop) : outline;
  const [top, height] = [y + h * fromTop, h * (1 - fromTop)];
  return {
    sleeve_left: { ...area(x, top, w, height, widthCm), outline: cut },
    sleeve_right: {
      ...area(FRAME.w - x - w, top, w, height, widthCm),
      outline: cut?.map(([px, py]): [number, number] => [1 - px, py]).reverse(),
    },
  };
};

/** Часть контура ниже линии t (доля высоты), пересчитанная в новую рамку от t до низа. */
function clipBelow(outline: Outline, t: number): Outline {
  const out: Outline = [];
  outline.forEach((a, i) => {
    const b = outline[(i + 1) % outline.length];
    if (a[1] >= t) out.push(a);
    // ребро пересекает линию — добавляем точку пересечения
    if ((a[1] - t) * (b[1] - t) < 0) out.push([a[0] + ((b[0] - a[0]) * (t - a[1])) / (b[1] - a[1]), t]);
  });
  return out.map(([px, py]) => [px, (py - t) / (1 - t)]);
}

/**
 * Короткий рукав: у шва (≈1 см) печатать легко, у самого плеча — тяжело. Контур идёт по шву, низ — ≈1 см над строчкой подгибки,
 * а у REGULAR срезана верхушка дуги (доля высоты рамки), где рукав переходит в плечо. У OVERSIZE плечо спущено — дуга и есть шов, её не режем.
 */
const TEE_SHOULDER_CUT = 0.15;

/** Длинный рукав: зона от манжеты до чуть выше локтя — доля длины рукава от плечевого шва, выше которой не печатаем. */
const ABOVE_ELBOW = 0.45;

/** Рукав лонгслива: контур снят по швам на снимке (с отступом ~3 ед.) — сверху по плечевому шву, книзу сужается к манжете. */
const LONGSLEEVE_SLEEVE: Outline = [[0.052, 0.103], [0.155, 0.048], [0.328, 0.014], [0.552, 0.0], [0.81, 0.007], [0.966, 0.034], [1.0, 0.075], [0.983, 0.151], [0.931, 0.253], [0.931, 0.356], [0.914, 0.425], [0.897, 0.493], [0.862, 0.562], [0.81, 0.699], [0.741, 0.836], [0.69, 0.938], [0.655, 0.979], [0.603, 1.0], [0.241, 1.0], [0.207, 0.979], [0.19, 0.938], [0.172, 0.836], [0.155, 0.699], [0.155, 0.562], [0.138, 0.493], [0.103, 0.425], [0.086, 0.356], [0.052, 0.253], [0.0, 0.151]];
/** Короткий рукав футболки: сверху по дуге плечевого шва, снизу — над подгибкой. */
const TSHIRT_SLEEVE: Outline = [[0.0, 0.402], [0.08, 0.196], [0.227, 0.062], [0.427, 0.0], [0.653, 0.021], [0.84, 0.093], [0.973, 0.216], [1.0, 0.351], [1.0, 0.711], [1.0, 1.0], [0.0, 1.0], [0.0, 0.711]];
/** Рукав оверсайза: от спущенного плечевого шва до подгибки. */
const OVERSIZE_SLEEVE: Outline = [[0.0, 0.15], [0.133, 0.05], [0.32, 0.01], [0.613, 0.0], [0.88, 0.04], [1.0, 0.13], [1.0, 0.6], [1.0, 1.0], [0.0, 1.0], [0.0, 0.6]];
/** Рукав свитшота: контур по швам на снимке, с отступом ~3 ед.; снизу — до манжеты. */
const SWEATSHIRT_SLEEVE: Outline = [[0.044, 0.098], [0.132, 0.049], [0.309, 0.014], [0.544, 0.0], [0.779, 0.007], [0.926, 0.035], [0.985, 0.077], [1.0, 0.14], [0.985, 0.21], [0.971, 0.35], [0.941, 0.42], [0.926, 0.49], [0.912, 0.559], [0.897, 0.629], [0.882, 0.699], [0.868, 0.769], [0.838, 0.839], [0.809, 0.909], [0.779, 0.951], [0.735, 0.986], [0.691, 1.0], [0.235, 1.0], [0.191, 0.979], [0.162, 0.944], [0.132, 0.909], [0.132, 0.839], [0.103, 0.769], [0.088, 0.629], [0.074, 0.49], [0.059, 0.35], [0.044, 0.21], [0.0, 0.14]];
/** Рукав худи: контур по швам на снимке, с отступом ~3 ед. */
const HOODIE_SLEEVE: Outline = [[0.05, 0.075], [0.15, 0.035], [0.35, 0.008], [0.583, 0.0], [0.817, 0.008], [0.95, 0.035], [1.0, 0.075], [1.0, 0.154], [1.0, 0.272], [0.983, 0.35], [0.95, 0.429], [0.933, 0.508], [0.9, 0.587], [0.867, 0.665], [0.85, 0.744], [0.817, 0.823], [0.783, 0.902], [0.75, 0.949], [0.7, 0.988], [0.65, 1.0], [0.117, 1.0], [0.067, 0.98], [0.05, 0.941], [0.033, 0.862], [0.017, 0.783], [0.0, 0.665], [0.0, 0.587], [0.0, 0.508], [0.0, 0.429], [0.0, 0.272], [0.017, 0.193], [0.033, 0.134]];
/** Рукав зип-худи: контур по швам на снимке, с отступом ~3 ед. */
const ZIP_SLEEVE: Outline = [[0.017, 0.078], [0.121, 0.035], [0.328, 0.009], [0.552, 0.0], [0.793, 0.009], [0.931, 0.039], [0.983, 0.082], [1.0, 0.134], [1.0, 0.264], [0.983, 0.351], [0.983, 0.437], [0.966, 0.524], [0.948, 0.61], [0.931, 0.697], [0.897, 0.784], [0.862, 0.87], [0.828, 0.939], [0.793, 0.97], [0.741, 0.991], [0.69, 1.0], [0.19, 1.0], [0.138, 0.983], [0.121, 0.939], [0.086, 0.87], [0.069, 0.784], [0.034, 0.697], [0.017, 0.61], [0.0, 0.524], [0.0, 0.437], [0.0, 0.264], [0.0, 0.177], [0.0, 0.113]];

/**
 * Шкала корпуса — единиц кадра на сантиметр (ориентир M, см. GARMENT_REF_CM). Одна на обе оси: квадрат на холсте — квадрат на ткани.
 */
const SCALE = {
  tshirt_regular: 204 / 50.4,
  tshirt_oversize: 217 / 58.2,
  longsleeve: 182 / 50.2,
  sweatshirt: 184 / 54,
  hoodie: 191 / 57.2,
  ziphoodie: 179 / 57.1,
} as const;

/**
 * Перед и спина — прямоугольник по центру изделия (решение владельца: печать у боков и плеч неудобно прижимать).
 * Ширина — в см по шкале корпуса; верх — под швом горловины, низ — у нижнего шва на мокапе.
 */
const centered = (
  scale: number, widthCm: number, top: number, bottom: number, collarY: number, places: PlaceSpot[], parts?: Outline[],
): PrintArea => body(FRAME.w / 2 - (widthCm * scale) / 2, top, widthCm * scale, bottom - top, widthCm, undefined, [FRAME.w / 2, collarY], places, parts);

/**
 * До нижнего шва на мокапе (у свитшота и худи — до резинки) — решение владельца, хотя мокап длиннее изделия M: высота в см
 * выходит завышенной. Перед худи — до верха кармана.
 */
const TSHIRT_FRONT = centered(SCALE.tshirt_regular, 38, 85, 410, 78.7, FRONT_PLACES);
const TSHIRT_BACK = centered(SCALE.tshirt_regular, 38, 78, 410, 53.3, BACK_PLACES);
const OVERSIZE_FRONT = centered(SCALE.tshirt_oversize, 46, 85, 410, 77.3, FRONT_PLACES);
const OVERSIZE_BACK = centered(SCALE.tshirt_oversize, 46, 78, 410, 55, BACK_PLACES);
const LONGSLEEVE_FRONT = centered(SCALE.longsleeve, 44, 92, 401, 87.3, FRONT_PLACES);
const LONGSLEEVE_BACK = centered(SCALE.longsleeve, 44, 80, 401, 58.7, BACK_PLACES);
const SWEATSHIRT_FRONT = centered(SCALE.sweatshirt, 40, 100, 356, 95.3, FRONT_PLACES);
const SWEATSHIRT_BACK = centered(SCALE.sweatshirt, 40, 78, 355, 68, BACK_PLACES);
/** Худи, перед: до верха кармана-кенгуру. */
const HOODIE_FRONT = centered(SCALE.hoodie, 46, 124, 263, 119.3, FRONT_PLACES);
/** Худи, спина: ниже капюшона. */
const HOODIE_BACK = centered(SCALE.hoodie, 46, 160, 365, 148.7, BACK_PLACES);

/** Карман-кенгуру худи — отдельная зона печати (вкладка «Карман»): прямоугольник по ширине верха кармана. */
const HOODIE_POCKET = area(144, 277.3, 112, 84.3, 112 / SCALE.hoodie);

/** Полоса молнии зип-худи, см: не печатается. */
const ZIP_CM = 2;
/**
 * Зип-худи, перёд: прямоугольник по центру из двух половин по молнии (до верха карманов). Принт можно положить
 * на одну половину или через молнию — полоса просто вырезается.
 */
const ZIP_W_CM = 46;
const zipGap = ZIP_CM / ZIP_W_CM / 2;
const ZIP_FRONT = centered(SCALE.ziphoodie, ZIP_W_CM, 129, 260, 124, ['heart'], [
  [[0, 0], [0.5 - zipGap, 0], [0.5 - zipGap, 1], [0, 1]],
  [[0.5 + zipGap, 0], [1, 0], [1, 1], [0.5 + zipGap, 1]],
]);

/**
 * Рукава худи: зона по форме рукава (контур HOODIE_SLEEVE); сантиметры — по шкале рукава (5 ед. кадра ≈ 1 см).
 */
const HOODIE_SLEEVES = sleeves(165, 131, 60, 254, 12.0, HOODIE_SLEEVE, ABOVE_ELBOW);
/** Зип-худи — свой вид сбоку и своя разметка рукава. */
const ZIP_SLEEVES = sleeves(170, 139, 58, 231, 11.6, ZIP_SLEEVE, ABOVE_ELBOW);

/**
 * Шоппер 35×40 см: одна картинка на обе стороны. Корпус сумки — 222 ед. кадра ≈ 35 см (6,3 ед. на см);
 * зона 33 × 29,5 см — весь корпус ниже строчек ручек, с отступом ~1 см от боковых швов и дна.
 */
const TOTE_AREA = area(95, 218.3, 210, 186.7, 33);

export const SHAPES: Record<ShapeId, GarmentShape> = {
  totebag: {
    images: { front: img('totebag'), back: img('totebag') },
    areas: { front: TOTE_AREA, back: TOTE_AREA },
  },
  tshirt_regular: {
    images: views('tshirt_regular', 'tshirt_regular_back', 'tshirt_regular'),
    areas: { front: TSHIRT_FRONT, back: TSHIRT_BACK, ...sleeves(175, 91, 75, 101, 15.0, TSHIRT_SLEEVE, TEE_SHOULDER_CUT) },
  },
  tshirt_oversize: {
    images: views('tshirt_oversize', 'tshirt_oversize_back', 'tshirt_oversize'),
    areas: { front: OVERSIZE_FRONT, back: OVERSIZE_BACK, ...sleeves(168, 140, 75, 100, 15.0, OVERSIZE_SLEEVE) },
  },
  longsleeve: {
    images: views('longsleeve', 'longsleeve_back', 'longsleeve'),
    areas: { front: LONGSLEEVE_FRONT, back: LONGSLEEVE_BACK, ...sleeves(180, 96, 58, 292, 11.6, LONGSLEEVE_SLEEVE, ABOVE_ELBOW) },
  },
  sweatshirt: {
    images: views('sweatshirt', 'sweatshirt_back', 'sweatshirt'),
    areas: { front: SWEATSHIRT_FRONT, back: SWEATSHIRT_BACK, ...sleeves(167, 100, 68, 286, 13.6, SWEATSHIRT_SLEEVE, ABOVE_ELBOW) },
  },
  hoodie: {
    images: { ...views('hoodie', 'hoodie_back', 'hoodie'), pocket: img('hoodie') },
    // перед: от горловины до верха кармана-кенгуру; карман — отдельная зона (вкладка «Карман», тот же мокап); спина — без капюшона
    areas: { front: HOODIE_FRONT, back: HOODIE_BACK, pocket: HOODIE_POCKET, ...HOODIE_SLEEVES },
  },
  ziphoodie: {
    images: views('ziphoodie', 'hoodie_back', 'ziphoodie'),
    // две половины по молнии в одной зоне переда (полоса молнии не печатается); спина — как у худи (тот же мокап)
    areas: { front: ZIP_FRONT, back: HOODIE_BACK, ...ZIP_SLEEVES },
  },
};

/** Подбор мокапа к модели из каталога сайта. null — мокапа нет, рисуем силуэт. */
export function shapeFor(type: GarmentType, modelName: string): ShapeId | null {
  const n = modelName.toLowerCase();
  switch (type) {
    case 'tshirt':
      return n.includes('oversize') ? 'tshirt_oversize' : 'tshirt_regular';
    case 'longsleeve':
      return 'longsleeve';
    case 'sweatshirt':
      return 'sweatshirt';
    case 'hoodie':
      return n.includes('зип') || n.includes('zip') ? 'ziphoodie' : 'hoodie';
    case 'totebag':
      return 'totebag';
    default:
      return null;
  }
}
