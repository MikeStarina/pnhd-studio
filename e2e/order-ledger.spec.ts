import { expect, test } from '@playwright/test';
import { openConstructor, orderAndSubmit, readStored, solidPng, uploadImage } from './helpers';

/**
 * Журнал заявок: каждая принятая заявка остаётся в бессрочном журнале без контактов клиента.
 * Выгрузка CSV закрыта паролем (ORDER_LEDGER_TOKEN, в тестах — из playwright.config.ts).
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
  expect(res.headers()['content-type']).toContain('text/csv');
  const csv = await res.text();
  expect(csv.split('\n')[0]).toBe('﻿Номер;Дата (МСК);Откуда;Изделие;Метод;Шт;Сумма, ₽;Акция');
  const row = csv.split('\n').find((l) => l.startsWith(`${number};`));
  expect(row).toBeDefined();
  const cells = row!.split(';');
  expect(cells[1]).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/);
  expect(cells[2]).toBe('корзина');
  expect(cells[5]).toBe('3');
  expect(cells[6]).toBe(String(meta.total));
  // Контактов клиента в журнале нет.
  expect(csv).not.toContain('autotest@example.com');
  expect(csv).not.toContain('pinhead_test');
});
