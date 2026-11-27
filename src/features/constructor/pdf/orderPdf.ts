import { pickupLine } from '../config/pickup';
import { methodsLabel, mixedMethods, SIDE_LABEL, type OrderContacts, type PrintMethod, type Side } from '../model/types';
import type { PriceBreakdown, SidePrice } from '../model/pricing';

/**
 * PDF заказа, одна страница A4. Без внешних библиотек: страница рисуется на canvas,
 * сохраняется в JPEG и упаковывается в минимальный PDF (JPEG в PDF хранится как есть, фильтр DCTDecode).
 * Текст в таком файле — картинка: его нельзя выделить, зато не нужны шрифты и зависимости.
 */
export interface OrderPdfData {
  number: string;
  createdAt: Date;
  garment: string;
  method: PrintMethod;
  /** Цвета, размеры и цены — по price.lines. */
  price: PriceBreakdown;
  contacts: OrderContacts;
  /** Превью по цветам и сторонам, в порядке price.lines (PNG dataURL). */
  previews: Array<{ color: string; side: Side; dataUrl: string }>;
  /** Имена файлов, загруженных клиентом. */
  fileNames: string[];
}

/** A4 в пунктах PDF и ширина страницы в пикселях (~200 dpi). */
const PAGE = { w: 595.28, h: 841.89 };
const PX = 1654;
const FONT = "Neue_machina, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif";
const C = { text: '#000000', muted: '#6b6b6b', line: '#d9d9d9', accent: '#b4fb53', paper: '#f3f4f3' };

const rub = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('pdf_image'));
    img.src = src;
  });
}

/** Пишет текст с переносом по словам; возвращает y следующей строки. */
function wrap(ctx: CanvasRenderingContext2D, text: string, x: number, y: number, maxW: number, lineH: number, draw = true): number {
  let line = '';
  for (const word of text.split(/\s+/).filter(Boolean)) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxW) {
      if (draw) ctx.fillText(line, x, y);
      line = word;
      y += lineH;
    } else {
      line = test;
    }
  }
  if (line && draw) ctx.fillText(line, x, y);
  return y + lineH;
}

