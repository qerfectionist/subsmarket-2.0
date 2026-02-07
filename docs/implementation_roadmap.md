# 🏗️ SubsMarket: Implementation Roadmap
>
> Детальный план реализации на основе анализа рынка
> Дата: 2026-02-06

---

## 📅 Phase 1: MVP (4 недели)

### Неделя 1-2: Backend Core

#### День 1-3: Настройка проекта

- [ ] Инициализация FastAPI проекта с DDD-структурой
- [ ] Настройка Neon PostgreSQL (миграции Alembic)
- [ ] Настройка Redis для кэширования
- [ ] Настройка CI/CD (GitHub Actions)

#### День 4-7: Domain Layer

```python
# Entities
- User (telegram_id, phone, trust_score, created_at)
- Club (name, service_type, price, max_members, payment_day, host_id)
- ClubMember (club_id, user_id, joined_at, status)
- JoinRequest (club_id, user_id, status, message)

# Value Objects
- TrustScore (value: Decimal, deals_count: int)
- Money (amount: int, currency: str = "KZT")
- PhoneNumber (value: str, bank: str = "kaspi")
```

#### День 8-10: Application Layer

- [ ] CreateClub command
- [ ] JoinClub command
- [ ] ApproveJoinRequest command
- [ ] GetClubs query (с фильтрами)
- [ ] GetUserProfile query

#### День 11-14: Infrastructure Layer

- [ ] Telegram WebApp validation middleware
- [ ] SQLAlchemy repositories
- [ ] Redis cache adapter
- [ ] Telegram Bot notifications (aiogram)

### Неделя 3-4: Frontend Core

#### День 15-17: Настройка проекта

- [ ] Инициализация Vite + React 19 + TypeScript
- [ ] Настройка Tailwind v4
- [ ] Интеграция Telegram WebApp SDK
- [ ] Настройка TanStack Query

#### День 18-21: UI Kit

```typescript
// Shared Components
- Button (primary, secondary, danger variants)
- Card (with hover effects, glassmorphism)
- Avatar (with trust score badge)
- Badge (verified, gold, platinum)
- Input, Select, TextArea
- Modal, Sheet (bottom sheet для mobile)
- Skeleton (для loading states)
```

#### День 22-25: Features

- [ ] ClubList (список семей с фильтрами)
- [ ] ClubCard (карточка семьи)
- [ ] ClubDetail (детальная страница)
- [ ] JoinRequest modal
- [ ] UserProfile (свой профиль)
- [ ] CreateClub form

#### День 26-28: Integration

- [ ] API клиент для backend
- [ ] Telegram haptic feedback
- [ ] Push-уведомления через Telegram Bot
- [ ] Testing & bug fixes

---

## 📅 Phase 2: GB Marketplace (2 недели)

### Неделя 5: Backend

#### Domain Layer

```python
# Entities
- Listing (seller_id, operator, gb_amount, price, status)
- Transaction (listing_id, buyer_id, status, completed_at)

# Events
- ListingCreated
- ListingSold
- TransactionCompleted
```

#### Application Layer

- [ ] CreateListing command
- [ ] MarkAsSold command
- [ ] ConfirmTransaction command
- [ ] GetListings query (с фильтрами по оператору)

### Неделя 6: Frontend

- [ ] MarketList (список объявлений)
- [ ] ListingCard (карточка объявления)
- [ ] CreateListing form
- [ ] BuyFlow (процесс покупки)
- [ ] TransactionConfirmation modal

---

## 📅 Phase 3: Trust & Notifications (2 недели)

### Неделя 7: Trust System

#### Backend

- [ ] TrustService (пересчёт рейтинга)
- [ ] BadgeService (присвоение бейджей)
- [ ] Anti-abuse checks (min сумма, уникальные пары)
- [ ] Complaint handling

#### Frontend

- [ ] TrustBadge component
- [ ] ProfileStats (статистика сделок)
- [ ] ComplaintForm modal

### Неделя 8: Notifications

