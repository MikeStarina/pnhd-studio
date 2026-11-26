import { orderSource } from './ledger';
import { orderText, type Order } from './parse';

/** COMMENTS сделки — HTML: текст клиента экранируем, переносы строк ставим сами. */
const escapeHtml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Предел ожидания одного вызова: зависший Битрикс не держит заявку клиента и повторную отправку. */
const CALL_TIMEOUT_MS = 120_000;

/**
 * Схема CRM Pinhead: воронка, свои поля сделки и значения списков. Задана в CRM, на сайте не меняется.
 * Источник сделки сайт не ставит: его подставляет Roistat по номеру визита и ClientID Метрики.
 */
const CRM = {
  category: 52, // воронка «Студия»
  orderNumber: 'UF_CRM_1700558521016',
  metrikaClientId: 'UF_CRM_DCT_YA_CID',
  roistatVisit: 'UF_CRM_ROISTAT',
  project: { field: 'UF_CRM_6A7B1BE7505A0', studio: 2256 },
  /** Страница, с которой отправлена заявка: Конструктор 2500, Главная 2502, Каталог 2504, Корзина 2506. */
  page: { field: 'UF_CRM_DEAL_URL_PAGE', constructor: 2500, cart: 2506 },
} as const;


/**
 * Заявка в Битрикс24 через входящий вебхук (права: CRM).
 * Создаётся контакт и сделка; файлы прикладываются комментариями в ленту сделки — по одному на файл,
 * чтобы один большой файл не уронил остальные.
 *
 * @param webhook  адрес вебхука вида https://<портал>.bitrix24.ru/rest/<id>/<ключ>/
 * @returns имена недоставленных файлов; бросает ошибку, если не создалась сделка.
 */
export async function sendToBitrix(o: Order, webhook: string): Promise<string[]> {
  const base = webhook.replace(/\/+$/, '');
  const call = async <T>(method: string, body: unknown): Promise<T> => {
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

  const c = o.contacts;
  // Контакт — не обязательное условие: если не создался, сделка всё равно уйдёт с контактами в тексте.
  let contactId: number | undefined;
  try {
    contactId = await call<number>('crm.contact.add', {
      fields: {
        NAME: c.name,
        OPENED: 'Y',
        PHONE: [{ VALUE: c.phone, VALUE_TYPE: 'WORK' }],
        EMAIL: [{ VALUE: c.email, VALUE_TYPE: 'WORK' }],
        // Стандартное поле «Мессенджеры»: из карточки контакта открывается чат
        ...(c.telegram ? { IM: [{ VALUE: c.telegram.slice(1), VALUE_TYPE: 'TELEGRAM' }] } : {}),
        ADDRESS_CITY: c.city,
        ADDRESS: c.address,
      },
    });
  } catch (e) {
    console.error('[order]', o.number, e);
  }

  const dealId = await call<number>('crm.deal.add', {
    fields: {
      TITLE: `Конструктор № ${o.number}: ${o.garment.name}, ${o.qty} шт${o.lines.length > 1 ? `, ${o.lines.length} цв.` : ''}`,
      CATEGORY_ID: CRM.category,
      ...(contactId ? { CONTACT_ID: contactId } : {}),
      OPENED: 'Y',
      OPPORTUNITY: o.total,
      CURRENCY_ID: 'RUB',
      COMMENTS: escapeHtml(orderText(o)).replace(/\n/g, '<br>'),
      [CRM.orderNumber]: o.number,
      [CRM.project.field]: CRM.project.studio,
      [CRM.page.field]: orderSource(o.page) === 'cart' ? CRM.page.cart : CRM.page.constructor,
      ...(o.clientId ? { [CRM.metrikaClientId]: o.clientId } : {}),
      ...(o.roistat ? { [CRM.roistatVisit]: o.roistat } : {}),
      UTM_SOURCE: o.utm.source,
      UTM_MEDIUM: o.utm.medium,
      UTM_CAMPAIGN: o.utm.campaign,
      UTM_CONTENT: o.utm.content,
      UTM_TERM: o.utm.term,
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
        COMMENT: `⚠️ Не удалось приложить файлы: ${failed.join(', ')}. Запросите макет у клиента.`,
      },
    }).catch(() => undefined);
  }
  return failed;
}
