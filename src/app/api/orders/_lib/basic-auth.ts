import { timingSafeEqual } from 'node:crypto';

/** HTTP Basic с паролем ORDER_LEDGER_TOKEN (имя любое): журнал заявок и проверка связи с Битриксом. */
export function authorized(header: string | null, token: string): boolean {
  const encoded = header?.match(/^Basic (.+)$/)?.[1];
  if (!encoded) return false;
  const decoded = Buffer.from(encoded, 'base64').toString('utf8');
  const given = Buffer.from(decoded.slice(decoded.indexOf(':') + 1));
  const expected = Buffer.from(token);
  return given.length === expected.length && timingSafeEqual(given, expected);
}
