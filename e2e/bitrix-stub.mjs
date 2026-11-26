// Заглушка Битрикс24 для e2e: принимает вызовы REST, пишет их построчно в журнал (JSON Lines) и отвечает успехом.
// Запуск: node e2e/bitrix-stub.mjs <порт> <файл журнала>
import { appendFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';

const [port, log] = process.argv.slice(2);
writeFileSync(log, '');
const RESULT = { 'crm.contact.add': 7, 'crm.deal.add': 11 };

createServer((req, res) => {
  let body = '';
  req.on('data', (c) => { body += c; });
  req.on('end', () => {
    const method = (req.url ?? '').match(/\/([\w.]+)\.json$/)?.[1];
    if (req.method === 'POST' && method) appendFileSync(log, `${JSON.stringify({ method, body: JSON.parse(body || '{}') })}\n`);
    // Файл с «слишком-большой» в имени Битрикс «не принимает» — так проверяется судьба недоставленных файлов.
    if (method === 'crm.timeline.comment.add' && /слишком-большой/.test(JSON.parse(body || '{}').fields?.FILES?.[0]?.[0] ?? '')) {
      res.writeHead(200, { 'content-type': 'application/json' });
      return res.end(JSON.stringify({ error: 'ERROR_FILE_TOO_LARGE', error_description: 'file too large' }));
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    res.end(JSON.stringify({ result: method ? (RESULT[method] ?? true) : 'ok' }));
  });
}).listen(Number(port));
