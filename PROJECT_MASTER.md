# 📘 SubsMarket: Master Document

> **Единый источник истины для ИИ и разработчиков**  
> Версия: 2.0 | Дата: 2026-02-01

---

## 1. 🎯 Цели проекта

### Миссия

Создать цивилизованную P2P-платформу для торговли цифровыми услугами в Telegram (семейные подписки, ГБ трафика, аккаунты).

### Ключевые принципы (ЖЕЛЕЗНЫЕ ПРАВИЛА)

| Правило | Описание | Нарушение = REJECT |
| --------- | ---------- | ------------------- |
| **No Escrow** | Платформа НИКОГДА не принимает деньги | 🔴 |
| **No Warranty** | Мы не гарантируем работу товара | 🔴 |
| **Passive Platform** | Мы — доска объявлений, не магазин | 🔴 |

### 1.1 Бизнес-правила

#### Модерация и Споры

- **Жалобы** обрабатываются через поддержку + ИИ-модерацию
- **Бан** при подтверждённом обмане (кидалово, мошенничество)
- **Репорт-система** — пользователи могут жаловаться, ИИ принимает решение

#### Семейные подписки (Clubs)

- Оплата участников → на банк хоста (Kaspi по умолчанию, другие банки опционально)
- Неплатёж → хост связывается с участником, решает сам
- Хост может исключить участника **только если тот не платит**
- **Нет статуса frozen** — только закрытие клуба
- Автоматические напоминания: за 3 дня до платежа + в день платежа

#### GB Маркетплейс & Аккаунты

- **P2P модель**: продавец получает деньги → отправляет товар → обе стороны подтверждают сделку
- Общение и передача происходят **вне платформы** (через Telegram DM)
- Мы — только доска объявлений

#### Платёжные методы

- Банковский перевод по номеру телефона (Kaspi, Halyk, Jusan и др.)
- **Номер телефона обязателен** при создании объявления/клуба
- Никаких Telegram Stars / Payments

---

### 1.2 Trust System (Система репутации)

> 🔗 **Подробная документация**: [`docs/TRUST_SYSTEM.md`](docs/TRUST_SYSTEM.md)

#### Рейтинг доверия (Trust Score)

| Параметр | Значение |
| --- | --- |
| Начальный рейтинг | **5.0** |
| Минимум | 1.0 |
| Максимум | 5.0 |

**Отображение:** `Елдос ⭐ 4.8 (103)` — рейтинг + количество сделок

#### Изменение рейтинга

| Событие | Влияние |
| --- | --- |
| Успешная сделка | **+0.1** (макс. до 5.0) |
| Жалоба подтверждена (первая) | -0.5 |
| Жалоба подтверждена (повторная) | -1.0 |
| Отмена сделки продавцом | -0.2 |
| Бан за мошенничество | → 0.0 + удаление аккаунта |

#### Ограничения

| Рейтинг | Последствие |
| --- | --- |
| < 3.0 | ⚠️ Пометка "Низкий рейтинг" |
| < 2.0 | 🚫 Нельзя создавать объявления |
| < 1.0 | 🚫 Бан |

#### Бейджи

| Бейдж | Условие | Иконка |
| --- | --- | --- |
| Новичок | 0 сделок | 🆕 |
| Проверенный | 10+ сделок, рейтинг ≥ 4.5 | ✅ |
| Опытный продавец | 50+ сделок, рейтинг ≥ 4.5 | 🥉 |
| Золотой продавец | 100+ сделок, рейтинг ≥ 4.8 | 🥇 |
| Платиновый продавец | 500+ сделок, рейтинг = 5.0 | 💎 |
| Быстро отвечает | Среднее время ответа < 1 час | ⚡ |
| Топ недели | Больше всего сделок за неделю | 🔥 |

#### Anti-Abuse защита

