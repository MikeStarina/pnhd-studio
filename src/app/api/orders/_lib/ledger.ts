import { appendFile, mkdir, readFile } from 'node:fs/promises';
import type { Row, Worksheet } from 'exceljs';
import path from 'node:path';
import type { Order } from './parse';

/**
 * Бессрочный журнал принятых заявок: по строке JSON на заявку, без контактов клиента.
 * Лежит рядом с заявками (ORDER_STORE_DIR — том Docker), очистка хранилища его не трогает.
 */
const FILE = path.join(path.resolve(process.env.ORDER_STORE_DIR || 'data/orders'), 'ledger.jsonl');

export type OrderSource = 'constructor' | 'cart';

/** Откуда отправлена заявка: с оформления корзины или из формы конструктора. */
export const orderSource = (page: string): OrderSource =>
  /^\/(checkout|cart)(\/|$)/.test(page ? new URL(page).pathname : '') ? 'cart' : 'constructor';

interface LedgerEntry {
  number: string;
  receivedAt: string;
  source: OrderSource;
  garment: string;
  method: string;
  qty: number;
  total: number;
  promo: boolean;
}

export async function recordOrder(o: Order): Promise<void> {
  const entry: LedgerEntry = {
    number: o.number, receivedAt: new Date().toISOString(), source: orderSource(o.page),
    garment: o.garment.name, method: o.method, qty: o.qty, total: o.total, promo: o.promo,
  };
  await mkdir(path.dirname(FILE), { recursive: true });
  await appendFile(FILE, `${JSON.stringify(entry)}\n`);
}

const SOURCE_LABEL: Record<OrderSource, string> = { constructor: 'Конструктор', cart: 'Корзина' };

/** Записи журнала; заявка, принятая дважды (сбой хранилища и повторная отправка), — одна, первая. */
async function readLedger(): Promise<LedgerEntry[]> {
  const text = await readFile(FILE, 'utf8').catch(() => '');
  const seen = new Set<string>();
  return text.split('\n').filter(Boolean).flatMap((line) => {
    const e = JSON.parse(line) as LedgerEntry;
    if (seen.has(e.number)) return [];
    seen.add(e.number);
    return [e];
  });
}

/** В Excel у даты нет часового пояса: пишем московское время как есть (Москва — UTC+3 круглый год). */
const moscowDate = (iso: string) => new Date(Date.parse(iso) + 3 * 3600_000);

/** «Ноябрь 2026» по московскому времени. */
const monthLabel = (iso: string) => {
  const s = new Date(iso).toLocaleString('ru-RU', { month: 'long', year: 'numeric', timeZone: 'Europe/Moscow' }).replace(/\s*г\.?$/, '');
  return s[0].toUpperCase() + s.slice(1);
};

const MONEY = '#,##0" ₽"';
const BORDER = { style: 'thin' as const, color: { argb: 'FFE3E3E3' } };

/** Шапка, итоги, рамки и печать — общее у обоих листов. */
function dress(sheet: Worksheet, rows: number) {
  // Пустые клетки строки eachCell пропускает — берём все по числу столбцов.
  const cells = (row: Row) => Array.from({ length: sheet.columnCount }, (_, i) => row.getCell(i + 1));
  const header = sheet.getRow(1);
  header.height = 24;
  header.eachCell((c) => {
    c.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A1A1A' } };
    c.alignment = { vertical: 'middle', horizontal: c.alignment?.horizontal ?? 'left' };
  });
  for (let r = 2; r <= rows + 1; r++) {
    const row = sheet.getRow(r);
    row.height = 20;
    cells(row).forEach((c) => {
      c.border = { bottom: BORDER };
      c.alignment = { ...c.alignment, vertical: 'middle' };
    });
  }
  const totals = sheet.getRow(rows + 2);
  totals.height = 24;
  cells(totals).forEach((c) => {
    c.font = { bold: true };
    c.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF2F2F2' } };
    c.border = { top: { style: 'medium', color: { argb: 'FF1A1A1A' } } };
    c.alignment = { ...c.alignment, vertical: 'middle' };
  });
  sheet.views = [{ state: 'frozen', ySplit: 1 }];
  sheet.pageSetup = { orientation: 'landscape', fitToPage: true, fitToWidth: 1, fitToHeight: 0, printTitlesRow: '1:1' };
}

