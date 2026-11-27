import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { RenderedMail } from './confirmation';

/** Есть ли куда слать: без этого черновики писем не копим (в них почта покупателя). */
export const mailConfigured = () =>
  Boolean(process.env.MAIL_TEST_DIR || (process.env.MAIL_LOGIN && process.env.MAIL_PASS));

/**
 * Отправка письма покупателю через SMTP Яндекса с ящика MAIL_LOGIN (пароль приложения — MAIL_PASS).
 * MAIL_TEST_DIR — вместо отправки письмо пишется JSON-файлом в эту папку (тесты).
 * @returns false — почта не настроена, письмо не ушло.
 */
export async function sendMail(to: string, mail: RenderedMail): Promise<boolean> {
  const testDir = process.env.MAIL_TEST_DIR;
  if (testDir) {
    await mkdir(testDir, { recursive: true });
    const file = path.join(testDir, `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.json`);
    await writeFile(file, JSON.stringify({
      to, subject: mail.subject, html: mail.html, text: mail.text, attachments: mail.attachments.map((a) => a.filename),
    }));
    return true;
  }
  const user = process.env.MAIL_LOGIN;
  const pass = process.env.MAIL_PASS;
  if (!user || !pass) {
    console.log('[mail] not configured: письмо покупателю не отправлено', to.replace(/^(.).*@/, '$1***@'));
    return false;
  }
  const { createTransport } = await import('nodemailer');
  await createTransport({ host: 'smtp.yandex.ru', port: 465, secure: true, auth: { user, pass } }).sendMail({
    from: { name: 'Пинхэд Студия', address: user },
    to,
    subject: mail.subject,
    html: mail.html,
    text: mail.text,
    attachments: mail.attachments.map((a) => ({ cid: a.cid, content: a.content, contentType: a.contentType, filename: a.filename })),
  });
  return true;
}