| Защита | Описание |
| --- | --- |
| Минимальная сумма | Сделки < 500₸ не влияют на рейтинг |
| Уникальные пары | Сделки между одними юзерами засчитываются max 3 раза |
| Возраст аккаунта | Аккаунт < 7 дней — сделки не влияют на рейтинг |
| AI-детекция | Подозрительные паттерны → ручная проверка |
| Штраф за накрутку | рейтинг = 0.0 + бан |

---

### 1.3 Тарифы и Лимиты

#### Бесплатные лимиты

| Функция | Лимит |
| --- | --- |
| Клубы (владение) | 3 бесплатно, далее платно |
| Клубы (участие) | Без ограничений |
| GB объявления | 3 активных бесплатно |
| Account объявления | 3 активных бесплатно |
| Срок объявления | 7 дней (Free) |

#### Платные тарифы (для продавцов)

| Тариф | Цена | Объявлений | Срок |
| --- | --- | --- | --- |
| Free | 0₸ | 3 | 7 дней |
| Basic | 500₸/мес | 10 | 30 дней |
| Pro | 1500₸/мес | ∞ | 30 дней + приоритет |

#### Anti-spam

- Cooldown между объявлениями: **1 минута**
- Авто-удаление неактивных объявлений: **30 дней**

---

## 2. 🏗 Архитектура

### 2.1 Общая архитектура

```plaintext
┌─────────────────────────────────────────────────────────────┐
│                    Telegram Mini App (TWA)                   │
├─────────────────────────────────────────────────────────────┤
│                         Frontend                             │
│   React 19 + TypeScript + Vite + Tailwind v4 + TanStack     │
├─────────────────────────────────────────────────────────────┤
│                          Backend                             │
│        FastAPI + Pydantic v2 + SQLAlchemy + Alembic         │
├─────────────────────────────────────────────────────────────┤
│                         Database                             │
│              Neon PostgreSQL 17 + Redis (cache)             │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Backend (DDD Architecture)

```bash
backend/
├── src/
│   ├── domain/           # 🧠 Бизнес-логика (NO FRAMEWORKS)
│   │   ├── entities/     # User, Club, Listing, Transaction
│   │   ├── value_objects/# TrustScore, Money, PhoneNumber
│   │   └── events/       # DomainEvent, ClubJoined, ListingSold
│   │
│   ├── application/      # 📋 Use Cases
│   │   ├── commands/     # CreateClub, JoinClub, CreateListing
│   │   ├── queries/      # GetClubs, GetListings, GetUserProfile
│   │   └── services/     # NotificationService, TrustService
│   │
│   ├── infrastructure/   # 🔧 Внешние зависимости
│   │   ├── persistence/  # SQLAlchemy repositories
│   │   ├── telegram/     # Bot API, WebApp validation
│   │   ├── cache/        # Redis adapter
│   │   └── external/     # SMS, Payment webhooks
│   │
│   └── interface/        # 🌐 API Layer
│       ├── api/          # FastAPI routers
│       ├── schemas/      # Pydantic request/response
│       └── middleware/   # Auth, Logging, RateLimit
│
├── tests/
│   ├── unit/             # Domain tests
│   ├── integration/      # API tests
│   └── e2e/              # Full flow tests
│
├── alembic/              # Migrations
├── main.py               # Entry point
└── pyproject.toml        # Dependencies
```

### 2.3 Frontend Architecture

```bash
frontend/
├── src/
│   ├── app/              # 🎯 App shell
│   │   ├── providers/    # QueryClient, Theme, Telegram
│   │   ├── router/       # React Router config
│   │   └── App.tsx       # Root component
│   │
│   ├── features/         # 📦 Feature modules (по бизнес-доменам)
│   │   ├── clubs/        # Семейные подписки
│   │   │   ├── api/      # API hooks (TanStack Query)
│   │   │   ├── components/
│   │   │   ├── hooks/
│   │   │   ├── types/
│   │   │   └── index.ts  # Public exports
│   │   │
│   │   ├── market/       # Маркетплейс ГБ
│   │   │   ├── api/
│   │   │   ├── components/
│   │   │   └── ...
│   │   │
│   │   └── profile/      # Профиль пользователя
│   │
│   ├── shared/           # 🔧 Переиспользуемое
│   │   ├── ui/           # UI Kit (Button, Card, Input...)
│   │   ├── lib/          # Utils, helpers
│   │   ├── hooks/        # useHaptic, useTelegram
│   │   ├── api/          # Base API client
│   │   └── types/        # Global types
│   │
│   ├── assets/           # Static files
│   └── styles/           # Global CSS, tokens
│
├── public/
├── index.html
├── vite.config.ts
├── tailwind.config.ts
└── tsconfig.json
```

---

## 3. ⚡ Производительность и Безопасность

### 3.1 Кеширование

| Уровень | Технология | TTL | Что кешируем |
| --------- | ------------ | ----- | -------------- |
| **Browser** | Service Worker | 1h | Static assets |
| **API** | TanStack Query | 5m | Listings, Clubs |
| **Backend** | Redis | 10m | User profiles, Trust scores |
| **DB** | PostgreSQL | - | Materialized views для статистики |

```typescript
// TanStack Query stale/cache config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,     // 5 минут
      gcTime: 30 * 60 * 1000,       // 30 минут
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});
```

### 3.2 Lazy Loading & Code Splitting

```typescript
// Route-based splitting
const ClubsPage = lazy(() => import('@/features/clubs/pages/ClubsPage'));
const MarketPage = lazy(() => import('@/features/market/pages/MarketPage'));

