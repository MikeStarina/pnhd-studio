import { expect, test } from '@playwright/test';

/** Номер заявки — ST и порядковый номер из четырёх цифр; каждый следующий на единицу больше. */
test('номера заявок идут по порядку: ST-0001, ST-0002…', async ({ request }) => {
  const issue = async () => {
    const res = await request.post('/api/orders/number');
    expect(res.ok()).toBe(true);
    return String((await res.json()).number);
  };
  const first = await issue();
  const second = await issue();
  expect(first).toMatch(/^ST-\d{4,}$/);
  expect(Number(second.slice(3))).toBe(Number(first.slice(3)) + 1);
  expect(second).toBe(`ST-${String(Number(first.slice(3)) + 1).padStart(4, '0')}`);
});
