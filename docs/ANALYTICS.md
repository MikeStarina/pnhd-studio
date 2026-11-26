# Аналитика сайта studio.pnhd.ru

Один счётчик Яндекс Метрики, одна функция `track`. Код — `src/components/site/analytics.ts`.
События конструктора идут через неё же (`src/features/constructor/analytics/events.ts`), клики по ссылкам — `src/components/site/site-goals.tsx`.

## Правила
- Счётчик: `NEXT_PUBLIC_YM_COUNTER_ID`; без переменной — `86217584`. Загрузчик в `layout.tsx` и все цели берут id из одного места.
- Отказ от cookie (`pinhead_analytics_off`) выключает цели, ecommerce и ClientID. Roistat и коллтрекинг UIS грузятся по отдельному решению владельца и отказ тоже учитывают в загрузчике.
- Без счётчика цель пишется в консоль (кроме production). Сбой аналитики интерфейс не ломает.
- Повтор той же цели с теми же параметрами за 400 мс отбрасывается (двойной клик, StrictMode). `order_submit` и покупка уходят один раз на номер заказа.
- К целям конструктора добавляются `source` (откуда пришли) и `link_product` (slug из `?product=`).

## Источник входа (`source`)
Клик по ссылке на конструктор запоминает источник на сессию: `header`, `menu`, `footer`, `home`, `catalog`, `product`, `cases`…; блок страницы — в `block`. Заход без клика: `direct` или `external`. Метку `data-source="…"` на секции можно поставить вручную — она важнее автоматической.

## Цели

### Воронка конструктора
| Цель | Что значит | Параметры |
|---|---|---|
| `constructor_open` | открыт конструктор | source, link_product |
| `garment_select` | выбрано изделие | id |
| `color_select` | выбран цвет | color |
| `design_upload` | загружена картинка | w, h, type, kb, trimmed / slot |
| `image_crop`, `image_shape` | обрезка, форма картинки | slot / shape |
| `text_add` | добавлен текст | — |
| `template_apply` | применён шаблон | id |
| `side_switch` | переключена сторона | side |
| `size_set`, `sizes_copy`, `color_remove` | размеры, копирование, удаление цвета | — |
| `cart_add` | изделие с принтом положено в корзину (или сохранена правка позиции) | product, method, qty, order_price, colors |
| `order_send` | на оформлении корзины нажата «Оформить заказ» — по каждому изделию с принтом | product, method, qty, order_price, colors |
| `order_submit` | заявка на изделие с принтом принята сервером (прежнее имя цели, событие `order_success`) | + currency, order_id |
| `order_send_error` | отправка не удалась | + message |

### Сайт
| Цель | Что значит | Где шлётся | Параметры |
|---|---|---|---|
| `cta_constructor_click` | клик по ссылке на `/constructor` | везде, автоматически | source, block, page |
| `print_cta_click` | «Нанести принт»: ссылка на `/constructor?product=…` | карточка и страница товара, автоматически | source, block, page, product |
| `phone_click`, `email_click` | клик по `tel:`, `mailto:` | везде | source, page |
| `telegram_click`, `whatsapp_click`, `vk_click` | клик по `t.me`, `wa.me`, `vk.com` | везде | source, page |
| `cart_open` | клик по ссылке на `/cart` | шапка | source, page |
| `lead_submit`, `lead_error` | заявка из формы «Посчитаем ваш заказ» / из всплывающей формы | `price-form.tsx`, `lead-form.tsx` | form: price / popup |
| `add_to_cart`, `catalog_filter_apply`, `gallery_open`, `size_chart_open` | действия в каталоге и на товаре | вставляет ведущий (см. ниже) | по смыслу |

### Электронная коммерция
`trackDetail`, `trackAdd`, `trackRemove`, `trackPurchase` (`analytics.ts`). Покупка конструктора уходит автоматически после `order_submit`: id = номер заказа, позиции по цветам (цена за штуку, количество), валюта RUB.

