# 📘 SubsMarket: Master Document

> **Единый источник истины для ИИ и разработчиков**  
> Версия: 2.0 | Дата: 2026-02-01

---

## 1. 🎯 Цели проекта

### Миссия

Создать цивилизованную P2P-платформу для торговли цифровыми услугами в Telegram (семейные подписки, ГБ трафика, аккаунты).

### Ключевые принципы (ЖЕЛЕЗНЫЕ ПРАВИЛА)

| Правило | Описание | Нарушение = REJECT |
|---------|----------|-------------------|
| **No Escrow** | Платформа НИКОГДА не принимает деньги | 🔴 |
| **No Warranty** | Мы не гарантируем работу товара | 🔴 |
| **Passive Platform** | Мы — доска объявлений, не магазин | 🔴 |

---

## 2. 🏗 Архитектура

### 2.1 Общая архитектура

```
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

```
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

```
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
|---------|------------|-----|--------------|
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
|--------|--------|------------|
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

## 4. 🎨 UX/UI Стандарты

### 4.1 Design System (iOS 2026 Style)

#### Цветовая палитра

```css
:root {
  /* Semantic colors */
  --color-primary: #007AFF;
  --color-success: #34C759;
  --color-warning: #FF9500;
  --color-error: #FF3B30;
  
  /* Neutral (Light mode) */
  --color-bg-primary: #FFFFFF;
  --color-bg-secondary: #F2F2F7;
  --color-text-primary: #000000;
  --color-text-secondary: #8E8E93;
  --color-separator: rgba(60, 60, 67, 0.12);
  
  /* Dark mode */
  .dark {
    --color-bg-primary: #000000;
    --color-bg-secondary: #1C1C1E;
    --color-text-primary: #FFFFFF;
    --color-text-secondary: #8E8E93;
    --color-separator: rgba(84, 84, 88, 0.36);
  }
}
```

#### Типографика

```css
:root {
  --font-family: -apple-system, BlinkMacSystemFont, 'SF Pro', sans-serif;
  
  /* Scale */
  --text-xs: 0.6875rem;    /* 11px */
  --text-sm: 0.8125rem;    /* 13px */
  --text-base: 0.9375rem;  /* 15px */
  --text-lg: 1.0625rem;    /* 17px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 2rem;        /* 32px */
}
```

#### Spacing (4px grid)

```css
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-3: 0.75rem;  /* 12px */
--space-4: 1rem;     /* 16px */
--space-5: 1.25rem;  /* 20px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### 4.2 Адаптивность

```typescript
// Breakpoints (mobile-first for TWA)
const breakpoints = {
  sm: '375px',   // iPhone SE
  md: '390px',   // iPhone 14
  lg: '428px',   // iPhone 14 Pro Max
  xl: '768px',   // Tablet (редко в TWA)
};

// Safe Areas для Dynamic Island
const safeAreas = {
  top: 'env(safe-area-inset-top)',
  bottom: 'env(safe-area-inset-bottom)',
  left: 'env(safe-area-inset-left)',
  right: 'env(safe-area-inset-right)',
};
```

### 4.3 Доступность (a11y)

| Требование | Реализация |
|------------|------------|
| **Contrast** | WCAG AA (4.5:1 для текста) |
| **Touch targets** | min 44x44px |
| **Focus states** | Visible focus ring |
| **Screen readers** | aria-labels, roles |
| **Reduced motion** | `prefers-reduced-motion` |

```typescript
// Haptic feedback hook
function useHaptic() {
  const haptic = useTelegramWebApp().HapticFeedback;
  
  return {
    impact: (style: 'light' | 'medium' | 'heavy') => 
      haptic?.impactOccurred(style),
    notification: (type: 'success' | 'warning' | 'error') => 
      haptic?.notificationOccurred(type),
    selection: () => haptic?.selectionChanged(),
  };
}

// Использование
const { impact } = useHaptic();
<Button onClick={() => { impact('light'); handleClick(); }}>
```

### 4.4 Обработка ошибок

```typescript
// Error Boundary
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}

// API Error handling
const useApiMutation = () => {
  const { notification } = useHaptic();
  
  return useMutation({
    onError: (error) => {
      notification('error');
      toast.error(getErrorMessage(error));
    },
    onSuccess: () => {
      notification('success');
    },
  });
};
```

### 4.5 Валидация форм

```typescript
// Zod schemas
const createListingSchema = z.object({
  operator: z.enum(['beeline', 'activ', 'tele2', 'altel']),
  amount: z.number().min(1).max(100),
  price: z.number().min(50).max(500),
  description: z.string().max(200).optional(),
});

// React Hook Form integration
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(createListingSchema),
});

// Inline validation feedback
<Input 
  {...register('price')}
  error={errors.price?.message}
  hint="Рекомендуемая цена: 100-150₸ за ГБ"
/>
```

---

## 5. 📐 Правила разработки

### 5.1 Структура проекта

```
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

### 5.2 Стиль кода

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

### 5.3 Git Conventions

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

### 5.4 Тестирование

| Уровень | Покрытие | Инструменты |
|---------|----------|-------------|
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

### 5.5 CI/CD Pipeline

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

## 6. 🤖 API Reference

### 6.1 Endpoints Overview

| Module | Endpoint | Method | Description |
|--------|----------|--------|-------------|
| **Auth** | `/api/auth/telegram` | POST | Validate Telegram InitData |
| **Clubs** | `/api/clubs` | GET | List all clubs |
| | `/api/clubs` | POST | Create new club |
| | `/api/clubs/{id}/join` | POST | Request to join |
| **Market** | `/api/listings` | GET | List all listings |
| | `/api/listings` | POST | Create listing |
| | `/api/listings/{id}/sold` | PATCH | Mark as sold |
| **Profile** | `/api/users/me` | GET | Get current user |
| | `/api/users/{id}/trust` | GET | Get trust score |

### 6.2 Response Format

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

## 7. 📋 Чеклист для ИИ-агентов

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

### @PICASSO

- [ ] iOS HIG 2026 соблюдён
- [ ] Haptic на каждое действие
- [ ] Нет glassmorphism/blur
- [ ] Safe Areas учтены

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

*Последнее обновление: 2026-02-01*
