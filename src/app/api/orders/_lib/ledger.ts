import { appendFile, mkdir, readFile } from 'node:fs/promises';
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

const SOURCE_LABEL: Record<OrderSource, string> = { constructor: 'конструктор', cart: 'корзина' };

/** Дата по Москве в виде 2026-11-27 14:05. */
const moscow = (iso: string) =>
  new Date(iso).toLocaleString('sv-SE', { timeZone: 'Europe/Moscow', hour12: false }).slice(0, 16);

/** `;` в тексте ломает колонки CSV для Excel с русской локалью. */
const cell = (s: string) => s.replace(/[;\r\n]/g, ' ');

/**
 * Журнал в CSV для Excel: BOM, разделитель `;`. Заявка, принятая дважды (сбой хранилища и повторная
 * отправка), остаётся одной строкой — первой.
 */
export async function ledgerCsv(): Promise<string> {
  const text = await readFile(FILE, 'utf8').catch(() => '');
  const seen = new Set<string>();
  const rows = text.split('\n').filter(Boolean).flatMap((line) => {
    const e = JSON.parse(line) as LedgerEntry;
    if (seen.has(e.number)) return [];
    seen.add(e.number);
    return [[e.number, moscow(e.receivedAt), SOURCE_LABEL[e.source], cell(e.garment), cell(e.method), e.qty, e.total, e.promo ? 'да' : ''].join(';')];
  });
  return `﻿${['Номер;Дата (МСК);Откуда;Изделие;Метод;Шт;Сумма, ₽;Акция', ...rows].join('\n')}\n`;
}
