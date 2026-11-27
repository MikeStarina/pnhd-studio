import { readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { expect, test } from '@playwright/test';
import { MAIL_DIR } from '../playwright.config';
import { openConstructor, orderAndSubmit, solidPng, uploadImage } from './helpers';

interface SavedMail { to: string; subject: string; html: string; text: string; attachments: string[] }

/** Письма, в которых упомянута заявка: проекты Playwright идут параллельно и пишут в одну папку. */
async function mailsFor(number: string): Promise<SavedMail[]> {
  const names = await readdir(path.resolve(MAIL_DIR)).catch(() => []);
  const mails = await Promise.all(names.map(async (n) => JSON.parse(await readFile(path.resolve(MAIL_DIR, n), 'utf8')) as SavedMail));
  return mails.filter((m) => m.text.includes(number));
}

test('после оформления покупателю уходит одно письмо со всем заказом', async ({ page }) => {
  let confirm: { url: string; body: string } | undefined;
  page.on('request', (r) => {
    if (r.method() === 'POST' && new URL(r.url()).pathname === '/api/orders/confirm') confirm = { url: r.url(), body: r.postData()! };
  });
  await openConstructor(page);
  await uploadImage(page, 'logo.png', solidPng(1200, 1200, [255, 0, 170]));
  const number = await orderAndSubmit(page, { M: 2, L: 1 });

  await expect.poll(() => mailsFor(number).then((m) => m.length), { timeout: 30_000 }).toBe(1);
  const [mail] = await mailsFor(number);
  expect(mail.to).toBe('autotest@example.com');
  expect(mail.subject).toBe('Спасибо за заказ в Пинхэд Студии');
  expect(mail.text).toContain('Спасибо за заказ!');
  expect(mail.text).toContain(`Номер заявки: ${number}`);
  expect(mail.text).toContain('свой принт');
  expect(mail.text).toContain('M×2, L×1');
  expect(mail.text).toContain('3 шт');
  expect(mail.attachments).toEqual(['logo.png', 'item-1.png']);

  // То же оформление ещё раз (перезагрузка, повтор запроса) второго письма не даёт.
  const again = await page.request.post(confirm!.url, { headers: { 'content-type': 'application/json' }, data: confirm!.body });
  expect(await again.json()).toMatchObject({ ok: true, sent: false });
  expect(await mailsFor(number)).toHaveLength(1);
});