async function renderPage(d: OrderPdfData): Promise<HTMLCanvasElement> {
  const W = PX;
  const H = Math.round((PX * PAGE.h) / PAGE.w);
  const M = 100;
  const canvas = document.createElement('canvas');
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('pdf_canvas');
  const font = (size: number, weight = 500) => `${weight} ${size}px ${FONT}`;

  ctx.fillStyle = '#fff';
  ctx.fillRect(0, 0, W, H);
  ctx.textBaseline = 'alphabetic';

  // Шапка
  ctx.fillStyle = C.text;
  ctx.font = font(48, 800);
  ctx.fillText('PINHEAD STUDIO', M, M + 40);
  ctx.textAlign = 'right';
  ctx.font = font(34, 700);
  ctx.fillText(`Заказ № ${d.number}`, W - M, M + 20);
  ctx.font = font(24);
  ctx.fillStyle = C.muted;
  ctx.fillText(d.createdAt.toLocaleString('ru-RU', { dateStyle: 'long', timeStyle: 'short' }), W - M, M + 58);
  ctx.textAlign = 'left';
  ctx.fillStyle = C.accent;
  ctx.fillRect(M, M + 88, W - 2 * M, 6);

  // Превью: одно-два — крупно, дальше до четырёх в ряд; больше восьми не рисуем.
  const top = M + 130;
  const gap = 24;
  const LABEL_H = 56;
  const MAX_PREVIEWS = 8;
  const shown = d.previews.slice(0, MAX_PREVIEWS);
  const hidden = d.previews.length - shown.length;
  const images = await Promise.all(shown.map((p) => loadImage(p.dataUrl)));
  const cols = shown.length <= 2 ? 2 : 4;
  const baseW = Math.floor((W - 2 * M - gap * (cols - 1)) / cols);

  // Детали заказа: список «название — значение»; одинаков для расчёта высоты и для рисования.
  const colGap = 70;
  const cw = (W - 2 * M - colGap) / 2;
  const p = d.price;
  // Формат печати у всех цветов одинаковый (зависит от габарита принта), цена — разная.
  const printSides = p.lines[0]?.sides ?? [];
  const mixed = mixedMethods(d.method, printSides.map((x) => x.side));
  const tag = (x: SidePrice) => (mixed ? ` ${x.method.toUpperCase()}` : '');
  const details: Array<[string, string]> = [
    ['Изделие', d.garment],
    ['Нанесение', methodsLabel(d.method, printSides.map((x) => x.side))],
  ];
  if (printSides.length) {
    details.push(['Формат печати', printSides.map((x) =>
      `${SIDE_LABEL[x.side].toLowerCase()} ${x.format}${tag(x)}${x.oversize ? ' (крупнее формата)' : ''} ≈ ${Math.round(x.wCm)} × ${Math.round(x.hCm)} см`,
    ).join('; ')]);
  }
  for (const l of p.lines) {
    const prints = l.sides.map((x) => `${SIDE_LABEL[x.side].toLowerCase()} ${x.format}${tag(x)} ${rub(x.price)}`).join(', ');
    details.push([`Цвет: ${l.color} — ${l.qty} шт`, l.sizes.map(([s, q]) => `${s} × ${q}`).join(', ')]);
    details.push(['За шт', `${rub(l.perItem)} (изделие ${rub(l.garment)}${l.garment < l.garmentFull ? ` вместо ${rub(l.garmentFull)} по акции` : ''}${prints ? ` + печать: ${prints}` : ''})`]);
    details.push(['Сумма по цвету', rub(l.total)]);
  }
  details.push(['Количество всего', `${p.qty} шт`]);
  if (p.tierFrom > 1) details.push(['Цена печати', `действует от ${p.tierFrom} шт`]);
  if (d.fileNames.length) details.push(['Файлы клиента', d.fileNames.join(', ')]);

  const rows = (title: string, x: number, y0: number, items: Array<[string, string]>, draw = true) => {
    let y = y0;
    if (draw) {
      ctx.fillStyle = C.text;
      ctx.font = font(32, 800);
      ctx.fillText(title, x, y);
    }
    y += 56;
    for (const [k, v] of items) {
      if (draw) {
        ctx.fillStyle = C.muted;
        ctx.font = font(21);
        ctx.fillText(k, x, y);
        ctx.fillStyle = C.text;
      }
      ctx.font = font(25, 600);
      y = wrap(ctx, v, x, y + 32, cw, 32, draw) + 14;
    }
    return y;
  };

  // Нижняя граница, до которой могут дойти детали: подвал и запас под него.
  const bottom = H - M - 20;
  // Масштаб превью уменьшаем, пока детали не поместятся под ними.
  let scale = 1;
  let ph = 0;
  for (let attempt = 0; attempt < 12; attempt++) {
    const pw = Math.floor(baseW * scale);
    const rowsH: number[] = [];
    images.forEach((img, i) => {
      const r = Math.floor(i / cols);
      rowsH[r] = Math.max(rowsH[r] ?? 0, Math.round((pw * img.naturalHeight) / img.naturalWidth));
    });
    ph = rowsH.reduce((s, h) => s + h + LABEL_H, 0) + (hidden > 0 ? 40 : 0);
    const yDry = top + ph + 40 + 30;
    if (rows('Детали заказа', M, yDry, details, false) <= bottom || scale < 0.4) break;
    scale *= 0.92;
  }

  const pw = Math.floor(baseW * scale);
  let rowY = top;
  let rowH = 0;
  ctx.font = font(22);
  images.forEach((img, i) => {
    const col = i % cols;
    if (col === 0 && i > 0) { rowY += rowH + LABEL_H; rowH = 0; }
    const h = Math.round((pw * img.naturalHeight) / img.naturalWidth);
    rowH = Math.max(rowH, h);
    const x = M + col * (pw + gap);
    ctx.fillStyle = C.paper;
    ctx.fillRect(x, rowY, pw, h);
    ctx.drawImage(img, x, rowY, pw, h);
    ctx.fillStyle = C.muted;
    ctx.font = font(22);
    let label = `${shown[i].color} · ${SIDE_LABEL[shown[i].side]}`;
    while (label.length > 3 && ctx.measureText(label).width > pw) label = `${label.slice(0, -2)}…`;
    ctx.fillText(label, x, rowY + h + 34);
  });
  if (hidden > 0) {
    ctx.fillStyle = C.muted;
    ctx.font = font(22);
    ctx.fillText(`ещё ${hidden} макетов — в заявке`, M, top + ph - 8);
  }

  // Две колонки: детали заказа и контакты.
  const y0 = top + ph + 70;
  const c = d.contacts;
  const yDetails = rows('Детали заказа', M, y0, details);
  const yContacts = rows('Контакты', M + cw + colGap, y0, [
    ['Имя', c.name], ['Телефон', c.phone], ['E-mail', c.email],
    ['Получение', c.delivery === 'delivery' ? `Доставка: ${c.city}${c.address ? `, ${c.address}` : ''}` : `Самовывоз: ${pickupLine()}`],
    ['Комментарий', c.comment || '—'],
  ]);

  // Итог — под контактами.
  let y = yContacts + 20;
  const tx = M + cw + colGap;
  ctx.fillStyle = C.line;
  ctx.fillRect(tx, y, cw, 2);
  y += 52;
  ctx.fillStyle = C.muted;
  ctx.font = font(24);
  ctx.fillText('Сумма заказа', tx, y);
  // Сумма на лаймовой плашке: лаймовый текст на белом не читается.
  ctx.font = font(50, 800);
  ctx.fillStyle = C.accent;
  ctx.fillRect(tx - 12, y + 14, ctx.measureText(rub(p.total)).width + 24, 66);
  ctx.fillStyle = C.text;
  ctx.fillText(rub(p.total), tx, y + 62);
  ctx.fillStyle = C.muted;
  ctx.font = font(20);
  y = wrap(ctx, 'Цена окончательная. Менеджер проверит макет и назовёт сроки.', tx, y + 104, cw, 28);

  // Подвал
  ctx.fillStyle = C.muted;
  ctx.font = font(20);
  ctx.fillText('Документ сформирован в конструкторе Pinhead Studio.', M, Math.max(H - M + 30, Math.max(y, yDetails)));

  return canvas;
}