// Component-based splitting
const HeavyChart = lazy(() => import('@/shared/ui/Chart'));

// Image lazy loading
<img loading="lazy" src={url} alt={alt} />
```

```typescript
// Vite chunks config
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          query: ['@tanstack/react-query'],
          ui: ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
  },
});
```

### 3.3 Безопасность

| Угроза | Защита | Реализация |
| -------- | -------- | ------------ |
| **XSS** | Content Security Policy | `<meta>` + headers |
| **CSRF** | Telegram InitData validation | Backend middleware |
| **SQL Injection** | SQLAlchemy ORM | Parameterized queries |
| **Rate Limiting** | Sliding window | Redis + FastAPI middleware |
| **Auth Bypass** | Telegram WebApp hash | `validate_init_data()` |

```python
# Telegram InitData validation (ОБЯЗАТЕЛЬНО)
from hashlib import sha256
import hmac

def validate_init_data(init_data: str, bot_token: str) -> bool:
    """Проверка подписи Telegram WebApp"""
    parsed = parse_qs(init_data)
    check_hash = parsed.pop('hash', [None])[0]
    
    data_check_string = '\n'.join(
        f"{k}={v[0]}" for k, v in sorted(parsed.items())
    )
    
    secret_key = hmac.new(
        b"WebAppData", bot_token.encode(), sha256
    ).digest()
    
    calculated_hash = hmac.new(
        secret_key, data_check_string.encode(), sha256
    ).hexdigest()
    
    return hmac.compare_digest(calculated_hash, check_hash)
```

---

## 4. 📐 Правила разработки

### 4.1 Структура проекта

```bash
subsmarket-2.0/
├── backend/              # Python FastAPI
├── frontend/             # React + Vite
├── docker-compose.yml    # Local dev
├── .env.example          # Environment template
├── .github/
│   └── workflows/        # CI/CD
├── docs/                 # Documentation
│   ├── api/              # OpenAPI specs
│   └── adr/              # Architecture Decision Records
└── PROJECT_MASTER.md     # ЭТО ФАЙЛ
```

### 4.2 Стиль кода

#### Python (Backend)

```python
# pyproject.toml
[tool.ruff]
line-length = 88
select = ["E", "F", "I", "N", "W"]

[tool.mypy]
strict = true
python_version = "3.11"
```

```python
# Правила именования
class UserRepository:  # PascalCase для классов
    async def get_by_id(self, user_id: UUID) -> User | None:  # snake_case для методов
        ...

