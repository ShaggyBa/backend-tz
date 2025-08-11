# Тестовое задание 
## Junior Plus Backend‑разработчик (Node.js / TypeScript) 
---
## Этапы работы над модулем "Стикеры"
## Содержание

- [x] [[#Этап 0 — подготовка]] ✅ 2025-08-11
    
- [ ] [[#Этап 1 — DB + миграции]]
    
- [ ] [[#Этап 2 — модели (Sequelize)]]
    
- [ ] [[#Этап 3 — `app.ts` / `server` (bootstrap, класс Server)]]
    
- [ ] [[#Этап 4 — Socket.IO менеджер + типы событий]]

- [ ] [[#Этап 5 — Контроллеры (классы), сервисы и роуты]]
    
- [ ] [[#Этап 6 — Интеграция realtime с CRUD]]
    
- [ ] [[#Этап 7 — DTO, валидация и типы]]
    
- [ ] [[#Этап 8 — Аутентификация и сессии]]

---

## Этап 0 — подготовка

**Цель:** убедиться, что проект запускается, установлены основные зависимости и настроены окружение/скрипты.

**Задачи**

- Проверить `package.json` (`"type": "module"`), `tsconfig.json`, ESLint и Prettier.
    
- Установить зависимости:
    
- Создать `.env` с `DATABASE_URL`, `PORT`, `NODE_ENV`, `SECRET`.

**Результат:** dev-сервер стартует, базовая конфигурация проекта готова.  

---

## Этап 1 — DB + миграции

**Цель:** подготовить подключение к PostgreSQL и систему миграций.

**Задачи**

- `src/db/index.ts` — экспорт `sequelize` и `connectDB()`.
    
- Выбрать/настроить миграции.
    
- `src/db/migrations/*` — миграции для `users`, `stickers`, `sessions`.
    
- npm-скрипты: `migrate`, `migrate:up`, `migrate:down`.
    
**Памятка:** - [unzug](https://github.com/sequelize/umzug)
**Результат:** миграции создают таблицы в Neon.  

---

## Этап 2 — модели (Sequelize)

**Цель:** типизированные модели `User`, `Sticker`, `Session` и их связи.

**Структура**

`src/models/   index.ts   User.ts   Sticker.ts   Session.ts`

**Результат:** модели + `models/index.ts` с `belongsTo`/`hasMany`.  

---

## Этап 3 — `app.ts` / `server` (bootstrap, класс Server)

**Цель:** чёткое разделение: 
`app.ts` — Express app; 
`Server` — старт/stop, подключение DB и socket.io.

**Файлы**

`src/   app.ts   server/Server.ts   index.ts`

**Результат:** классный bootstrap с `start()`/`shutdown()`.  

---

## Этап 4 — Socket.IO: менеджер + типы событий

**Цель:** отдельный `SocketManager` с типами `ClientToServerEvents` / `ServerToClientEvents`, room-management, авторизация сокета.

**Файлы**

`src/realtime/   types.ts   SocketManager.ts`

**Результат:** типизированный realtime менеджер.  

---

## Этап 5 — Контроллеры (классы), сервисы и роуты

**Цель:** тонкие контроллеры (HTTP) + толстые сервисы (бизнес-логика), DI-подход.

**Файлы** 

`src/controllers/StickerController.ts src/services/StickerService.ts src/routes/stickers.ts`

**Результат:** контроллеры — классы; сервисы содержат бизнес-логику.  


---

## Этап 6 — Интеграция realtime с CRUD

**Цель:** при REST-операциях отправлять соответствующие события socket.io.

**Подходы**

- Инжектировать `SocketManager` в сервисы и вызывать методы вида `emitStickerCreated(boardId, payload)`.
    
- Или использовать `EventEmitter` / `EventBus` между слоями и подписаться на него в `SocketManager`.

**Результат:** после `POST /api/stickers` — все сокет-клиенты в комнате доски получают `stickerCreated`.  

---

## Этап 7 — DTO, валидация и типы

**Цель:** безопасные входные данные и согласованные типы DTO.

**Памятка:** использовать `zod` 

**Результат:** валидация на уровне роутов, DTO-типы в коде.  

---

## Этап 8 — Аутентификация и сессии

**Цель:** простая, рабочая аутентификация (JWT) и модель `Session`.

**Задачи**

- Модель `Session` (userId, token, expiresAt).
    
- Auth middleware (`Authorization: Bearer <token>`), ставит `req.user`.
    
- Socket.IO: авторизация при соединении (token в query/headers) — reject если невалиден.
    

**Результат:** только авторизованные пользователи создают/меняют стикеры.  