#### Backend

- [ ] NotificationService
- [ ] Payment reminders (3 дня + день платежа)
- [ ] JoinRequest notifications
- [ ] Transaction notifications

#### Celery/APScheduler

- [ ] Cron job для напоминаний
- [ ] Очередь уведомлений

---

## 📅 Phase 4: Polish & Launch (2 недели)

### Неделя 9: UX Polish

- [ ] Animations (Framer Motion)
- [ ] Empty states
- [ ] Error handling & retry
- [ ] Skeleton loaders
- [ ] Haptic feedback optimization

### Неделя 10: Testing & Deploy

- [ ] E2E tests (Playwright)
- [ ] Load testing
- [ ] Security audit
- [ ] Deploy to Vercel (frontend) + Railway (backend)
- [ ] Bot registration в Telegram
- [ ] Soft launch (beta testers)

---

## 🗂️ Database Schema (MVP)

```sql
-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT UNIQUE NOT NULL,
    username VARCHAR(255),
    first_name VARCHAR(255),
    phone VARCHAR(20),
    phone_bank VARCHAR(50) DEFAULT 'kaspi',
    trust_score DECIMAL(2,1) DEFAULT 5.0,
    deals_count INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Clubs (Family Subscriptions)
CREATE TABLE clubs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    service_type VARCHAR(50) NOT NULL, -- youtube_premium, netflix, etc.
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price INT NOT NULL, -- в тенге
    max_members INT NOT NULL DEFAULT 6,
    payment_day INT NOT NULL, -- 1-28
    region VARCHAR(10), -- KZ, RU, TR, etc.
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Club Members
CREATE TABLE club_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) DEFAULT 'member', -- host, member
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    last_payment_at TIMESTAMPTZ,
    UNIQUE(club_id, user_id)
);

-- Join Requests
CREATE TABLE join_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    club_id UUID REFERENCES clubs(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, rejected
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    UNIQUE(club_id, user_id)
);

-- GB Listings
CREATE TABLE listings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES users(id) ON DELETE CASCADE,
    operator VARCHAR(20) NOT NULL, -- altel, activ, tele2, beeline
    gb_amount INT NOT NULL,
    price INT NOT NULL, -- в тенге
    status VARCHAR(20) DEFAULT 'active', -- active, reserved, sold, expired
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    sold_at TIMESTAMPTZ
);

-- Transactions
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    listing_id UUID REFERENCES listings(id),
    club_id UUID REFERENCES clubs(id),
    buyer_id UUID REFERENCES users(id),
    seller_id UUID REFERENCES users(id),
    amount INT NOT NULL,
    type VARCHAR(20) NOT NULL, -- listing, club_payment
    status VARCHAR(20) DEFAULT 'pending', -- pending, completed, cancelled, disputed
    buyer_confirmed BOOLEAN DEFAULT FALSE,
    seller_confirmed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Trust Events (for audit)
CREATE TABLE trust_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- deal_completed, complaint_confirmed, etc.
    score_change DECIMAL(2,1) NOT NULL,
    related_transaction_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Complaints
CREATE TABLE complaints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id),
    target_id UUID REFERENCES users(id),
    transaction_id UUID REFERENCES transactions(id),
    reason VARCHAR(50) NOT NULL,
    description TEXT,
    evidence_urls TEXT[], -- screenshots
    status VARCHAR(20) DEFAULT 'pending', -- pending, investigating, confirmed, rejected
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_clubs_service_type ON clubs(service_type);
CREATE INDEX idx_clubs_region ON clubs(region);
CREATE INDEX idx_clubs_is_active ON clubs(is_active);
CREATE INDEX idx_listings_operator ON listings(operator);
CREATE INDEX idx_listings_status ON listings(status);
CREATE INDEX idx_users_telegram_id ON users(telegram_id);
```

---

## 🔌 API Endpoints (MVP)

### Auth

```
POST /api/auth/telegram    # Validate Telegram InitData
```

### Users

