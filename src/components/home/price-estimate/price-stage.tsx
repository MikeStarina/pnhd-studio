import React from 'react';
import { FRAME, SHAPES } from '@/features/constructor/config/garment-shapes';
import { resolveColorHex } from '@/app/utils/product-colors';
import type { PriceFormat } from './prices';
import styles from './price-stage.module.css';

export type Fabric = 'white' | 'colored';

const MOCKUP = '/home/constructor/tshirt_regular.webp';
/** Принт — фирменная звезда (brand/asterisk.svg, 195×184): синяя на белой ткани, салатовая на цветной; доля ширины формата */
const PRINT_RATIO = 184 / 195;
const PRINT_FILL = 0.9;
const TINT: Record<Fabric, string> = {
  white: resolveColorHex('белый') ?? '#ffffff',
  colored: resolveColorHex('чёрный') ?? '#111111',
};

/*
 * Масштаб — из зоны печати переда футболки в конструкторе: ширина зоны в долях кадра ↔ её ширина в см,
 * одна шкала на обе оси. Принт стоит по центру груди, верх — на CHEST_CM ниже шва горловины.
 */
const zone = SHAPES.tshirt_regular.areas.front;
const perCmX = zone.width / zone.widthCm;
const perCmY = (perCmX * FRAME.w) / FRAME.h;
const CHEST_CM = 7;
/** Самый большой формат: рамка нарисована под него, остальные — вырез из неё */
const MAX = { w: 32.9, h: 48.3 };
const box = {
  left: 0.5 - (MAX.w * perCmX) / 2,
  top: (zone.collar?.y ?? zone.y) + CHEST_CM * perCmY,
  width: MAX.w * perCmX,
  height: MAX.h * perCmY,
};
const pct = (value: number) => `${(value * 100).toFixed(3)}%`;

/**
 * Футболка с принтом в реальном масштабе формата. Размер меняется только через transform (без width/height):
 * звезда нарисована под A3+ и уменьшается одним масштабом.
 */
const PriceStage: React.FC<{ format: PriceFormat; fabric: Fabric }> = ({ format, fabric }) => {
  const sx = format.w / MAX.w;
  const sy = format.h / MAX.h;
  // Звезда почти квадратная, формат вертикальный: ставим её по центру формата по высоте.
  // Сдвиг translateY — в долях высоты самой картинки до масштаба (MAX.w × PRINT_RATIO в см).
  const scale = Math.min(sx, sy) * PRINT_FILL;
  const offset = (format.h - MAX.w * scale * PRINT_RATIO) / 2 / (MAX.w * PRINT_RATIO);

  return (
    <div className={styles.stage} data-fabric={fabric}>
      <div className={styles.tint} style={{ '--tint': TINT[fabric], '--mock': `url(${MOCKUP})` } as React.CSSProperties} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MOCKUP} alt="" className={styles.shade} draggable={false} />
      <div
        className={styles.box}
        style={{ left: pct(box.left), top: pct(box.top), width: pct(box.width), height: pct(box.height) }}
      >
        <span className={styles.print} style={{ transform: `translateY(${pct(offset)}) scale(${scale})` }} />
      </div>
    </div>
  );
};

export default PriceStage;
