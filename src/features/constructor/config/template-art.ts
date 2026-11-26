/**
 * Графика готовых принтов: рамки, плёнка, штрихкод, кнопки плеера и т.п.
 * Каждая картинка — функция от цветов: SVG собирается под цвет ткани в момент применения шаблона
 * и кладётся в слой как data-URL, поэтому отдельных файлов и запросов нет.
 */
export interface ArtColors {
  /** Основной цвет линий: тёмный на светлой ткани, светлый на тёмной. */
  ink: string;
  /** Акцент. */
  accent: string;
  /** Ткань светлая — белым деталям нужен контур. */
  light: boolean;
}

interface ArtDef {
  /** Размер в условных единицах (viewBox). */
  w: number;
  h: number;
  body: (c: ArtColors) => string;
}

/** Ширина растра SVG в пикселях: Safari рисует SVG на canvas в собственном размере, а не в размере вывода. */
const RASTER_W = 2000;

const bars = (x0: number, y: number, h: number, widths: number[], fill: string) => {
  let x = x0;
  let out = '';
  widths.forEach((w, i) => {
    if (i % 2 === 0) out += `<rect x="${x.toFixed(2)}" y="${y}" width="${w}" height="${h}" fill="${fill}"/>`;
    x += w;
  });
  return out;
};

const ART = {
  /** Карточка моментального фото: белое поле, окно под снимок сверху, место под подпись снизу. */
  polaroid: {
    w: 100, h: 120,
    body: (c) => `<rect x="0.5" y="0.5" width="99" height="119" rx="1.5" fill="#ffffff" stroke="${c.light ? '#cfcfcf' : '#ffffff'}" stroke-width="1"/>`
      + '<rect x="7" y="7" width="86" height="86" fill="#e9e9e9"/>',
  },
  /** Кадры фотоплёнки: три окна и перфорация по краям. */
  film: {
    w: 60, h: 186,
    body: (c) => {
      const stroke = c.light ? 'none' : '#6a6a6a';
      let holes = '';
      for (let y = 5; y < 182; y += 8) holes += `<rect x="2" y="${y}" width="3.2" height="4.4" rx="0.8" fill="#f2f2f2"/><rect x="54.8" y="${y}" width="3.2" height="4.4" rx="0.8" fill="#f2f2f2"/>`;
      const windows = [12, 70, 128].map((y) => `<rect x="8" y="${y}" width="44" height="46" fill="#3a3a3a"/>`).join('');
      return `<rect x="0.4" y="0.4" width="59.2" height="185.2" rx="1.5" fill="#161616" stroke="${stroke}" stroke-width="0.8"/>${holes}${windows}`;
    },
  },
  /** Штрихкод. */
  barcode: {
    w: 100, h: 22,
    body: (c) => bars(0, 0, 22, [2, 1, 1, 2, 3, 1, 1, 1, 2, 2, 1, 3, 2, 1, 1, 1, 3, 2, 1, 2, 2, 1, 1, 3, 1, 1, 2, 2, 3, 1, 1, 2, 1, 1, 3, 1, 2, 2, 1, 1, 2, 3, 1, 1, 2, 1, 3, 2, 1, 1, 2, 1, 1, 2, 3, 1, 2, 1, 1, 2], c.ink),
  },
  /** Рамка этикетки: контур и две разделительные линии. */
  label: {
    w: 100, h: 132,
    body: (c) => `<rect x="1" y="1" width="98" height="130" fill="none" stroke="${c.ink}" stroke-width="2"/>`
      + `<path d="M1 30h98M1 96h98" stroke="${c.ink}" stroke-width="1.4"/>`,
  },
  /** Плеер: полоса прогресса и кнопки. */
  player: {
    w: 100, h: 26,
    body: (c) => `<rect x="0" y="2.2" width="100" height="1.6" rx="0.8" fill="${c.ink}" opacity="0.35"/>`
      + `<rect x="0" y="2.2" width="42" height="1.6" rx="0.8" fill="${c.ink}"/><circle cx="42" cy="3" r="2.6" fill="${c.ink}"/>`
      + `<circle cx="50" cy="17" r="8" fill="${c.ink}"/><path d="M47.6 12.8v8.4l7-4.2z" fill="${c.light ? '#ffffff' : '#111111'}"/>`
      + `<path d="M30 12.5v9M32.5 17l7-4.5v9z" fill="${c.ink}" stroke="${c.ink}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`
      + `<path d="M70 12.5v9M67.5 17l-7-4.5v9z" fill="${c.ink}" stroke="${c.ink}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round"/>`,
  },
  /** Двойное кольцо эмблемы. */
  ring: {
    w: 100, h: 100,
    body: (c) => `<circle cx="50" cy="50" r="48.6" fill="none" stroke="${c.ink}" stroke-width="2"/>`
      + `<circle cx="50" cy="50" r="30" fill="none" stroke="${c.ink}" stroke-width="1"/>`,
  },
  /** Тонкая линия-разделитель. */
  rule: { w: 100, h: 1.6, body: (c) => `<rect width="100" height="1.6" fill="${c.ink}"/>` },
  /** Две полосы акцентом. */
  stripes: {
    w: 100, h: 9,
    body: (c) => `<rect width="100" height="3.4" fill="${c.accent}"/><rect y="5.6" width="100" height="3.4" fill="${c.accent}"/>`,
  },
  star: {
    w: 24, h: 23,
    body: (c) => `<path d="M12 0l3.5 7.6 8.5 1-6.3 5.7 1.7 8.2L12 18.4 4.6 22.5l1.7-8.2L0 8.6l8.5-1z" fill="${c.accent}"/>`,
  },
  heart: {
    w: 24, h: 21,
    body: (c) => `<path d="M12 21C4 15 0 11 0 6.3 0 2.8 2.7 0 6.2 0 8.5 0 10.7 1.2 12 3.2 13.300 1.2 15.5 0 17.8 0 21.3 0 24 2.8 24 6.300c0 4.700-4 8.700-12 14.700z" fill="${c.accent}"/>`,
  },
} satisfies Record<string, ArtDef>;

