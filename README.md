# SubsMarket 2.0 🚀

P2P Marketplace for Subscriptions & GB Trading — Telegram Mini App для Казахстана.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![FastAPI](https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)

## 📦 Что это?

SubsMarket — платформа для:

- 🎬 **Групповых подписок** — Netflix, Spotify, YouTube за копейки
- 📱 **Семейных тарифов** — Beeline, Tele2, Altel делим на всех
- 📊 **P2P маркет ГБ** — покупай/продавай интернет-трафик

## 🛠 Tech Stack

### Frontend

- React 19 + TypeScript
- Vite 6
- Tailwind CSS v4
- TanStack Query v5
- React Router v7

### Backend

- Python 3.11+
- FastAPI
- SQLAlchemy 2.0 (async)
- PostgreSQL (Neon)
- Redis

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (или Neon account)
- Redis (опционально)

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

# Run migrations (if using Alembic)
# alembic upgrade head

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

## 📁 Project Structure

```
subsmarket-2.0/
├── backend/
│   ├── src/
│   │   ├── api/           # FastAPI routes
│   │   ├── domain/        # ORM models, enums
│   │   ├── infrastructure/ # DB, auth
│   │   ├── main.py        # App entry point
│   │   ├── config.py      # Settings
│   │   └── seed.py        # Initial data
│   ├── pyproject.toml
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── api/           # API client
│   │   ├── components/    # UI components
│   │   ├── hooks/         # React hooks
│   │   ├── i18n/          # Translations (ru/kk)
│   │   ├── pages/         # Page components
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
├── docker-compose.yml
├── PROJECT_MASTER.md      # Full specification
└── README.md
```

## 🌐 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/v1/users/me` | Current user profile |
| GET | `/api/v1/subscriptions` | List services |
| GET | `/api/v1/clubs` | List clubs |
| POST | `/api/v1/clubs` | Create club |
| GET | `/api/v1/clubs/{id}` | Club details |
| POST | `/api/v1/clubs/{id}/join` | Join club |
| POST | `/api/v1/clubs/{id}/leave` | Leave club |

## 🔐 Authentication

Uses Telegram WebApp `initData` for authentication:

1. Frontend sends `X-Telegram-Init-Data` header
2. Backend validates HMAC-SHA256 signature
3. User auto-created on first request

## 🌍 i18n

Supports:

- 🇷🇺 Russian (default)
- 🇰🇿 Kazakh

Language auto-detected from Telegram or browser settings.

## 📱 Telegram Mini App

To test in Telegram:

1. Create bot via @BotFather
2. Enable Web App mode
3. Set Web App URL to your deployment
4. Open bot → Menu → Launch App

## 🚀 Deployment

### Recommended: Cloud Run + Neon

1. Setup [Neon](https://neon.tech) PostgreSQL
2. Deploy backend to Cloud Run
3. Deploy frontend to Vercel/Cloudflare Pages
4. Configure Telegram Bot webhook

## 📄 License

MIT

---

Made with ❤️ in Kazakhstan
