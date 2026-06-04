# 🧠 PROJECT MEMORY (DO NOT DELETE)

## 1. 🎯 Глобальная Цель Проекта

**SubsMarket 2.0** — это Telegram Mini App для совместного использования цифровых подписок, семейных тарифов, торговли гигабайтами и продажи доступов/аккаунтов в Казахстане.

Ключевой продуктовый поворот от 2026-06-03: SubsMarket — не escrow и не банк, но и не хаотичная доска объявлений. Это P2P-платформа правил: деньги идут напрямую между людьми, а система фиксирует статусы, дедлайны, действия и AuditLog.

**Главные фичи:**

- **Families / Clubs**: Совместная покупка семейных подписок и тарифов (YouTube Premium, Yandex Plus, Spotify, Netflix, Tele2/Beeline/Activ).
- **Strict Join Flow**: заявка -> чат с хостом -> принятие -> выдача доступа -> 30 минут на оплату -> подтверждение.
- **GB Market**: Покупка/продажа гигабайт у операторов, которые технически поддерживают перевод. Altel запрещен для ГБ.
- **Trust Score**: Система репутации и защиты от мошенничества.
- **AuditLog**: Неизменяемая история ключевых действий вместо ненадежных скриншотов переписки.
- **Frozen / Disputes**: Спор замораживает семью и блокирует рискованные действия.

## 2. ⚡️ Протокол Памяти и Контекста (CRITICAL)

- **Основная Истина**: `PROJECT_MEMORY.md` — главный источник правды о целях и плане.
- **Техническая База**: MCP Memory Server хранит детали реализации и факты.
- **История Чата (Contextual Flow)**: Обязательно учитывать историю обсуждений для понимания логики решений, предпочтений пользователя и нюансов "why", которые не описаны в коде.
- **Синхронизация**: Каждый завершенный этап должен быть отражен в обоих типах памяти (файловой и MCP).

**Технологии:**

- **Frontend**: React + Vite, TypeScript.
- **Styling**: Tailwind CSS + собственный mini-app UI.
  - *Текущий стиль*: мобильный Telegram Mini App, светлая Yandex-like визуальная система, крупная типографика, плотные карточки, понятные CTA.
- **Backend**: Python (FastAPI) + SQLAlchemy (Async).
- **Database**: PostgreSQL (Neon.tech).
- **Timers**: DB sweeper внутри FastAPI, без Redis/Docker для MVP-таймера оплаты.
- **Integration**: Telegram WebApp SDK (Haptics, MainButton, CloudStorage).
- **State Management**: TanStack Query (React Query).

## 3. 🚧 Текущий Контекст (The State)

- **Current local services**:
  - Frontend: <http://localhost:5173>
  - Backend: <http://localhost:8000>
- **Telegram local dev**: Для теста внутри Telegram используется HTTPS tunnel на frontend и `APP_BASE_URL` для ссылок Mini App.
- **Strict club flow implemented**: pending не занимает место; approve -> invited; issue-access -> payment_pending + deadline; paid -> host confirm -> active.
- **Payment timeout implemented**: FastAPI sweeper переводит просроченный `payment_pending` в `removed` и освобождает место.
- **AuditLog implemented**: отдельная таблица системной истории для создания, заявки, принятия, выдачи доступа, оплаты, подтверждения, спора и автопросрочки.
- **Frozen implemented**: спор переводит клуб в `frozen` и блокирует join/approve/issue-access/confirm-payment.
- **GB Altel ban implemented**: Altel убран из UI создания и запрещен на backend.
- **Important docs**: подробный отчет текущей продуктовой позиции лежит в `docs/PROJECT_REPORT_2026-06-03.md`.

## 4. 📝 История Решений (Change Log)