TRUST_SCORE_MIN = 0.0  # SCREAMING_SNAKE_CASE для констант
TRUST_SCORE_MAX = 5.0
```

#### TypeScript (Frontend)

```json
// .eslintrc
{
  "extends": ["@antfu"],
  "rules": {
    "react/prop-types": "off",
    "no-console": "warn"
  }
}
```

```typescript
// Правила именования
interface UserProfile { }     // PascalCase для типов
const getUserById = () => {}  // camelCase для функций
const MAX_RETRY_COUNT = 3;    // SCREAMING_SNAKE для констант

// Компоненты
const ClubCard: FC<ClubCardProps> = () => {}  // PascalCase
```

### 4.3 Git Conventions

```bash
# Branch naming
main              # Production
develop           # Development
feature/clubs-ui  # New feature
fix/trust-score   # Bug fix
refactor/api      # Refactoring

# Commit messages (Conventional Commits)
feat(clubs): add join request flow
fix(market): correct price validation
refactor(api): extract auth middleware
docs: update PROJECT_MASTER.md
chore: update dependencies
```

### 4.4 Тестирование

| Уровень | Покрытие | Инструменты |
| --------- | ---------- | ------------- |
| **Unit** | 80%+ | pytest / vitest |
| **Integration** | 60%+ | pytest + httpx |
| **E2E** | Critical paths | Playwright |

```python
# Backend test structure
tests/
├── unit/
│   ├── domain/
│   │   └── test_trust_score.py
│   └── application/
│       └── test_join_club.py
├── integration/
│   └── api/
│       └── test_clubs_api.py
└── conftest.py  # Fixtures
```

```typescript
// Frontend test structure
src/
├── features/
│   └── clubs/
│       └── __tests__/
│           ├── ClubCard.test.tsx
│           └── useClubs.test.ts
```

### 4.5 CI/CD Pipeline

```yaml
# .github/workflows/ci.yml
name: CI

on: [push, pull_request]

jobs:
  backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      - run: pip install -e ".[dev]"
      - run: ruff check .
      - run: mypy src/
      - run: pytest --cov=src/

  frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v2
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      - run: pnpm install
      - run: pnpm lint
      - run: pnpm type-check
      - run: pnpm test
      - run: pnpm build
