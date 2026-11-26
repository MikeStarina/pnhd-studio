import { expect, test } from '@playwright/test';
import ExcelJS from 'exceljs';
import { openConstructor, orderAndSubmit, readStored, solidPng, uploadImage } from './helpers';

/**
 * Журнал заявок: каждая принятая заявка остаётся в бессрочном журнале без контактов клиента.
 * Выгрузка Excel закрыта паролем (ORDER_LEDGER_TOKEN, в тестах — из playwright.config.ts).
 */
const auth = (password: string) => ({ authorization: `Basic ${Buffer.from(`report:${password}`).toString('base64')}` });

test('принятая заявка попадает в выгрузку журнала, выгрузка закрыта паролем', async ({ page, request }, info) => {
  test.skip(info.project.name !== 'desktop-1440', 'журнал серверный — хватает одного прогона');

  const anonymous = await request.get('/api/orders/ledger');
  expect(anonymous.status()).toBe(401);
  expect(anonymous.headers()['www-authenticate']).toContain('Basic');
  expect((await request.get('/api/orders/ledger', { headers: auth('wrong') })).status()).toBe(401);

  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(800, 800, [0, 120, 255]));
  const number = await orderAndSubmit(page, { M: 2, L: 1 });
  const { meta } = await readStored(number);

  const res = await request.get('/api/orders/ledger', { headers: auth('e2e-ledger-password') });
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toContain('spreadsheetml');
  expect(res.headers()['content-disposition']).toMatch(/filename="zayavki-\d{4}-\d{2}-\d{2}\.xlsx"/);

  const book = new ExcelJS.Workbook();
  const body = await res.body();
  await book.xlsx.load(body.buffer.slice(body.byteOffset, body.byteOffset + body.byteLength) as ArrayBuffer);
  const sheet = book.getWorksheet('Заявки')!;
  expect(sheet.getRow(1).values).toEqual([undefined, 'Номер', 'Дата', 'Откуда', 'Изделие', 'Метод', 'Штук', 'Сумма, ₽', 'Акция']);
  let row: ExcelJS.Row | undefined;
  sheet.eachRow((r) => { if (r.getCell(1).value === number) row = r; });
  expect(row).toBeDefined();
  expect(row!.getCell(2).value).toBeInstanceOf(Date);
  expect(row!.getCell(3).value).toBe('Корзина');
  expect(row!.getCell(5).value).toBe('DTF');
  expect(row!.getCell(6).value).toBe(3);
  expect(row!.getCell(7).value).toBe(meta.total);

  // Последняя строка — итоги по видимым строкам (фильтр их учитывает).
  const totals = sheet.getRow(sheet.rowCount);
  expect(totals.getCell(1).value).toBe('Итого');
  expect((totals.getCell(7).value as ExcelJS.CellFormulaValue).formula).toMatch(/^SUBTOTAL\(109,G2:G\d+\)$/);

  // Сводка по месяцам: заявка учтена в своём месяце.
  const months = book.getWorksheet('По месяцам')!;
  expect(months.getRow(1).values).toEqual([undefined, 'Месяц', 'Заявок', 'Штук', 'Сумма, ₽']);
  expect(months.rowCount).toBeGreaterThan(1);

  // Контактов клиента в журнале нет.
  const text = JSON.stringify(sheet.getSheetValues());
  expect(text).not.toContain('autotest@example.com');
  expect(text).not.toContain('pinhead_test');
});