- [2026-02-07] **Infrastructure Fix**: Откат Tailwind CSS с v4 beta на v3.4.19. Настройка `postcss.config.js` и `tailwind.config.js` для совместимости с HeroUI. Исправление `vite.config.ts`.
- [2026-02-07] **Resurrection**: Восстановление кодовой базы из `git stash` после случайной очистки рабочей директории.
- [2026-02-07] **UI Audit**: Исправлена верстка `Input`, `Select`, `Textarea` и `Autocomplete`. Наложений больше нет. Standalone Label паттерн внедрен.
- [2026-02-07] **AI Integration**: Интегрированы Hive Mode и Semantic Mode для улучшения автономности.
- [2026-02-07] **Code Quality**: Применены cursor-rules (TypeScript Expert). Рефакторинг Modal.tsx для соответствия best practices.
- [2026-02-07] **Backend Fix**: Обновлены CORS Origins для поддержки локальной разработки на портах 5174/5175.
- [2026-02-07] **API Refactoring**: Создан `pricing.ts`, исправлен экспорт в `client.ts`.
- [2026-02-09] **Trust System UI**: Реализованы компоненты рейтинга, истории и жалоб. Интегрированы TanStack Query хуки. Создана документация `docs/TRUST_SYSTEM.md`.
- [2026-02-09] **GB Market P2P**: Реализован полный цикл сделок (Backend + Frontend). Созданы `DealPage`, `DealsListPage`. Подключен `AIService` для проверки чеков.
- [2026-05-31] **Mini App UI**: Интерфейс переделан из "сайта" в мобильное Telegram-приложение.
- [2026-06-02] **Marketplace taxonomy**: Разделены семейные подписки, семейные тарифы, ГБ и доступы/аккаунты. Убраны лишние поля региона и типа места.
- [2026-06-02] **Telegram group flow**: Добавлено создание/выбор Telegram-группы, добавление бота и автоподтягивание invite-ссылки.
- [2026-06-03] **Host approval**: Вступление в семью требует заявки и решения хоста, а не мгновенного вступления.
- [2026-06-03] **Strict payment flow**: Добавлены `invited`, `payment_pending`, `paid`, `active`, 30-минутный таймер оплаты и подтверждение хостом.
- [2026-06-03] **DDD rules**: Правила переходов вынесены в доменный state machine `backend/src/domain/rules/club_state_machine.py`.
- [2026-06-03] **AuditLog/Frozen**: Добавлены системный журнал действий и заморозка семьи при споре.

## 5. 🔜 План действий

1. [Done] **GB Market P2P Flow**: ✅ Полная реализация сделок (Create -> List -> Reserve -> Pay -> Confirm).
2. [Done] **AI Deal Automation**: ✅ Интеграция `verifyProof` в процесс сделки (AI Verdict).
3. [Done] **Trust System UI**: ✅ Реализован UI и API.
4. [Done] **Gemini Vision**: ✅ Сервис `AIService` и эндпоинт `/verify-proof` созданы. Инструмент тестирования `/tools/receipt-analyzer` доступен.
5. [Done] **Notification Service**: ✅ Реализован сервис уведомлений через Telegram Bot API.
6. [Done] **Create Listing**: ✅ Форма создания объявления подключена к API.
7. [Done] **UI Polish**: ✅ Skeleton loaders, empty states, status badges, BottomNav active dot, progress timelines.
8. [Done] **Security Hardening**: ✅ Rate limiting (slowapi), anti-spam (max active offers), credential removal, disclaimer.

### Модель монетизации (определена 2026-02-24)

- Плата за создание клуба
- Плата за размещение объявления на маркете ГБ
- Плата за размещение объявления о продаже аккаунтов

### Правовая позиция

- SubsMarket — площадка (marketplace), не сторона сделки
- Нет хранения credentials (login/password) — передача через Telegram напрямую
- Нет эскроу — все сделки на риск пользователей
- Документ: `docs/TERMS.md`

### Next Steps

1. **Tests first**: Добавить unit/API тесты для state machine, AuditLog, frozen, payment timeout и Altel ban.
2. **Telegram E2E**: Пройти сценарий двумя аккаунтами через локальный HTTPS tunnel: заявка -> чат -> принять -> доступ выдан -> оплатил -> подтвердить.
3. **Docs sync**: Поддерживать `PROJECT_MASTER.md`, `PROJECT_MEMORY.md`, `README.md` и `docs/PROJECT_REPORT_2026-06-03.md` в новой логике "rules first, no escrow".
4. **UX warnings**: Добавить предупреждения для fair-use лимитов семейных тарифов, сроков жизни/комиссий ГБ и privacy-risk общих AI/account доступов.
5. **Deployment**: После проверки локального сценария сделать один commit и deploy.
