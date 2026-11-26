import React from 'react';
import styles from './corner-star.module.css';

/**
 * Звезда из линий-«иголок» бренда в правом верхнем углу секции: лучи уходят за верх и правый край, секция их обрезает.
 * Цвет — от текста секции (на чёрном — белая), толщина линий одна при любом размере.
 */
const CornerStar: React.FC = () => (
  <svg className={styles.star} viewBox="0 0 622 598" fill="none" aria-hidden="true" focusable="false">
    <path
      d="M314.669 287.189L268.508 597.158M314.669 287.189L521.669 455.606M314.669 287.189L621.236 210.73M314.669 287.189L479.441 107.407M314.669 287.189L360.623 0.158203M314.669 287.189L92.1443 103.481M314.669 287.189L0.236328 363.648M314.669 287.189L145.964 478.543"
      stroke="currentColor"
      vectorEffect="non-scaling-stroke"
    />
  </svg>
);

export default CornerStar;
