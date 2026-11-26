import React from 'react';
import { FRAME, SHAPES } from '@/features/constructor/config/garment-shapes';
import { resolveColorHex } from '@/app/utils/product-colors';
import type { PriceFormat } from './prices';
import styles from './price-stage.module.css';

export type Fabric = 'white' | 'colored';

const MOCKUP = '/home/constructor/tshirt_regular.webp';
const PRINT: Record<Fabric, string> = {
  white: '/home/constructor/prints/print-1-light.webp',
  colored: '/home/constructor/prints/print-1-dark.webp',
};
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
 * Футболка с местом под принт в реальном масштабе. Размер формата меняется через clip-path и transform
 * (без width/height): рамка вырезается из прямоугольника под A3+, принт уменьшается одним масштабом от верха.
 */
const PriceStage: React.FC<{ format: PriceFormat; fabric: Fabric }> = ({ format, fabric }) => {
  const sx = format.w / MAX.w;
  const sy = format.h / MAX.h;
  const side = pct((1 - sx) / 2);

  return (
    <div className={styles.stage} data-fabric={fabric}>
      <div className={styles.tint} style={{ '--tint': TINT[fabric], '--mock': `url(${MOCKUP})` } as React.CSSProperties} />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={MOCKUP} alt="" className={styles.shade} draggable={false} />
      <div
        className={styles.box}
        style={{ left: pct(box.left), top: pct(box.top), width: pct(box.width), height: pct(box.height) }}
      >
        <span className={styles.area} style={{ clipPath: `inset(0 ${side} ${pct(1 - sy)} ${side})` }} />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={PRINT[fabric]}
          alt=""
          className={styles.print}
          style={{ transform: `scale(${Math.min(sx, sy)})` }}
          draggable={false}
        />
      </div>
    </div>
  );
};

export default PriceStage;