/** PDF из одной JPEG-картинки на всю страницу A4. */
function jpegToPdf(jpeg: Uint8Array<ArrayBuffer>, imgW: number, imgH: number): Blob {
  const enc = new TextEncoder();
  const parts: BlobPart[] = [];
  const offsets: number[] = [];
  let length = 0;
  const push = (chunk: string | Uint8Array<ArrayBuffer>) => {
    const bytes = typeof chunk === 'string' ? enc.encode(chunk) : chunk;
    parts.push(bytes);
    length += bytes.length;
  };
  const obj = (id: number, body: string) => {
    offsets[id] = length;
    push(`${id} 0 obj\n${body}\nendobj\n`);
  };

  const content = `q ${PAGE.w} 0 0 ${PAGE.h} 0 0 cm /Im0 Do Q`;
  push('%PDF-1.4\n');
  obj(1, '<< /Type /Catalog /Pages 2 0 R >>');
  obj(2, '<< /Type /Pages /Kids [3 0 R] /Count 1 >>');
  obj(3, `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE.w} ${PAGE.h}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`);
  offsets[4] = length;
  push(`4 0 obj\n<< /Type /XObject /Subtype /Image /Width ${imgW} /Height ${imgH} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${jpeg.length} >>\nstream\n`);
  push(jpeg);
  push('\nendstream\nendobj\n');
  obj(5, `<< /Length ${content.length} >>\nstream\n${content}\nendstream`);

  const xref = length;
  let table = 'xref\n0 6\n0000000000 65535 f \n';
  for (let i = 1; i <= 5; i++) table += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  push(`${table}trailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
  return new Blob(parts, { type: 'application/pdf' });
}

export async function buildOrderPdf(data: OrderPdfData): Promise<Blob> {
  const canvas = await renderPage(data);
  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.9));
  if (!blob) throw new Error('pdf_jpeg');
  return jpegToPdf(new Uint8Array(await blob.arrayBuffer()), canvas.width, canvas.height);
}
