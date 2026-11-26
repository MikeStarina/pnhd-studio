import type { PhotoShape } from '../model/types';

export interface PhotoShapeDef {
  id: PhotoShape;
  label: string;
  /** Высота / ширина естественной рамки формы. */
  aspect: number;
  /** Контур SVG в рамке шириной 100 и высотой 100 × aspect; касается всех четырёх краёв. */
  d: string;
}

export const PHOTO_SHAPES: PhotoShapeDef[] = [
  { id: 'circle', label: 'Круг', aspect: 1, d: 'M50 0A50 50 0 1 1 50 100A50 50 0 1 1 50 0Z' },
  { id: 'rounded', label: 'Скруглённый', aspect: 1, d: 'M18 0H82A18 18 0 0 1 100 18V82A18 18 0 0 1 82 100H18A18 18 0 0 1 0 82V18A18 18 0 0 1 18 0Z' },
  {
    id: 'heart',
    label: 'Сердце',
    aspect: 0.9,
    d: 'M50 90C50 90 0 58 0 28C0 12 12 0 27 0C38 0 46 6 50 14C54 6 62 0 73 0C88 0 100 12 100 28C100 58 50 90 50 90Z',
  },
  {
    id: 'star',
    label: 'Звезда',
    aspect: 0.951,
    d: 'M50 0L62.98 34.71L100 36.33L71 59.4L80.9 95.11L50 74.65L19.1 95.11L29 59.4L0 36.33L37.02 34.71Z',
  },
  { id: 'arch', label: 'Арка', aspect: 1.3, d: 'M0 130V50A50 50 0 0 1 100 50V130Z' },
  { id: 'hexagon', label: 'Шестиугольник', aspect: 1.1547, d: 'M50 0L100 28.87V86.6L50 115.47L0 86.6V28.87Z' },
];

export const PHOTO_SHAPE = Object.fromEntries(PHOTO_SHAPES.map((s) => [s.id, s])) as Record<PhotoShape, PhotoShapeDef>;