```

---

## 5. 🤖 API Reference

### 5.1 Endpoints Overview

| Module | Endpoint | Method | Description |
| -------- | ---------- | -------- | ------------- |
| **Auth** | `/api/auth/telegram` | POST | Validate Telegram InitData |
| **Clubs** | `/api/clubs` | GET | List all clubs |
| | `/api/clubs` | POST | Create new club |
| | `/api/clubs/{id}/join` | POST | Request to join |
| **Market** | `/api/listings` | GET | List all listings |
| | `/api/listings` | POST | Create listing |
| | `/api/listings/{id}/sold` | PATCH | Mark as sold |
| **Profile** | `/api/users/me` | GET | Get current user |
| | `/api/users/{id}/trust` | GET | Get trust score |

### 5.2 Response Format

```typescript
// Success
{
  "data": T,
  "meta": {
    "timestamp": "2026-02-01T12:00:00Z",
    "requestId": "uuid"
  }
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid price",
    "details": [
      { "field": "price", "message": "Must be between 50 and 500" }
    ]
  },
  "meta": { ... }
}
```

---

## 6. 📋 Чеклист для ИИ-агентов

### @DIRECTOR

- [ ] Разбить задачу на атомарные шаги
- [ ] Делегировать правильному агенту
- [ ] Проверить результат на соответствие Project Bible

### @ARCHITECT

- [ ] Схема соответствует DDD
- [ ] Telecom vs Digital разделены
- [ ] Нет прямого доступа к деньгам

### @PYTHONISTA

- [ ] 100% типизация (no `Any`)
- [ ] 100% async/await
- [ ] Pydantic v2 schemas

### @REACTOR

- [ ] Lazy loading для роутов
- [ ] TanStack Query для API
- [ ] Zod для валидации
- [ ] TWA SDK интегрирован

### @CRITIC (Security Checklist)

- [ ] 🔴 Код трогает деньги? → REJECT
- [ ] 🔴 Plain-text пароли? → REJECT
- [ ] 🔴 Frontend → DB напрямую? → REJECT
- [ ] 🟡 Rate limiting есть?
- [ ] 🟡 Telegram InitData валидируется?

---

## 7. 🛠 Инфраструктура и Деплой

### 7.1 Production Stack

| Компонент | Сервис | Причина |
| ----------- | -------- | --------- |
| Frontend | **Vercel** | Бесплатно, автодеплой, CDN |
| Backend | **Railway** | Простой деплой, $5/mo достаточно |
| Database | **Neon PostgreSQL** | Serverless, бесплатный tier |
| Cache | **Upstash Redis** | Serverless, 10k req/day бесплатно |
| Automation | **n8n** | Self-hosted, workflow автоматизация |

### 7.2 Уведомления

**Канал:** Telegram Bot API (напрямую в ЛС пользователю)

| Событие | Уведомление |
| --------- | ------------- |
| Новая заявка на вступление | → Хосту клуба |
| Заявка одобрена | → Участнику |
| Напоминание об оплате | За 3 дня + в день платежа |
| Сделка подтверждена | Обеим сторонам |
| Жалоба подана | Администратору |

### 7.3 Локализация (i18n)

| Язык | Код |
| ------ | ----- |
| Русский   | `ru` |
| Казахский | `kk` |

- Автоопределение по `language_code` из Telegram
- JSON файлы: `frontend/src/shared/i18n/{ru,kk}.json`

### 7.4 Аналитика

**Сервис:** PostHog (self-hosted или cloud, 1M events/month бесплатно)

**Ключевые метрики:**

- DAU / WAU / MAU
- Сделок в день
- Конверсия: посещение → создание объявления
- Retention (возвращаемость на 1/7/30 день)

### 7.5 Дополнительные функции

| Функция | Статус | Описание |
| --------- | -------- | ---------- |
| Избранное | ✅ Да | Сохранение объявлений в закладки |
| Фильтры | ✅ Да | По оператору, цене, объёму ГБ |
| Полнотекстовый поиск | ✅ Да | Поиск по названию/описанию |
| In-app чат | ❌ Нет | Только Telegram DM |
| Реферальная система | ❌ Нет | Не планируется |
| Telegram Stars | ❌ Нет | Не планируется |

---

## 8. 📚 Дополнительная документация

> Документы сгенерированы на основе анализа 7.5 МБ чат-логов сообщества

| Документ | Описание |
| -------- | -------- |
| [Market Intelligence](data/market_intelligence.md) | Ценовые бенчмарки, персоны пользователей, pain points, anti-fraud |
| [Pricing Database](data/pricing_database.json) | JSON-база цен для интеграции в приложение |
| [User Stories](docs/user_stories.md) | Пользовательские истории с acceptance criteria |
| [Implementation Roadmap](docs/implementation_roadmap.md) | План реализации, схема БД, API endpoints |
| [UI/UX Specs](docs/ui_ux_specs.md) | Wireframes, цветовая система, компоненты |
| [Strings (RU)](docs/strings_ru.md) | Все текстовые строки для i18n |
| [Chat Analysis](data/chat_analysis.md) | Полный анализ 100 частей чат-логов |

### Ключевые инсайты из анализа

- **Рыночные цены:** YouTube Premium 800-1200₸, Netflix 1200-2000₸, Яндекс Плюс 2000-4000₸/год
- **Главная боль:** Мошенничество и неплатежи → Trust Score критически важен
- **Правило сообщества:** "Сначала вступи, потом плати" — золотой стандарт
- **Рекомендация:** Месячная оплата вместо годовой снижает риски
- **Растущий тренд:** AI-подписки (Gemini, Copilot) набирают популярность

---

*Последнее обновление: 2026-02-06*
