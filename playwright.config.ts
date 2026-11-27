import { defineConfig, devices } from '@playwright/test';

/**
 * Сквозные тесты конструктора: сценарий «изделие → принт → размеры → заявка» на десктопе (1440) и телефоне (375)
 * и проверка файла печати. Сервер поднимается отдельно от рабочего: свой порт, своя папка сборки и своё
 * хранилище заявок; каналы заявок выключены — тестовые заявки никуда не уходят.
 * Каталог — живой API (NEXT_PUBLIC_PNHD_API_URL): без сети тесты не пройдут.
 */
// E2E_PORT разводит параллельные прогоны: у каждого свой сервер, своя сборка и своё хранилище заявок.
const PORT = Number(process.env.E2E_PORT ?? 3111);
const SUFFIX = process.env.E2E_PORT ? `-${PORT}` : '';
export const ORDERS_DIR = `data/e2e-orders${SUFFIX}`;
/** Письма покупателю в тестах не уходят по SMTP, а ложатся сюда JSON-файлами (api/orders/_lib/mail/send.ts). */
export const MAIL_DIR = `data/e2e-mail${SUFFIX}`;

export default defineConfig({
  testDir: 'e2e',
  timeout: 120_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: { baseURL: `http://localhost:${PORT}`, trace: 'retain-on-failure', locale: 'ru-RU' },
  projects: [
    { name: 'desktop-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } } },
    {
      name: 'mobile-375',
      use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true, deviceScaleFactor: 2 },
      testIgnore: /print-file/,
    },
    { name: 'safari-1440', use: { ...devices['Desktop Safari'], viewport: { width: 1440, height: 900 } }, testIgnore: /print-file/ },
  ],
  webServer: {
    command: `npx next dev -p ${PORT}`,
    url: `http://localhost:${PORT}/constructor`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      NEXT_DIST_DIR: `.next-e2e${SUFFIX}`,
      ORDER_STORE_DIR: ORDERS_DIR,
      MAIL_TEST_DIR: MAIL_DIR,
      MAIL_LOGIN: '',
      MAIL_PASS: '',
      // Пустые значения перекрывают .env.local: заявки из тестов не должны попасть в настоящий канал.
      ORDER_BITRIX_WEBHOOK: '',
      ORDER_TELEGRAM_BOT_TOKEN: '',
      ORDER_TELEGRAM_CHAT_ID: '',
      NEXT_PUBLIC_YM_COUNTER_ID: '',
      ORDER_LEDGER_TOKEN: 'e2e-ledger-password',
    },
  },
});