```
GET  /api/users/me         # Get current user profile
GET  /api/users/:id        # Get user profile by ID
PATCH /api/users/me        # Update profile (phone, bank)
```

### Clubs

```
GET  /api/clubs            # List clubs (filters: service, region, has_space)
POST /api/clubs            # Create club
GET  /api/clubs/:id        # Get club details
PATCH /api/clubs/:id       # Update club (host only)
DELETE /api/clubs/:id      # Delete club (host only)

POST /api/clubs/:id/join   # Request to join
GET  /api/clubs/:id/requests # List join requests (host only)
POST /api/clubs/:id/requests/:rid/approve # Approve request
POST /api/clubs/:id/requests/:rid/reject  # Reject request
DELETE /api/clubs/:id/members/:uid # Remove member (host only)
```

### Listings

```
GET  /api/listings         # List listings (filters: operator, min_gb, max_price)
POST /api/listings         # Create listing
GET  /api/listings/:id     # Get listing details
PATCH /api/listings/:id    # Update listing
DELETE /api/listings/:id   # Delete listing

POST /api/listings/:id/buy # Express interest (creates transaction)
```

### Transactions

```
GET  /api/transactions     # My transactions
POST /api/transactions/:id/confirm-buyer   # Buyer confirms
POST /api/transactions/:id/confirm-seller  # Seller confirms
```

### Pricing

```
GET /api/pricing           # Get pricing database
GET /api/pricing/:service  # Get pricing for specific service
```

---

## 📱 Telegram Bot Commands

```python
COMMANDS = [
    BotCommand("start", "Главное меню"),
    BotCommand("clubs", "Мои семьи"),
    BotCommand("market", "Маркетплейс ГБ"),
    BotCommand("create", "Создать клуб"),
    BotCommand("sell", "Продать ГБ"),
    BotCommand("profile", "Мой профиль"),
    BotCommand("prices", "Справочник цен"),
    BotCommand("help", "Помощь"),
]
```

---

## 🎨 Design Tokens

```css
:root {
  /* Colors */
  --color-primary: #6366f1;      /* Indigo */
  --color-primary-dark: #4f46e5;
  --color-secondary: #22c55e;    /* Green for success */
  --color-danger: #ef4444;       /* Red for errors */
  --color-warning: #f59e0b;      /* Amber for warnings */
  
  /* Trust Score Colors */
  --trust-excellent: #22c55e;    /* 4.5-5.0 */
  --trust-good: #eab308;         /* 3.5-4.4 */
  --trust-warning: #f97316;      /* 2.0-3.4 */
  --trust-danger: #ef4444;       /* < 2.0 */
  
  /* Background */
  --bg-primary: #0f172a;         /* Dark slate */
  --bg-secondary: #1e293b;
  --bg-card: rgba(30, 41, 59, 0.8);
  
  /* Text */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  
  /* Borders */
  --border-color: rgba(148, 163, 184, 0.1);
  --border-radius: 12px;
  
  /* Shadows */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  
  /* Glassmorphism */
  --glass-bg: rgba(30, 41, 59, 0.6);
  --glass-blur: blur(12px);
}
```

---

## 📋 Checklist перед Launch

### Backend

- [ ] Все endpoints работают
- [ ] Rate limiting настроен
- [ ] Telegram InitData валидируется
- [ ] Redis кэширование работает
- [ ] Миграции БД применены
- [ ] Логирование настроено
- [ ] Secrets в env variables

### Frontend  

- [ ] Все страницы загружаются
- [ ] Telegram WebApp интегрирован
- [ ] Haptic feedback работает
- [ ] Скелетоны при загрузке
- [ ] Error states отображаются
- [ ] Mobile-first responsive

### Bot

- [ ] Все команды работают
- [ ] Уведомления отправляются
- [ ] Inline mode работает

### DevOps

- [ ] CI/CD настроен
- [ ] Monitoring (Sentry/PostHog)
- [ ] Backup БД
- [ ] SSL сертификаты
