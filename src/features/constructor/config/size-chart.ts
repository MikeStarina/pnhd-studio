/**
 * Обмеры изделий, см. ЗАГЛУШКА из типовых значений для унисекс-кроя —
 * точные цифры по каждой модели нужно взять у производителя и подставить сюда.
 */
export interface SizeChartRow { size: string; chest: number; length: number; sleeve: number }

export const SIZE_CHART: SizeChartRow[] = [
  { size: 'XS', chest: 49, length: 66, sleeve: 20 },
  { size: 'S', chest: 52, length: 69, sleeve: 21 },
  { size: 'M', chest: 55, length: 72, sleeve: 22 },
  { size: 'L', chest: 58, length: 75, sleeve: 23 },
  { size: 'XL', chest: 61, length: 78, sleeve: 24 },
  { size: 'XXL', chest: 64, length: 81, sleeve: 25 },
  { size: 'XXXL', chest: 67, length: 84, sleeve: 26 },
];
