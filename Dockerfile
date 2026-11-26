# syntax=docker/dockerfile:1

FROM node:20-bookworm-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:20-bookworm-slim AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* вшиваются в сборку: на работающем контейнере их уже не поменять. Пусто — значение по умолчанию из кода.
ARG NEXT_PUBLIC_API_URL=https://api.pnhd.ru
ARG NEXT_PUBLIC_PNHD_API_URL=
ARG NEXT_PUBLIC_YM_COUNTER_ID=
ARG NEXT_PUBLIC_PRICE_SOURCE=
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_PNHD_API_URL=$NEXT_PUBLIC_PNHD_API_URL \
    NEXT_PUBLIC_YM_COUNTER_ID=$NEXT_PUBLIC_YM_COUNTER_ID \
    NEXT_PUBLIC_PRICE_SOURCE=$NEXT_PUBLIC_PRICE_SOURCE
ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

FROM node:20-bookworm-slim AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
# Заявки конструктора до доставки в Битрикс/Telegram. Сюда монтируется том (deploy/docker-compose.yml).
ENV ORDER_STORE_DIR=/app/data/orders

# Папка создаётся с владельцем nextjs: пустой именованный том при первом запуске берёт её права.
RUN groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs \
  && mkdir -p /app/data/orders \
  && chown -R nextjs:nodejs /app/data

COPY --from=build /app/public ./public
COPY --from=build --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=build --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
