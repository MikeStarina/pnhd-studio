import type { GarmentType } from '../model/types';

/**
 * Векторные силуэты изделий (viewBox 200×240) — заглушка, пока нет плоских мокапов
 * от Pinhead. Красятся в цвет варианта (stageColor из API).
 */
export const SILHOUETTE_VIEWBOX = { w: 200, h: 240 };

const TEE = 'M70 12 Q100 30 130 12 L176 32 L198 82 L164 96 L156 78 L156 232 L44 232 L44 78 L36 96 L2 82 L24 32 Z';
const LONG = 'M70 12 Q100 30 130 12 L170 28 L196 200 L172 206 L156 90 L156 232 L44 232 L44 90 L28 206 L4 200 L30 28 Z';
const HOODIE =
  'M62 22 Q66 0 100 0 Q134 0 138 22 L172 36 L196 204 L172 210 L158 96 L158 232 L42 232 L42 96 L28 210 L4 204 L28 36 Z';
const TOTE = 'M60 70 Q60 10 100 10 Q140 10 140 70 L132 70 Q132 20 100 20 Q68 20 68 70 L170 70 L170 236 L30 236 L30 70 Z';
const CAP = 'M30 150 Q30 60 100 60 Q170 60 170 150 L196 160 Q200 176 184 176 L16 176 Q0 176 4 160 Z';

export const SILHOUETTES: Record<GarmentType, string> = {
  tshirt: TEE,
  longsleeve: LONG,
  sweatshirt: LONG,
  hoodie: HOODIE,
  totebag: TOTE,
  cap: CAP,
};
