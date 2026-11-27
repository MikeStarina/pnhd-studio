import { authorized } from '../_lib/basic-auth';
import { ledgerXlsx } from '../_lib/ledger';

export const dynamic = 'force-dynamic';

/**
 * Выгрузка журнала заявок в Excel. Закрыта паролем ORDER_LEDGER_TOKEN (HTTP Basic, имя любое):
 * браузер сам спросит пароль. Пароль не задан — адреса нет.
 */
export async function GET(req: Request) {
  const token = process.env.ORDER_LEDGER_TOKEN;
  if (!token) return new Response('Not found', { status: 404 });
  if (!authorized(req.headers.get('authorization'), token)) {
    return new Response('Unauthorized', { status: 401, headers: { 'WWW-Authenticate': 'Basic realm="orders", charset="UTF-8"' } });
  }
  const date = new Date().toISOString().slice(0, 10);
  return new Response(await ledgerXlsx(), {
    headers: {
      'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'content-disposition': `attachment; filename="zayavki-${date}.xlsx"`,
      'cache-control': 'no-store',
    },
  });
}
