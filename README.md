# SubsMarket 2.0

Telegram Mini App для совместных подписок, семейных тарифов, ГБ-маркета и доступов/аккаунтов в Казахстане.

SubsMarket не является escrow, банком или магазином. Деньги идут напрямую между людьми, а платформа задает строгие правила: заявка, выдача доступа, 30 минут на оплату, подтверждение, AuditLog и заморозка спорных ситуаций.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)

## Что это?

SubsMarket — платформа для:

- **Семейных подписок** — YouTube Premium, Yandex Plus, Spotify, Netflix, Apple Music.
- **Семейных тарифов** — Tele2, Beeline, Activ/Kcell, где участники делят общий тариф.
- **ГБ-маркета** — покупка/продажа лишних гигабайтов с учетом срока жизни и комиссий.
- **Доступов/аккаунтов** — Canva, Google One, Microsoft 365, CapCut и другие сервисы с отдельными предупреждениями по рискам.

Основной MVP-принцип: **доступ вперед денег, 30 минут на оплату, все действия зафиксированы**.

## Product Rules

- **No escrow**: платформа не принимает и не хранит деньги.
- **Access before money**: оплата только после выдачи доступа.
- **No markup**: цена места считается автоматически и делится поровну.
- **AuditLog**: ключевые действия пишутся в системную историю.
- **Frozen disputes**: спор замораживает семью и блокирует рискованные действия.
- **Altel ban for GB**: Altel запрещен в ГБ-маркете, потому что не поддерживает прямой перевод ГБ.

## Tech Stack

### Frontend

- React 19 + TypeScript
- Vite 6
- Tailwind CSS
- TanStack Query v5
- React Router v7

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (async)
- PostgreSQL (Neon)
- Alembic
- Telegram Bot API
- DB sweeper for payment timeouts

## Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (или Neon account)

### 1. Clone & Setup

```bash
git clone https://github.com/your-username/subsmarket-2.0.git
cd subsmarket-2.0

# Copy environment variables
cp .env.example .env
# Edit .env with your values
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

### 3. Backend

```bash
cd backend
pip install uv  # Fast package manager
uv pip install -e .

# Run migrations
alembic upgrade head

# Seed database
python -m src.seed

# Start server
uvicorn src.main:app --reload
# API at http://localhost:8000
# Docs at http://localhost:8000/api/docs
```

### 4. Docker (Optional)

```bash
docker-compose up -d
```

## Project Structure

```
subsmarket-2.0/
├── backend/
│   ├── src/
│   │   ├── domain/        # Entities and framework-free rules
│   │   ├── application/   # Use cases and services
│   │   ├── infrastructure/ # DB, Telegram, external adapters
│   │   ├── interface/     # FastAPI routes and schemas
│   │   ├── main.py        # App entry point
│   │   └── config.py      # Settings
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── app/           # App shell and providers
│   │   ├── features/      # Clubs, market, deals, profile
│   │   ├── pages/         # Admin and top-level pages
│   │   ├── shared/        # API client and reusable UI
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── PROJECT_MASTER.md      # Full specification
└── README.md
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Current user profile |
| GET | `/api/v1/subscriptions` | List services |
| GET | `/api/v1/clubs` | List clubs |
| POST | `/api/v1/clubs` | Create club |
| GET | `/api/v1/clubs/{id}` | Club details |
| POST | `/api/v1/clubs/{id}/join` | Join club |
| POST | `/api/v1/clubs/{id}/leave` | Leave club |
| GET | `/api/v1/clubs/{id}/pending` | Host pending requests |
| POST | `/api/v1/clubs/{id}/approve` | Host approves request |
| POST | `/api/v1/clubs/{id}/members/{member_id}/issue-access` | Host issues access and starts timer |
| POST | `/api/v1/clubs/{id}/members/me/paid` | Participant marks payment |
| POST | `/api/v1/clubs/{id}/members/{member_id}/confirm-payment` | Host confirms payment |
| POST | `/api/v1/clubs/{id}/members/me/dispute` | Participant opens dispute |
| GET | `/api/v1/clubs/{id}/audit` | Club audit history |

## Authentication

Uses Telegram WebApp `initData` for authentication:

1. Frontend sends `X-Telegram-Init-Data` header
2. Backend validates HMAC-SHA256 signature
3. User auto-created on first request

## i18n

Supports:

- 🇷🇺 Russian (default)
- 🇰🇿 Kazakh

Language auto-detected from Telegram or browser settings.

## Telegram Mini App

Production test:

1. Create bot via @BotFather
2. Enable Web App mode
3. Set Web App URL to your deployment
4. Open bot → Menu → Launch App

Local Telegram test without deploying every change:

1. Start backend on `http://localhost:8000`.
2. Start Vite on `http://localhost:5173`.
3. Open an HTTPS tunnel to `http://localhost:5173`.
4. Set `APP_BASE_URL` to the tunnel URL for backend notifications.
5. See `docs/LOCAL_TELEGRAM_DEV.md`.

## Deployment

### Recommended: Cloud Run + Neon

1. Setup [Neon](https://neon.tech) PostgreSQL
2. Deploy backend to Cloud Run
3. Deploy frontend to Vercel/Cloudflare Pages
4. Configure Telegram Bot webhook

## 📄 License

MIT

---

Made with ❤️ in Kazakhstan
