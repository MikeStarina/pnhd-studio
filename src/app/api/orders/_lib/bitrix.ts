import { orderSource } from './ledger';
import { orderText, type Order } from './parse';

/** COMMENTS сделки — HTML: текст клиента экранируем, переносы строк ставим сами. */
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
export const dealComments = (text: string) => escapeHtml(text).replace(/\n/g, '<br>');

/** Предел ожидания одного вызова: зависший Битрикс не держит заявку клиента и повторную отправку. */
const CALL_TIMEOUT_MS = 120_000;

/**
 * Схема CRM Pinhead: воронка, свои поля сделки и значения списков. Задана в CRM, на сайте не меняется.
 * Источник сделки сайт не ставит: его подставляет Roistat по номеру визита и ClientID Метрики.
 */
export const CRM = {
  category: 52, // воронка «Студия»
  orderNumber: 'UF_CRM_1700558521016',
  metrikaClientId: 'UF_CRM_DCT_YA_CID',
  roistatVisit: 'UF_CRM_ROISTAT',
  project: { field: 'UF_CRM_6A7B1BE7505A0', studio: 2256 },
  /** Страница, с которой отправлена заявка: Конструктор 2500, Главная 2502, Каталог 2504, Корзина 2506. */
  page: { field: 'UF_CRM_DEAL_URL_PAGE', constructor: 2500, home: 2502, catalog: 2504, cart: 2506 },
} as const;

/** Значение поля «Страница» по адресу отправки; undefined — такой страницы нет в списке CRM. */
const crmPage = (page: string): number | undefined => {
  const path = /^https?:\/\//.test(page) ? new URL(page).pathname : '';
  if (path === '/') return CRM.page.home;
  if (/^\/(cart|checkout)(\/|$)/.test(path)) return CRM.page.cart;
  if (/^\/constructor(\/|$)/.test(path)) return CRM.page.constructor;
  if (/^\/(shop|catalog)(\/|$)/.test(path)) return CRM.page.catalog;
  return undefined;
};

/** Аналитика заявки: по визиту Roistat CRM ставит сделке источник, ClientID — для офлайн-конверсий Метрики. */
interface DealAnalytics { page: string; roistat: string; clientId: string; utm: Record<string, string> }

/** Поля, общие для всех сделок с сайта: воронка, проект, страница отправки, аналитика. */
export const siteDealFields = (a: DealAnalytics) => {
  const page = crmPage(a.page);
  return {
    CATEGORY_ID: CRM.category,
    OPENED: 'Y',
    [CRM.project.field]: CRM.project.studio,
    ...(page ? { [CRM.page.field]: page } : {}),
    ...(a.clientId ? { [CRM.metrikaClientId]: a.clientId } : {}),
    ...(a.roistat ? { [CRM.roistatVisit]: a.roistat } : {}),
    UTM_SOURCE: a.utm.source,
    UTM_MEDIUM: a.utm.medium,
    UTM_CAMPAIGN: a.utm.campaign,
    UTM_CONTENT: a.utm.content,
    UTM_TERM: a.utm.term,
  };
};

/** Вызов REST Битрикс24 через входящий вебхук; бросает ошибку, если Битрикс не вернул результат. */
export const bitrixCall = (webhook: string) => {
  const base = webhook.replace(/\/+$/, '');
  return async <T>(method: string, body: unknown): Promise<T> => {
    const r = await fetch(`${base}/${method}.json`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(CALL_TIMEOUT_MS),
    });
    const json = (await r.json().catch(() => ({}))) as { result?: T; error?: string; error_description?: string };
    if (!r.ok || json.error || json.result === undefined) {
      throw new Error(`bitrix ${method}: ${json.error_description || json.error || r.status}`);
    }
    return json.result;
  };
};

interface DealContact { name: string; phone: string; email?: string; telegram?: string; city?: string; address?: string }

/** Контакт — не обязательное условие: если не создался, сделка всё равно уйдёт с контактами в тексте. */
export async function addContact(call: ReturnType<typeof bitrixCall>, c: DealContact, tag: string): Promise<number | undefined> {
  try {
    return await call<number>('crm.contact.add', {
      fields: {
        NAME: c.name,
        OPENED: 'Y',
        PHONE: [{ VALUE: c.phone, VALUE_TYPE: 'WORK' }],
        ...(c.email ? { EMAIL: [{ VALUE: c.email, VALUE_TYPE: 'WORK' }] } : {}),
        // Стандартное поле «Мессенджеры»: из карточки контакта открывается чат
        ...(c.telegram ? { IM: [{ VALUE: c.telegram.slice(1), VALUE_TYPE: 'TELEGRAM' }] } : {}),
        ...(c.city ? { ADDRESS_CITY: c.city } : {}),
        ...(c.address ? { ADDRESS: c.address } : {}),
      },
    });
  } catch (e) {
    console.error('[bitrix]', tag, e);
    return undefined;
  }
}

/**
 * Заявка конструктора в Битрикс24 через входящий вебхук (права: CRM).
 * Создаётся контакт и сделка; файлы прикладываются комментариями в ленту сделки — по одному на файл,
 * чтобы один большой файл не уронил остальные.
 *
 * @param webhook  адрес вебхука вида https://<портал>.bitrix24.ru/rest/<id>/<ключ>/
 * @returns имена недоставленных файлов; бросает ошибку, если не создалась сделка.
 */
export async function sendToBitrix(o: Order, webhook: string): Promise<string[]> {
  const call = bitrixCall(webhook);
  const contactId = await addContact(call, o.contacts, o.number);

  const dealId = await call<number>('crm.deal.add', {
    fields: {
      TITLE: `Конструктор № ${o.number}: ${o.garment.name}, ${o.qty} шт${o.lines.length > 1 ? `, ${o.lines.length} цв.` : ''}`,
      ...siteDealFields(o),
      ...(contactId ? { CONTACT_ID: contactId } : {}),
      OPPORTUNITY: o.total,
      CURRENCY_ID: 'RUB',
      COMMENTS: dealComments(orderText(o)),
      [CRM.orderNumber]: o.number,
      // Заявка конструктора без страницы (или с чужой) — всё равно из конструктора.
      [CRM.page.field]: orderSource(o.page) === 'cart' ? CRM.page.cart : CRM.page.constructor,
    },
    params: { REGISTER_SONET_EVENT: 'Y' },
  });

  const failed: string[] = [];
  for (const f of o.files) {
    try {
      const base64 = Buffer.from(await f.file.arrayBuffer()).toString('base64');
      await call('crm.timeline.comment.add', {
        fields: { ENTITY_ID: dealId, ENTITY_TYPE: 'deal', COMMENT: f.title, FILES: [[f.name, base64]] },
      });
    } catch (e) {
      console.error('[order]', o.number, e);
      failed.push(f.name);
    }
  }
  if (failed.length) {
    await call('crm.timeline.comment.add', {
      fields: {
        ENTITY_ID: dealId, ENTITY_TYPE: 'deal',
        COMMENT: `⚠️ Не удалось приложить файлы: ${failed.join(', ')}. Запросите макет у клиента. Копии 30 дней лежат на сервере сайта.`,
      },
    }).catch(() => undefined);
  }
  return failed;
}
