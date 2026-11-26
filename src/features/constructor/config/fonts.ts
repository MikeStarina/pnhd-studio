/**
 * Шрифты для текста. Все с кириллицей; файлы лежат в проекте (config/font-files.ts), грузятся по требованию (model/fonts.ts).
 * bold / italic — есть ли у семейства настоящее начертание; без него кнопка в панели неактивна
 * (подделанное браузером начертание в файле печати выглядит иначе, чем задумано).
 */
export type FontGroup = 'simple' | 'display' | 'serif' | 'script';

export interface FontDef {
  family: string;
  group: FontGroup;
  bold: boolean;
  italic: boolean;
}

export const FONT_GROUPS: Array<[FontGroup, string]> = [
  ['simple', 'Простые'], ['display', 'Плакатные'], ['serif', 'С засечками'], ['script', 'Рукописные'],
];

export const FONTS: FontDef[] = [
  { family: 'Roboto', group: 'simple', bold: true, italic: true },
  { family: 'Montserrat', group: 'simple', bold: true, italic: true },
  { family: 'Oswald', group: 'simple', bold: true, italic: false },
  { family: 'Russo One', group: 'display', bold: false, italic: false },
  { family: 'Rubik Mono One', group: 'display', bold: false, italic: false },
  { family: 'Unbounded', group: 'display', bold: true, italic: false },
  { family: 'Ruslan Display', group: 'display', bold: false, italic: false },
  { family: 'PT Serif', group: 'serif', bold: true, italic: true },
  { family: 'Playfair Display', group: 'serif', bold: true, italic: true },
  { family: 'Caveat', group: 'script', bold: true, italic: false },
  { family: 'Lobster', group: 'script', bold: false, italic: false },
  { family: 'Marck Script', group: 'script', bold: false, italic: false },
];

export const DEFAULT_FONT = 'Montserrat';

export const fontDef = (family: string) => FONTS.find((f) => f.family === family);

/** Цвета текста — быстрый выбор; свой цвет задаётся отдельным полем. */
export const TEXT_COLORS = [
  '#ffffff', '#111111', '#d32f2f', '#ff7a00', '#ffd400', '#99ff00',
  '#1faa59', '#00b8d9', '#1f4fd8', '#7a3cff', '#ff4fa3', '#8a8a8a',
];
