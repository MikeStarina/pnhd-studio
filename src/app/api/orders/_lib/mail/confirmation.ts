import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { siteContacts } from '@/components/site/contacts';
import type { ConfirmationMail, MailItem } from './types';

export interface MailAttachment { cid: string; content: Buffer; contentType: string; filename: string }
export interface RenderedMail { subject: string; html: string; text: string; attachments: MailAttachment[] }

/*
 * Цвета и скругления — значения токенов сайта (src/app/tokens.css): почтовые программы не понимают CSS-переменные.
 * Вёрстка таблицами и стилями в атрибутах: так письмо одинаково выглядит в Gmail, Яндекс Почте, Mail.ru и Outlook.
 */
const INK = '#050505';
const LIME = '#b4fb53';
const MUTED = '#8a8a84';
const LINE = '#cfcfcf';
const PAPER = '#f2f2f2';
const FONT = "Roboto, 'Helvetica Neue', Helvetica, Arial, sans-serif";
const HEAD = `font-family:${FONT};font-weight:900;text-transform:uppercase;letter-spacing:0.01em;`;
const SITE = 'https://studio.pnhd.ru';
const LOGO_CID = 'logo@studio.pnhd.ru';

const esc = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const rub = (n: number) => `${Math.round(n).toLocaleString('ru-RU')} ₽`;
const deliveryPrice = (price: number | null) => (price === null ? 'рассчитает менеджер' : price > 0 ? rub(price) : 'бесплатно');