export type ArtId = keyof typeof ART;

/** Высота картинки в долях её ширины. */
export const artAspect = (id: ArtId) => ART[id].h / ART[id].w;

const toUrl = (svg: string) => `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
const wrap = (w: number, h: number, body: string) => {
  const pxH = Math.round((RASTER_W * h) / w);
  return {
    src: toUrl(`<svg xmlns="http://www.w3.org/2000/svg" width="${RASTER_W}" height="${pxH}" viewBox="0 0 ${w} ${h}">${body}</svg>`),
    naturalWidth: RASTER_W,
    naturalHeight: pxH,
  };
};

/** Готовая картинка под цвета ткани: data-URL и размер растра. */
export function artImage(id: ArtId, c: ArtColors) {
  const a: ArtDef = ART[id];
  return wrap(a.w, a.h, a.body(c));
}

/** Заглушка «место под фото» с заданными пропорциями (высота в долях ширины). */
export function photoPlaceholder(aspect: number, plain = false) {
  const h = 100 * aspect;
  const cy = h / 2;
  // Для фото, обрезанного по буквам или полосам, — ровная заливка: значок сквозь маску выглядел бы обрывками.
  if (plain) return wrap(100, h, `<rect width="100" height="${h}" fill="#c4c4c4"/>`);
  const body = `<rect width="100" height="${h}" fill="#bdbdbd"/>`
    + `<circle cx="38" cy="${cy - 9}" r="5.5" fill="#f4f4f4"/>`
    + `<path d="M22 ${cy + 16}l16-18 9 9 9-13 22 22z" fill="#f4f4f4"/>`
    + `<rect x="2" y="2" width="96" height="${h - 4}" fill="none" stroke="#f4f4f4" stroke-width="1.2" stroke-dasharray="4 3"/>`;
  return wrap(100, h, body);
}