## Что завести в интерфейсе Метрики
1. **Цели → JavaScript-событие** с идентификатором из таблиц. Уже заведены: `design_upload`, `order_submit`, `order_send_error`. Остальные — по приоритету: `constructor_open`, `garment_select`, `cart_add`, `order_send`, `cta_constructor_click`, `print_cta_click`, `lead_submit`, `phone_click`, `telegram_click`, `whatsapp_click`, `cart_open`.
2. **Составная цель «Воронка конструктора»**: `constructor_open` → `garment_select` → `design_upload` (или `text_add` / `template_apply`) → `cart_add` → `order_send` → `order_submit`. Для ценности цели `order_submit` включить «Ценность из параметра» `order_price`.
3. **Цель «Любое обращение»** (условие ИЛИ): `order_submit`, `lead_submit`, `phone_click`, `telegram_click`, `whatsapp_click` — для отчётов по рекламе.
4. **Настройки счётчика**: вебвизор — включён; «Электронная коммерция» → контейнер `dataLayer`, валюта RUB; «Использовать ClientID» (офлайн-конверсии) — включить; в разделе «Параметры визитов» источник `source` виден в срезе цели.
5. **Офлайн-конверсии и источник сделки**: сделка из `/api/orders` получает ClientID Метрики (`UF_CRM_DCT_YA_CID`) и номер визита Roistat из куки `roistat_visit` (`UF_CRM_ROISTAT`). Источник сделки сайт не ставит: его подставляет Roistat. «Конструктор» — это страница отправки (`UF_CRM_DEAL_URL_PAGE`), а не источник. Схема полей CRM — в `src/app/api/orders/_lib/bitrix.ts`.

## Куда вставить события каталога и товара (ведущему)
Импорт: `import { track, trackAdd, trackDetail } from '@/components/site/analytics'`.
- «Нанести принт» с карточки и страницы товара — ничего, если это `<Link href="/constructor?product=…">`: цель `print_cta_click` шлёт слушатель. Если это кнопка с `router.push`, вызвать `track('print_cta_click', { source: 'catalog' | 'product', product: slug })` и `rememberEntry({ source, product: slug })`.
- «В корзину» — `track('add_to_cart', { product: slug, price })` и `trackAdd({ id, name, price, quantity, variant })` в обработчике добавления.
- Страница товара — `trackDetail({ id, name, price, variant })` в эффекте при открытии (один раз на товар).
- Применение фильтра — `track('catalog_filter_apply', { filter: 'type', value })`.
- Открытие галереи — `track('gallery_open', { product: slug })`; таблица размеров — `track('size_chart_open', { product: slug })`.
- Удаление из корзины (`src/app/cart`) — `trackRemove({ id, name, price, quantity })`.

## Как проверить
1. Открыть сайт с `?_ym_debug=1`: в консоли видны отправляемые цели Метрики. Без счётчика в dev цели печатаются как `[analytics] <цель> {…}`.
2. Метрика → «Отчёты → Достижение целей» (задержка несколько минут) и «Вебвизор».
3. После нажатия «Отказаться» в уведомлении о cookie новые цели не уходят.
4. Автотест: `E2E_PORT=3112 npx playwright test e2e/analytics.spec.ts --project=desktop-1440` — поднимает свой сервер; порядок целей воронки, один `order_submit`, ClientID в заявке.

## При выкладке
- Задать `NEXT_PUBLIC_YM_COUNTER_ID=86217584` (переменная встраивается при сборке — пересобрать).
- Задать секрет `ORDER_BITRIX_WEBHOOK`; воронка и поля сделки уже в коде. Проверка полей: `npx playwright test -c playwright.bitrix.config.ts` (заглушка Битрикса).
- Завести цели и составную воронку в Метрике (раздел выше), включить ecommerce и ClientID.

## Правила разметки
- В электронной коммерции id товара — его номер в API (`_id`) везде: просмотр, корзина, покупка из конструктора. Иначе Метрика не сведёт просмотр с заказом.
- Конструктор, открытый по ссылке с товаром (`?product=`), сам отправляет `garment_select` и `color_select` с `via: link` — шаги воронки не пропадают.
- Источник клика `header` / `footer` — только по метке `data-source` у шапки и подвала сайта.