/** Итог по столбцу: SUBTOTAL считает только строки, видимые после фильтра. */
const subtotal = (col: string, rows: number, result: number) => ({ formula: `SUBTOTAL(109,${col}2:${col}${rows + 1})`, result });

/**
 * Журнал в Excel: лист «Заявки» (фильтр, закреплённая шапка, итоги по отфильтрованному)
 * и лист «По месяцам».
 */
export async function ledgerXlsx(): Promise<ArrayBuffer> {
  const { default: ExcelJS } = await import('exceljs');
  const entries = await readLedger();
  const book = new ExcelJS.Workbook();
  book.creator = 'studio.pnhd.ru';
  book.created = new Date();

  const orders = book.addWorksheet('Заявки');
  orders.columns = [
    { header: 'Номер', key: 'number', width: 12 },
    { header: 'Дата', key: 'date', width: 18, style: { numFmt: 'dd.mm.yyyy hh:mm', alignment: { horizontal: 'left' } } },
    { header: 'Откуда', key: 'source', width: 14 },
    { header: 'Изделие', key: 'garment', width: 40 },
    { header: 'Метод', key: 'method', width: 9, style: { alignment: { horizontal: 'center' } } },
    { header: 'Штук', key: 'qty', width: 9, style: { numFmt: '0', alignment: { horizontal: 'right' } } },
    { header: 'Сумма, ₽', key: 'total', width: 15, style: { numFmt: MONEY, alignment: { horizontal: 'right' } } },
    { header: 'Акция', key: 'promo', width: 9, style: { alignment: { horizontal: 'center' } } },
  ];
  orders.addRows(entries.map((e) => ({
    number: e.number, date: moscowDate(e.receivedAt), source: SOURCE_LABEL[e.source], garment: e.garment,
    method: e.method.toUpperCase(), qty: e.qty, total: e.total, promo: e.promo ? 'да' : '',
  })));
  const n = entries.length;
  orders.addRow({
    number: 'Итого',
    date: { formula: `SUBTOTAL(103,A2:A${n + 1})`, result: n },
    qty: subtotal('F', n, entries.reduce((s, e) => s + e.qty, 0)),
    total: subtotal('G', n, entries.reduce((s, e) => s + e.total, 0)),
  });
  orders.getCell(`B${n + 2}`).numFmt = '"Заявок: "0';
  orders.autoFilter = { from: 'A1', to: `H${n + 1}` };
  dress(orders, n);

  const byMonth = new Map<string, { count: number; qty: number; total: number }>();
  for (const e of entries) {
    const m = byMonth.get(monthLabel(e.receivedAt)) ?? { count: 0, qty: 0, total: 0 };
    byMonth.set(monthLabel(e.receivedAt), { count: m.count + 1, qty: m.qty + e.qty, total: m.total + e.total });
  }
  const months = book.addWorksheet('По месяцам');
  months.columns = [
    { header: 'Месяц', key: 'month', width: 18 },
    { header: 'Заявок', key: 'count', width: 10, style: { numFmt: '0', alignment: { horizontal: 'right' } } },
    { header: 'Штук', key: 'qty', width: 10, style: { numFmt: '0', alignment: { horizontal: 'right' } } },
    { header: 'Сумма, ₽', key: 'total', width: 16, style: { numFmt: MONEY, alignment: { horizontal: 'right' } } },
  ];
  months.addRows([...byMonth].map(([month, m]) => ({ month, ...m })));
  const k = byMonth.size;
  months.addRow({
    month: 'Всего', count: subtotal('B', k, n),
    qty: subtotal('C', k, entries.reduce((s, e) => s + e.qty, 0)),
    total: subtotal('D', k, entries.reduce((s, e) => s + e.total, 0)),
  });
  dress(months, k);

  return book.xlsx.writeBuffer();
}
