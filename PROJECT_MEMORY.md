# 🧠 PROJECT MEMORY (DO NOT DELETE)

## 1. 🎯 Глобальная Цель Проекта

**SubsMarket 2.0** — это P2P маркетплейс внутри Telegram (Mini App) для совместного использования цифровых подписок и торговли гигабайтами сотовых операторов (Казахстан).
**Главные фичи:**

- **Clubs**: Совместная покупка семейных подписок (Netflix, Spotify, iCloud и др.).
- **GB Market**: Покупка/продажа гигабайт (Altel, Tele2, Kcell).
- **Trust Score**: Система репутации и защиты от мошенничества.
- **P2P Deals**: Безопасные сделки с проверкой скриншотов оплаты.

## 2. ⚡️ Протокол Памяти и Контекста (CRITICAL)

- **Основная Истина**: `PROJECT_MEMORY.md` — главный источник правды о целях и плане.
- **Техническая База**: MCP Memory Server хранит детали реализации и факты.
- **История Чата (Contextual Flow)**: Обязательно учитывать историю обсуждений для понимания логики решений, предпочтений пользователя и нюансов "why", которые не описаны в коде.
- **Синхронизация**: Каждый завершенный этап должен быть отражен в обоих типах памяти (файловой и MCP).

**Технологии:**

- **Frontend**: React + Vite, TypeScript.
- **Styling**: Tailwind CSS **v3.4.19 (Stable)** + HeroUI (версия **2.8.8 stable**).
  - *Решение*: Отказ от Tailwind v4 beta из-за несовместимости с `@heroui/theme` и багов парсера. Используется `--legacy-peer-deps`.
  - *Стили*: Тёмная тема, iOS/xAI минимализм, стекломорфизм.
- **Backend**: Python (FastAPI) + SQLAlchemy (Async).
- **Database**: PostgreSQL (Neon.tech).
- **Integration**: Telegram WebApp SDK (Haptics, MainButton, CloudStorage).
- **State Management**: TanStack Query (React Query).

## 3. 🚧 Текущий Контекст (The State)

- **Rescue Mission Completed**: Проект восстановлен после инцидента с `git stash`. Все файлы возвращены, зависимости переустановлены.
- **Infrastructure Stabilized**:
  - Frontend работает на <http://localhost:5174> (Tailwind v3, PostCSS, HeroUI 2.8.8).
  - Backend работает на <http://localhost:8000> (FastAPI, Uvicorn).
- **Trust Score System UI**: Полностью реализован фронтенд (TrustBadge, History, Complaints). Бэкенд подключен.
- **Работающих сервисов**: 2 (Frontend, Backend).

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

1. **Monetization Implementation**: Добавить paywall на создание клуба/объявления (Kaspi/Stars).
2. **Testing**: Manual E2E testing всего flow.
3. **Deployment**: Deploy на staging (Vercel + Fly.io/Railway).
4. **Telegram Bot**: Настроить WebApp menu button для бота.
