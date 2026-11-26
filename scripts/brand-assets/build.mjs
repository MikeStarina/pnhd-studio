// Собирает фавиконы и OG-картинку сайта в src/app (файловые соглашения Next.js).
// Запуск: node scripts/brand-assets/build.mjs (нужен интернет: шрифт OG берётся с Google Fonts).
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../../', import.meta.url));
const app = `${root}src/app/`;

const ink = '#050505';
const lime = '#b4fb53';

// «Игла» из логотипа: берём контур как есть и вписываем в чёрный квадрат со скруглением
const asterisk = await readFile(`${root}public/brand/asterisk.svg`, 'utf8');
const needle = asterisk.match(/<path d="([^"]+)"/)[1];

const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="12" fill="${ink}"/>
<svg x="5" y="6" width="54" height="52" viewBox="568 0 195 184"><path d="${needle}" fill="${lime}"/></svg>
</svg>
`;
await writeFile(`${app}icon.svg`, icon);

const png = (size) => sharp(Buffer.from(icon), { density: 72 * Math.ceil(size / 64) * 2 }).resize(size, size).png().toBuffer();

// apple-icon: iOS скругляет углы сам, поэтому квадрат без скругления
const appleIcon = icon.replace(' rx="12"', '');
await sharp(Buffer.from(appleIcon), { density: 72 * 6 }).resize(180, 180).png().toFile(`${app}apple-icon.png`);

// favicon.ico: PNG-записи 16, 32, 48
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile(`${app}favicon.ico`, Buffer.concat([header, ...images]));

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } });
await page.goto(new URL('og.html', import.meta.url).href);
await page.$eval('.star', (el, d) => {
  el.innerHTML = `<svg viewBox="568 0 195 184"><path d="${d}" fill="var(--color-lime)"/></svg>`;
}, needle);
await page.evaluate(() => document.fonts.ready);
const og = await page.screenshot({ type: 'png' });
await browser.close();
await sharp(og).jpeg({ quality: 88, mozjpeg: true }).toFile(`${app}opengraph-image.jpg`);

console.log('icon.svg, apple-icon.png, favicon.ico, opengraph-image.jpg → src/app');
