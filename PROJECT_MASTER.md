# 📘 SubsMarket: Master Document

> **Единый источник истины для ИИ и разработчиков**  
> Версия: 2.0 | Дата: 2026-02-01

---

## 1. 🎯 Цели проекта

### Миссия

Создать цивилизованную P2P-платформу правил для цифровых услуг в Telegram: семейные подписки, семейные тарифы, ГБ-маркет и доступы/аккаунты.

SubsMarket не является банком, escrow или магазином. Платформа не принимает деньги и не гарантирует качество товара, но фиксирует статусы, действия и системную историю, чтобы снизить хаос Telegram-сделок.

### Ключевые принципы (ЖЕЛЕЗНЫЕ ПРАВИЛА)

| Правило | Описание | Нарушение = REJECT |
| --------- | ---------- | ------------------- |
| **No Escrow** | Платформа НИКОГДА не принимает деньги и не хранит баланс | 🔴 |
| **No Warranty** | Мы не гарантируем работу товара или сервиса | 🔴 |
| **Rules First** | Важные действия проходят через статусы, таймеры и AuditLog | 🔴 |
| **Access Before Money** | Участник платит только после выдачи доступа | 🔴 |
| **No Markup** | Цена места считается автоматически и делится поровну | 🔴 |

### 1.1 Бизнес-правила

#### Модерация и Споры

- **Жалобы** фиксируются как системные события и могут обрабатываться поддержкой + ИИ-модерацией
- **Спор** переводит участника в `disputed`, а клуб/семью в `frozen`
- **Frozen** блокирует новые заявки, принятие, выдачу доступа и подтверждение оплат до решения
- **Бан** при подтверждённом обмане (кидалово, мошенничество)
- **AuditLog** хранит ключевые действия и заменяет ненадежные скриншоты переписок

#### Семейные подписки и тарифы (Clubs)

- Оплата участников → на банк хоста (Kaspi по умолчанию, другие банки опционально)
- Заявка не делает пользователя участником и не занимает место
- Хост сначала пишет пользователю в Telegram, затем принимает заявку
- После принятия статус участника: `invited`
- Таймер оплаты стартует только после ручного действия хоста **Доступ выдан**
- После выдачи доступа статус: `payment_pending`, дедлайн оплаты: 30 минут
- Участник нажимает **Оплатил** → статус `paid`
- Хост подтверждает оплату → статус `active`
- Просрочка оплаты → статус `removed`, место освобождается
- Спор → клуб `frozen`, спорный участник `disputed`
- Реквизиты и Telegram-группа скрыты до статуса, где доступ реально выдан

#### State machine клуба и участника

Клуб:

```text
open -> full/active -> frozen -> closed/deleted
```

Участник:

```text
pending -> invited -> payment_pending -> paid -> active
pending -> rejected
payment_pending -> removed
payment_pending/paid/active -> disputed
```

Прямые и обратные переходы через API запрещены. Правила переходов живут в доменном слое.

#### GB Маркетплейс & Аккаунты

- **P2P модель**: продавец и покупатель договариваются напрямую, платформа фиксирует сделку и статусы
- Для ГБ нужно показывать срок жизни, комиссию оператора и условия перевода до сделки
- **Altel запрещен для ГБ-маркета**: оператор не поддерживает прямой перевод ГБ
- Общие аккаунты без официальной family-механики нельзя выдавать за семейную подписку
- Для AI/общих аккаунтов нужен явный дисклеймер: история и данные могут быть видны другим участникам

#### Платёжные методы

- Банковский перевод по номеру телефона (Kaspi, Halyk, Jusan и др.)
- **Номер телефона обязателен** при создании объявления/клуба
- Никаких переводов на баланс мобильного телефона
- Никаких анонимных реквизитов или реквизитов "третьего человека" без явного предупреждения
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
│        React 19 + TypeScript + Vite + Tailwind + TanStack   │
├─────────────────────────────────────────────────────────────┤
│                          Backend                             │
│        FastAPI + Pydantic v2 + SQLAlchemy + Alembic         │
├─────────────────────────────────────────────────────────────┤
│                         Database                             │
│            PostgreSQL + DB sweeper for payment timers       │
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
│   │   └── external/     # Future integrations
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
| **Backend** | Optional cache | 10m | User profiles, Trust scores |
| **DB** | PostgreSQL | - | Materialized views для статистики |

Redis не используется для MVP-таймера оплаты. Таймер оплаты реализован через DB sweeper внутри FastAPI.

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
| **Rate Limiting** | Sliding window | FastAPI middleware; Redis только как future scale option |
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
| Cache | **Optional Upstash Redis** | Только для будущего кеша/лимитов, не для payment timer |
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
