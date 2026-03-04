# Trust System Documentation

> **Status**: Implemented ✅
> **Version**: 1.0.0
> **Last Updated**: 2026-02-09

## 1. Overview

The Trust System is a reputation mechanism designed to reduce fraud and reward trustworthy users in the P2P marketplace. It assigns every user a **Trust Score** (1.0 - 5.0) which dynamically changes based on their activity (deals, complaints).

### Core Goals

1. **Transparency**: Buyers can see seller reputation instantly.
2. **Anti-Scam**: Automatic restrictions for low-rated users.
3. **Gamification**: Badges reward high activity and quality service.

---

## 2. Business Logic & Rules

### 2.1 Trust Score

- **Range**: `1.00` to `5.00`
- **Initial Score**: `5.00` (for new users)
- **Display Format**: Decimal with 1 place (e.g., "4.8") or detailed (e.g., "4.85").

### 2.2 Score Adjustments (Backend `TrustService`)

| Event | Score Change | Notes |
| :--- | :--- | :--- |
| **Successful Deal** | `+0.10` | Capped at 5.0 max |
| **First Complaint Confirmed** | `-0.50` | Significant penalty |
| **Repeat Complaint Confirmed** | `-1.00` | Severe penalty |
| **Seller Cancellation** | `-0.20` | Minor penalty for flaking |
| **Fraud Ban** | `-> 0.00` | Immediate ban & score wipe |

### 2.3 Reputation Tiers

| Score Range | Status | UI Color | Restrictions |
| :--- | :--- | :--- | :--- |
| **4.5 - 5.0** | Excellent | 🟢 Green | None, eligible for Gold/Platinum |
| **3.0 - 4.4** | Good | 🟡 Yellow | None |
| **2.0 - 2.9** | Warning | 🟠 Orange | "Low Score" warning visible |
| **1.0 - 1.9** | Restricted | 🔴 Red | Cannot create new listings |
| **< 1.0** | Banned | ⚫ Dark Red | Account suspended |

### 2.4 Badges System

Badges are automatically calculated on the frontend based on **Deals Count** and **Trust Score**.

| Badge | Name | Icon | Requirement |
| :--- | :--- | :--- | :--- |
| `newbie` | Новичок | 🆕 | 0 Deals |
| `verified` | Проверенный | ✅ | 10+ Deals & Score ≥ 4.5 |
| `experienced` | Опытный | 🥉 | 50+ Deals & Score ≥ 4.5 |
| `gold` | Золотой | 🥇 | 100+ Deals & Score ≥ 4.8 |
| `platinum` | Платиновый | 💎 | 500+ Deals & Score = 5.0 |

---

## 3. Frontend Architecture

The implementation is split into **Shared UI Components**, **Feature Pages**, and **API Layer**.

### 3.1 Components (`src/shared/ui/`)

#### `<TrustBadge />`

Displays the star rating, score, and main badge.

- **Props**: `trustScore`, `dealsCount`, `size` ('sm', 'md', 'lg'), `compact`, `showDeals`
- **Usage**: Header, User Lists, Deal Cards.
- **Example**:

    ```tsx
    <TrustBadge trustScore={4.8} dealsCount={120} size="md" />
    // Renders: ⭐ 4.8 (120) 🥇
    ```

#### `<TrustBadgeDetailed />`

A comprehensive card used on the Profile page.

- **Features**:
  - Show full score (e.g., 4.85).
  - Displays ALL earned badges.
  - Shows "Success Rate" and "Reports Count".
  - Visual warning block for Low Score interpretation.

#### `<TrustHistoryModal />`

A modal that fetches and displays the history of score changes.

- **Features**:
  - Timeline of events (Deals, Complaints, etc.).
  - Visual indicators (+Green / -Red) for score changes.
  - Scrollable list with dates and notes.
- **API**: Uses `useTrustHistory`.

#### `<ComplaintForm />`

A reusable form component for submitting reports.

- **Fields**:
  - **Reason** (Select): Fraud, Non-payment, Spam, etc.
  - **Description** (Textarea): Min 20 chars.
  - **Evidence** (UrlInput): Screenshots support.
- **Validation**: Built-in validation before submission.

### 3.2 Pages (`src/features/profile/pages/`)

#### `ProfilePage.tsx`

- Integrates `TrustBadgeDetailed`.
- Button "История ›" opens `TrustHistoryModal`.
- Displays Stats (Deals, Volume).

#### `ReportUserPage.tsx` (`/report`)

- Dedicated page for reporting a user.
- Accepts URL params: `target_id`, `username`, `deal_id`.
- Uses `useCreateComplaint` mutation.
- **Route**: `/report`

### 3.3 API Layer (`src/shared/api/trust.ts`)

Uses **TanStack Query** for state management and caching.

| Hook | Method | Endpoint | Cache Key |
| :--- | :--- | :--- | :--- |
| `useTrustScore` | GET | `/trust/score/{userId}` | `['trust', 'score', userId]` |
| `useTrustHistory`| GET | `/trust/score/{userId}/history` | `['trust', 'history', userId]` |
| `useComplaints` | GET | `/trust/complaints` | `['trust', 'complaints', filters]` |
| `useCreateComplaint` | POST | `/trust/complaints` | Invalidates nothing (yet) |
| `useResolveComplaint`| POST | `/trust/complaints/{id}/resolve`| Invalidates `['trust', 'complaints']`|

---

## 4. Backend Integration (Assumed)

The frontend expects the following endpoints to be available on the backend:

- `GET /api/v1/trust/score/{user_id}` -> Returns `{ trust_score: float, deals_count: int, badges: [...] }`
- `GET /api/v1/trust/score/{user_id}/history` -> Returns `{ events: [ { event_type, score_change, ... } ] }`
- `POST /api/v1/trust/complaints` -> Accepts JSON `{ target_id, reason, description, evidence_urls }`

---

## 5. Usage Examples

### How to display a user's reputation

```tsx
import { TrustBadge } from '@/shared/ui';

// Inside a component
<TrustBadge 
    trustScore={user.trust_score} 
    dealsCount={user.p2p_deals_count} 
    size="sm" 
/>
```

### How to report a user

Navigate to the report page with parameters:

```tsx
const navigate = useNavigate();
navigate(`/report?target_id=${seller.id}&username=${seller.username}&deal_id=${currentDeal.id}`);
```

---

## 6. Future Improvements

1. **Notifications**: Integrate Telegram notifications for Score Changes.
2. **Deal Integration**: Add "Report" button directly inside Active Deal chat.
3. **Admin Panel**: Enhance `ComplaintsPage` with evidence viewer (screenshots).
