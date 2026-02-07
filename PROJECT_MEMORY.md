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
- **Styling**: Tailwind CSS v4 + HeroUI (версия **2.8.8 stable**).
  - *Правило*: Не использовать v3 beta (нестабильно).
  - *Стили*: Тёмная тема, iOS/xAI минимализм, стекломорфизм.
- **Backend**: Python (FastAPI) + SQLAlchemy (Async).
- **Database**: PostgreSQL (Neon.tech).
- **Integration**: Telegram WebApp SDK (Haptics, MainButton, CloudStorage).
- **State Management**: TanStack Query (React Query).

## 3. 🚧 Текущий Контекст (The State)

- **UI Health Check (Success)**: Страница "Создание клуба" проверена и исправлена. Устранены наложения меток (labels) за счет рефакторинга компонентов в паттерн "Standalone Label".
- **API & Backend**: Исправлены критические ошибки CORS (добавлены порты 5174/5175). Стандартизировано именование API клиента (`client` вместо `instance`). Реализован `pricingApi`.
- **Code Quality**: Применены cursor-rules (TypeScript Expert) к shared UI компонентам. Рефакторинг Modal.tsx: arrow functions, FC types, type imports.
- **Инструменты**: Установлены `power-ranger-toolkit` (Hive Mode) и `namnam-skills` (Semantic Mode). Проведено полное индексирование кодовой базы.
- **Следующий фокус**: Интеграция Gemini Vision для анализа скриншотов оплаты.

## 4. 📝 История Решений (Change Log)

- [2026-02-07] **Успешный UI Audit**: Исправлена верстка `Input`, `Select`, `Textarea` и `Autocomplete`. Наложений больше нет.
- [2026-02-07] **Code Quality**: Применены cursor-rules (TypeScript Expert). Рефакторинг Modal.tsx для соответствия best practices.
- [2026-02-07] **Backend Fix**: Обновлены CORS Origins для поддержки локальной разработки на портах 5174/5175.
- [2026-02-07] **API Refactoring**: Создан `pricing.ts`, исправлен экспорт в `client.ts`, обновлены все зависимые API-модули (trust, pricing).
- [2026-02-07] **AI Integration**: Интегрированы Hive Mode и Semantic Mode для улучшения автономности и понимания контекста.
- [2026-02-06] **HeroUI Rollback**: Откат с v3 beta на стабильную v2.8.8.
- [2026-02-06] **Design**: Внедрена дизайн-система в стиле минимализма iOS 18 / xAI.

## 5. 🔜 План действий

1. **Gemini Vision**: Разработать прототип анализа скриншотов оплаты для автоматического подтверждения сделок.
2. **GB Market**: Интегрировать `OperatorSelect` в форму предложения гигабайт с валидацией цены.
3. **Profile**: Реализовать страницу профиля с детальным Trust Score и списком значков (badges).
4. **Data Consistency**: Согласовать типы данных (UUID vs String) в `ClubService` для поддержки новых и старых ID сервисов.
