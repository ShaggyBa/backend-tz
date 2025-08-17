# Тестовое задание 
## Junior Plus Backend‑разработчик (Node.js / TypeScript) 

Мини-проект — прототип модуля «Стикеры»: CRUD через REST + realtime рассылка событий по WebSocket (socket.io).  
Реализация: TypeScript (ESM), Express, Sequelize(Postgres), socket.io, Zod, Jest.

---
## Требования
- Node 18+ (ESM)
- NPM
- PostgreSQL (используется [Neon](https://neon.com/))
## Переменные окружения (.env)
```bash
NODE_ENV=development

PORT=1234

USER_NAME="base_user"
USER_PASSWORD="npg_3NMhLtF5EUYc"

DATABASE_URL=postgresql://${USER_NAME}:${USER_PASSWORD}@ep-weathered-dew-a9lpxl8a-pooler.gwc.azure.neon.tech/neondb?sslmode=require&channel_binding=require

JWT_SECRET=4eb3e75a254c2f7e5693465dee94f37e490a90e178369c279578db0e35540ab7
JWT_REFRESH_EXPIRES=14d
JWT_ACCESS_EXPIRES=30m
BCRYPT_SALT_ROUNDS=10
```

## Установка
```bash
npm install
```

## Запуск сервера
```bash
npm run dev
```

## Запуск тестов
В проекте есть небольшие unit-тесты для контроллеров и SocketManager.
```bash
npm test
```

## WS тест 
Есть node-скрипт, который демонстративно проверяет workflow: подключается к socket.io (с токеном), создаёт/обновляет/удаляет стикер через REST и ожидает соответствующие WS-события.
1. Получить access token (через /api/auth/login или /api/auth/register).
2. Подключиться к websocket можно через консоль браузера с помощью кода, указанного в файле `test-ws-client-browser.js`:

3. Запустить `test-ws.mjs`

```bash
node test-wc.mjs
```
4. Наблюдать за логами

## Insomnia
Экспортированные файлы с запросами
1. Insomnia_first_API_test (выполнялся при первом построении API - без JWT)
2. Insomnia_with_jwt (выполнялся при первой интеграции JWT)
3. Insomnia_final (последнее тестирование API)

## API — базовые маршруты

* `POST /api/auth/register` — регистрация (возвращает accessToken + refreshToken).

* `POST /api/auth/login` — логин (возвращает accessToken + refreshToken).

* `POST /api/auth/refresh` — обновление access token (использует httpOnly cookie refresh token).

* `POST /api/auth/logout` — логаут (удаляет refresh token в БД).

* `GET/POST/PATCH/DELETE` /api/users — CRUD пользователей.

* `GET/POST/PATCH/DELETE` /api/sessions — CRUD сессий.

* `POST /api/sessions/:id/participants` — добавить участника.

* `GET /api/stickers / POST /api/stickers / PATCH /api/stickers/:id / DELETE /api/stickers/:id` — работа со стикерами.

Запросы требуют `Authorization: Bearer <accessToken>`. Refresh token хранится в httpOnly cookie

## WS (socket.io)

Сервер использует namespace / и комнаты session:<sessionId>. События:

Входящие от клиента:

* `joinSession { sessionId }`

* `leaveSession { sessionId }`

Исходящие от сервера (для участников комнаты):

* `stickerCreated, stickerUpdated, stickerDeleted`

* `participantJoined, participantLeft`

* `joined` (подтверждение присоединения)

---
## Этапы работы над модулем "Стикеры"
## Содержание

- [x] #Этап 0 — подготовка ✅ 2025-08-11
    
- [x] #Этап 1 — DB + миграции ✅ 2025-08-12
    
- [x] #Этап 2 — модели (Sequelize) ✅ 2025-08-12
    
- [x] #Этап 3 — `app.ts` / `server` ✅ 2025-08-14
    
- [x] #Этап 4 — Socket.IO менеджер + типы событий ✅ 2025-08-14

- [x] #Этап 5 — Контроллеры (классы), сервисы и роуты ✅ 2025-08-14
    
- [x] #Этап 6 — Интеграция realtime с CRUD ✅ 2025-08-14
    
- [x] #Этап 7 — DTO, валидация и типы ✅ 2025-08-14
    
- [x] #Этап 8 — Аутентификация и сессии ✅ 2025-08-15

## Дополнительно

- [x] Unit tests (Jest) ✅ 2025-08-15