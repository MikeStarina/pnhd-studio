# Выкладка фронтенда

Пуш в `main` → GitHub Actions (`.github/workflows/deploy-fe.yml`) собирает образ, кладёт его в GitHub Container Registry
(`ghcr.io/<репозиторий>:prod` и `:sha-<коммит>`), копирует `deploy/` на ВМ в `/opt/studio-fe` и перезапускает стек
Docker Compose: `web` (Next.js standalone) и `caddy` (HTTPS сам, `deploy/Caddyfile.prod`).

## Настройки GitHub (Environment `prod`)

Секреты (Secrets):
| Имя | Зачем |
|---|---|
| `SSH_KEY` | ключ для входа на ВМ |
| `ORDER_BITRIX_WEBHOOK` | входящий вебхук Битрикс24 с правами CRM — заявки конструктора |
| `ORDER_TELEGRAM_BOT_TOKEN` | запасной канал заявок, если Битрикс не задан или не ответил |
| `MAIL_LOGIN`, `MAIL_PASS` | ящик и пароль приложения Яндекс 360 (SMTP `smtp.yandex.ru:465`) — письмо покупателю после оформления заказа |

Переменные (Variables):
| Имя | Зачем |
|---|---|
| `SSH_HOST`, `SSH_USER` | ВМ |
| `NEXT_PUBLIC_API_URL` | API магазина; пусто — `https://api.pnhd.ru` |
| `NEXT_PUBLIC_PNHD_API_URL` | каталог для конструктора; пусто — `https://api.pnhd.ru` |
| `NEXT_PUBLIC_YM_COUNTER_ID` | счётчик Метрики; пусто — счётчик из кода |
| `NEXT_PUBLIC_PRICE_SOURCE` | таблица цен DTF: `tiered` (по умолчанию) или `site` |
| `ORDER_BITRIX_CATEGORY_ID`, `ORDER_BITRIX_SOURCE_ID` | воронка и источник сделки |
| `ORDER_BITRIX_MARK_FIELD`, `ORDER_BITRIX_CLIENTID_FIELD` | пользовательские поля сделки (`UF_CRM_…`) |
| `ORDER_TELEGRAM_CHAT_ID` | чат для запасного канала |

`NEXT_PUBLIC_*` вшиваются в образ при сборке: после их смены нужен новый деплой.
`ORDER_*` деплой пишет в `/opt/studio-fe/web.env` (права 600), их читает контейнер `web`.
Без `MAIL_LOGIN`/`MAIL_PASS` письмо покупателю не уходит: в логе контейнера строка `[mail] not configured`.
Если не задан ни Битрикс, ни Telegram, деплой выводит предупреждение: заявки конструктора остаются на диске
и в логе контейнера и до менеджера не доходят.

## Заявки конструктора на сервере
- Заявка сохраняется в том `orders` (`/app/data/orders` в контейнере) и уходит в канал; при сбое канала
  сервер повторяет отправку. После доставки файлы удаляются, остаётся короткая запись.
- Для письма покупателю сервер при приёме заявки откладывает черновик (`orders/_mail`): позиция, превью 192 px, почта.
  Черновик удаляется, когда письмо ушло; неотправленный — через сутки.
- Том переживает перезапуск и новый образ. `docker compose down -v` его удалит — так не делать.

## Подготовка ВМ
```bash
sudo mkdir -p /opt/studio-fe && sudo chown "$USER" /opt/studio-fe
# Docker Engine и плагин Compose
```

## Откат
Каждый деплой оставляет образ `:sha-<коммит>`. Откат — на ВМ поставить в `/opt/studio-fe/.env`
`FE_IMAGE=ghcr.io/<репозиторий>:sha-<прежний коммит>` и выполнить `docker compose up -d`. Следующий пуш в `main`
вернёт `:prod`.
