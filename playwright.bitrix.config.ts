import { defineConfig, devices } from '@playwright/test';

/**
 * Заявка до сделки Битрикс24: сервер сайта шлёт заявки в заглушку Битрикса (e2e/bitrix-stub.mjs),
 * тест читает журнал её вызовов. Отдельно от основного прогона: там каналы заявок выключены.
 * Запуск: npx playwright test -c playwright.bitrix.config.ts
 */
const PORT = 3114;
const STUB_PORT = 3115;
export const BITRIX_LOG = 'data/e2e-bitrix.jsonl';
process.env.BITRIX_STUB_LOG = BITRIX_LOG;

export default defineConfig({
  testDir: 'e2e',
  testMatch: /bitrix\.spec\.ts/,
  timeout: 180_000,
  expect: { timeout: 15_000 },
  workers: 1,
  reporter: [['list']],
  use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, baseURL: `http://localhost:${PORT}`, locale: 'ru-RU' },
  webServer: [
    { command: `node e2e/bitrix-stub.mjs ${STUB_PORT} ${BITRIX_LOG}`, url: `http://localhost:${STUB_PORT}/`, reuseExistingServer: false },
    {
      command: `npx next dev -p ${PORT}`,
      url: `http://localhost:${PORT}/constructor`,
      reuseExistingServer: false,
      timeout: 120_000,
      env: {
        NEXT_DIST_DIR: '.next-e2e-bitrix',
        ORDER_STORE_DIR: 'data/e2e-orders-bitrix',
        ORDER_BITRIX_WEBHOOK: `http://localhost:${STUB_PORT}/rest/1/test/`,
        ORDER_TELEGRAM_BOT_TOKEN: '',
        ORDER_TELEGRAM_CHAT_ID: '',
        NEXT_PUBLIC_YM_COUNTER_ID: '',
        ORDER_LEDGER_TOKEN: 'e2e-bitrix-ledger',
      },
    },
  ],
});