/** Письмо покупателю после оформления корзины: что заказано, доставка, итог и что будет дальше. */
export async function confirmationMail(data: ConfirmationMail): Promise<RenderedMail> {
  const logo = await readFile(path.join(process.cwd(), 'public/brand/logo-email.png'));
  const attachments: MailAttachment[] = [{ cid: LOGO_CID, content: logo, contentType: 'image/png', filename: 'logo.png' }];
  const imageSrc = (item: MailItem, i: number) => {
    if (!item.image) return null;
    if ('url' in item.image) return item.image.url;
    attachments.push({ ...item.image, filename: `item-${i + 1}.png` });
    return `cid:${item.image.cid}`;
  };
  const rows = data.items.map((item, i) => itemRow(item, imageSrc(item, i))).join('');

  const numbers = data.numbers.length
    ? `${data.numbers.length > 1 ? 'Номера заявок' : 'Номер заявки'}: ${data.numbers.map((n) => `<span style="color:${LIME};">${esc(n)}</span>`).join(', ')}`
    : '';
  const lead = 'Менеджер свяжется с&nbsp;тобой в&nbsp;течение 15&nbsp;минут в&nbsp;рабочее время, подтвердит заказ и&nbsp;пришлёт ссылку на&nbsp;оплату.';
  const preheader = `В твоём заказе: ${data.items.map((x) => x.name).join(', ')}. Итого ${rub(data.total)}.`;

  const html = `<!DOCTYPE html>
<html lang="ru" xmlns="http://www.w3.org/1999/xhtml">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light only">
<meta name="supported-color-schemes" content="light only">
<title>Спасибо за заказ</title>
<style>
  @media (max-width: 620px) {
    .px { padding-left: 20px !important; padding-right: 20px !important; }
    .hero { padding: 28px 24px !important; border-radius: 20px !important; }
    .h1 { font-size: 30px !important; line-height: 32px !important; }
    .thumb, .thumb img { width: 72px !important; height: 72px !important; }
  }
</style>
</head>
<body style="margin:0;padding:0;background:#ffffff;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;color:transparent;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#ffffff;">
<tr><td align="center" style="padding:24px 0 40px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="width:100%;max-width:600px;font-family:${FONT};color:${INK};">

  <tr><td class="px" style="padding:8px 32px 24px;">
    <a href="${SITE}" style="text-decoration:none;"><img src="cid:${LOGO_CID}" width="220" height="32" alt="Пинхэд Студия" style="display:block;border:0;width:220px;height:auto;"></a>
  </td></tr>

  <tr><td class="px" style="padding:0 16px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${INK};border-radius:24px;">
      <tr><td class="hero" style="padding:40px 40px 36px;color:#ffffff;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>
          <td width="44" height="44" align="center" valign="middle" style="width:44px;height:44px;border-radius:22px;background:${LIME};color:${INK};font-size:24px;line-height:44px;font-weight:700;">&#10003;</td>
        </tr></table>
        <h1 class="h1" style="margin:24px 0 0;${HEAD}font-size:40px;line-height:42px;color:#ffffff;">Спасибо за&nbsp;заказ!</h1>
        ${numbers ? `<p style="margin:20px 0 0;font-size:16px;line-height:24px;font-weight:700;color:#ffffff;">${numbers}</p>` : ''}
        <p style="margin:${numbers ? '8px' : '20px'} 0 0;font-size:16px;line-height:24px;color:#ffffff;">${lead}</p>
        <p style="margin:16px 0 0;font-size:13px;line-height:20px;color:${MUTED};">Работаем ${esc(siteContacts.hours.toLowerCase())}</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="px" style="padding:40px 32px 8px;">
    <h2 style="margin:0;${HEAD}font-size:24px;line-height:28px;">В&nbsp;твоём заказе</h2>
  </td></tr>
  <tr><td class="px" style="padding:0 32px;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">${rows}</table>
  </td></tr>

  <tr><td class="px" style="padding:8px 32px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding:20px 0 4px;font-size:15px;line-height:22px;">
          ${data.delivery.kind === 'pickup' ? 'Самовывоз' : 'Доставка'}
          <div style="font-size:13px;line-height:19px;color:${MUTED};">${esc(data.delivery.text)}</div>
        </td>
        <td align="right" valign="top" style="padding:20px 0 4px 16px;font-size:15px;line-height:22px;white-space:nowrap;">${deliveryPrice(data.delivery.price)}</td>
      </tr>
      <tr>
        <td style="padding:16px 0 0;${HEAD}font-size:22px;line-height:26px;">Итого</td>
        <td align="right" style="padding:16px 0 0 16px;${HEAD}font-size:22px;line-height:26px;white-space:nowrap;">${rub(data.total)}</td>
      </tr>
      <tr><td colspan="2" style="padding:6px 0 0;font-size:13px;line-height:19px;color:${MUTED};">Платить сейчас не&nbsp;нужно: ссылку на&nbsp;оплату пришлёт менеджер после подтверждения.</td></tr>
    </table>
  </td></tr>

  <tr><td class="px" style="padding:40px 16px 0;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${PAPER};border-radius:20px;">
      <tr><td style="padding:24px 24px 26px;">
        <p style="margin:0;${HEAD}font-size:18px;line-height:22px;">Есть вопрос по&nbsp;заказу?</p>
        <p style="margin:8px 0 0;font-size:15px;line-height:23px;">
          <a href="${siteContacts.phoneHref}" style="color:${INK};font-weight:700;text-decoration:none;">${esc(siteContacts.phone)}</a>
          &nbsp;·&nbsp; <a href="mailto:${siteContacts.email}" style="color:${INK};text-decoration:underline;">${siteContacts.email}</a>
        </p>
        <p style="margin:4px 0 0;font-size:13px;line-height:19px;color:${MUTED};">${esc(siteContacts.address)} · ${esc(siteContacts.hours)}</p>
      </td></tr>
    </table>
  </td></tr>

  <tr><td class="px" style="padding:28px 32px 0;font-size:12px;line-height:18px;color:${MUTED};">
    Письмо пришло после заказа на&nbsp;<a href="${SITE}" style="color:${MUTED};">studio.pnhd.ru</a>. Отвечать на&nbsp;него не&nbsp;нужно — менеджер напишет или позвонит сам.<br>
    ${esc(siteContacts.company)}
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    'Спасибо за заказ!',
    data.numbers.length ? `${data.numbers.length > 1 ? 'Номера заявок' : 'Номер заявки'}: ${data.numbers.join(', ')}` : '',
    'Менеджер свяжется с тобой в течение 15 минут в рабочее время, подтвердит заказ и пришлёт ссылку на оплату.',
    '',
    'В твоём заказе:',
    ...data.items.map((x) => `— ${x.name}${x.details.length ? ` (${x.details.join('; ')})` : ''}: ${x.qty} шт, ${rub(x.total)}`),
    '',
    `${data.delivery.kind === 'pickup' ? 'Самовывоз' : 'Доставка'}: ${data.delivery.text} — ${deliveryPrice(data.delivery.price)}`,
    `Итого: ${rub(data.total)}`,
    '',
    `Вопросы по заказу: ${siteContacts.phone}, ${siteContacts.email}`,
    siteContacts.company,
  ].filter((line, i, all) => line || all[i - 1]).join('\n');

  return { subject: 'Спасибо за заказ в Пинхэд Студии', html, text, attachments };
}

function itemRow(item: MailItem, src: string | null): string {
  const thumb = src
    ? `<img src="${esc(src)}" width="96" height="96" alt="" style="display:block;width:96px;height:96px;border:0;border-radius:12px;object-fit:cover;background:${PAPER};">`
    : '';
  const details = item.details.map((d) => `<div>${esc(d)}</div>`).join('');
  return `<tr>
    <td class="thumb" width="96" valign="top" style="width:96px;padding:20px 16px 20px 0;border-bottom:1px solid ${LINE};">
      <div class="thumb" style="width:96px;height:96px;border-radius:12px;background:${PAPER};overflow:hidden;">${thumb}</div>
    </td>
    <td valign="top" style="padding:20px 0;border-bottom:1px solid ${LINE};">
      <div style="font-size:16px;line-height:22px;font-weight:700;">${esc(item.name)}</div>
      <div style="margin-top:4px;font-size:13px;line-height:19px;color:${MUTED};">${details}<div>${item.qty}&nbsp;шт</div></div>
    </td>
    <td valign="top" align="right" style="padding:20px 0 20px 12px;border-bottom:1px solid ${LINE};white-space:nowrap;">
      ${item.fullTotal && item.fullTotal > item.total ? `<div style="font-size:13px;line-height:19px;color:${MUTED};text-decoration:line-through;">${rub(item.fullTotal)}</div>` : ''}
      <div style="font-size:16px;line-height:22px;font-weight:700;">${rub(item.total)}</div>
    </td>
  </tr>`;
}
